import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { PlanService } from 'modules/plan/services/plan.service';
import { ProductService } from 'modules/product/services/product.service';
import { PurchaseHistoryService } from 'modules/purchase-history/services/purchase-history.service';
import { CustomLogger } from 'loggers/nestToWinstonLogger.service';
import { IUserRequest } from 'shared/interfaces';
import { AppConfig } from 'common/constants';
import { PaymentStatus, PaymentType, PurchaseHistoryStatus } from 'common/enum';
import { CreatePurchaseHistoryDto } from 'modules/purchase-history/dtos';
import { Plan } from 'modules/plan/schemas/plan.schema';
import { SubscriptionPlan, SubscriptionPlanSchema } from 'modules/subscription/schemas/subscription.schema';
import { PurchaseHistorySchema } from 'modules/purchase-history/schemas/purchase-history.schema';
import { Product } from 'modules/product/schemas/product.schema';
import { generateSignature } from 'shared/utils';
import { UserService } from 'modules/user/services/user.service';
import { IUserContext } from 'shared/interfaces/user-context.interface';
import { CartService } from 'modules/cart/services/cart.service';
import { RedisService } from 'modules/redis/services/redis.service';
import { PaymentPlanProducer } from 'modules/queue/producers';
import { PaymentProductProducer } from 'modules/queue/producers/payment-product.producer';

import { PaymentRepository } from '../repositories/payment.repository';
import {
  CreatePaymentPlanDto,
  CreatePaymentProductDto,
  IPayment,
  IPayosPaymentCancelDto,
  IPayosPaymentCreatedData,
  IPayosRequestPaymentPayload,
  IPayosWebhookBodyPayload,
  ProductOrderDto
} from '../dtos';
import { Payment, PaymentSchema } from '../schemas/payment.schema';

@Injectable()
export class PaymentService {
  private readonly baseUrl = 'https://api-merchant.payos.vn/v2';
  private readonly createPaymentUrl = `${this.baseUrl}/payment-requests`;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly paymentRepo: PaymentRepository,
    private readonly planService: PlanService,
    private readonly productService: ProductService,
    private readonly purchaseHistoryService: PurchaseHistoryService,
    private readonly userService: UserService,
    private readonly cartService: CartService,
    private readonly logger: CustomLogger,
    private readonly redisService: RedisService,
    private readonly paymentPlanProducer: PaymentPlanProducer,
    private readonly paymentProductProducer: PaymentProductProducer,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async getResponsePaymentData(url: string, payload: IPayosRequestPaymentPayload) {
    const response = await firstValueFrom(
      this.httpService.post(url, payload, {
        headers: {
          'x-client-id': this.configService.getOrThrow<string>('PAYOS_CLIENT_ID'),
          'x-api-key': this.configService.getOrThrow<string>('PAYOS_API_KEY')
        }
      })
    );

    return response.data.data;
  }

  async createPaymentPlan(paymentPlanDto: CreatePaymentPlanDto, user: IUserRequest): Promise<IPayosPaymentCreatedData> {
    const plan = await this.planService.findById(paymentPlanDto.planId);
    if (!plan) {
      throw new BadRequestException('Gói đặc quyền này không tồn tại');
    }

    const orderCode = Math.floor(Math.random() * 1e8); // luôn nhỏ hơn 9007199254740991

    const dataForSignature = {
      orderCode,
      amount: plan.price,
      description: `BUY_PLAN_${plan.planName}`,
      cancelUrl: AppConfig.PAYMENT.CANCEL_URL,
      returnUrl: AppConfig.PAYMENT.RETURN_URL
    };

    const signature = generateSignature(dataForSignature, this.configService.getOrThrow<string>('PAYOS_CHECKSUM_KEY'));

    const payload: IPayosRequestPaymentPayload = {
      ...dataForSignature,
      signature
    };

    const reponseData = await this.getResponsePaymentData(this.createPaymentUrl, payload);

    const paymentData: IPayment = {
      transactionId: reponseData.orderCode,
      userId: user.userId,
      amount: reponseData.amount,
      referenceIds: [paymentPlanDto.planId],
      currency: reponseData.currency,
      paymentUrl: reponseData.checkoutUrl,
      status: PaymentStatus.PENDING,
      flow: PaymentType.BUY_PLAN
    };

    await this.paymentRepo.create(paymentData);

    return reponseData;
  }

  private async resolveProducts(paymentProductDto: CreatePaymentProductDto, userId: string) {
    if (paymentProductDto.cartId) {
      // Mua từ cart
      const cart = await this.cartService.getCart(paymentProductDto.cartId, userId);
      if (!cart) {
        throw new BadRequestException('Cart không tồn tại');
      }

      if (cart.products.length === 0) {
        throw new BadRequestException('Cart rỗng');
      }
      const selected = cart.products.filter((item) =>
        paymentProductDto.products.some((p) => p.productId.toString() === item.productId.toString())
      );

      if (selected.length !== paymentProductDto.products.length) {
        throw new BadRequestException('Có sản phẩm không thuộc cart');
      }
    }

    // Mua trực tiếp
    if (!paymentProductDto.products || paymentProductDto.products.length === 0) {
      throw new BadRequestException('Danh sách sản phẩm không hợp lệ');
    }
    return paymentProductDto.products;
  }

  async createPaymentProduct(paymentProductDto: CreatePaymentProductDto, user: IUserContext) {
    const items = paymentProductDto.products.map((p) => ({ productId: p.productId, quantity: p.quantity }));

    await this.productService.ensureRedisStock(items);

    const reserved = await this.redisService.reserveStock(items, 15 * 60 * 1000);
    if (!reserved) throw new Error('Một số sản phẩm không đủ stock');

    const session = await this.connection.startSession();
    await session.startTransaction();

    try {
      // Kiểm tra có phải sản phẩm trong giỏ hàng hay ko
      const productInput = await this.resolveProducts(paymentProductDto, user.userId);

      const productIds = productInput.map((i) => i.productId);

      // Kiểm tra xem có sản phẩm nào ko tồn tại ko
      const products = await this.validateProductsExist(productIds);

      // Tạo Map để tra cứu nhanh thông tin sản phẩm
      const productMap = new Map(products.map((p) => [p._id.toString(), p]));

      // Tính tổng tiền sau khi đã kiểm tra tồn kho
      const totalAmount = this.calculateTotalPrice(productMap, paymentProductDto.products);

      const orderCode = Math.floor(Math.random() * 1e8); // luôn nhỏ hơn 9007199254740991
      const dataForSignature = {
        orderCode: orderCode,
        amount: totalAmount,
        description: productIds[0],
        cancelUrl: `${AppConfig.PAYMENT.CANCEL_URL}/${orderCode}`,
        returnUrl: AppConfig.PAYMENT.RETURN_URL
      };

      const signature = generateSignature(
        dataForSignature,
        this.configService.getOrThrow<string>('PAYOS_CHECKSUM_KEY')
      );
      const payload: IPayosRequestPaymentPayload = {
        ...dataForSignature,
        signature
      };

      const reponseData = await this.getResponsePaymentData(this.createPaymentUrl, payload);

      const paymentData: IPayment = {
        transactionId: reponseData.orderCode,
        userId: user.userId,
        amount: reponseData.amount,
        referenceIds: productIds,
        currency: reponseData.currency,
        paymentUrl: reponseData.checkoutUrl,
        status: PaymentStatus.PENDING,
        flow: PaymentType.BUY_PRODUCT
      };

      const payment = await this.paymentRepo.create(paymentData, session);

      const purchaseData: CreatePurchaseHistoryDto = {
        userId: user.userId,
        paymentId: payment._id.toString(),
        products: paymentProductDto.products,
        address: paymentProductDto.address,
        phone: paymentProductDto.phone,
        fullName: paymentProductDto.fullName
      };
      await this.purchaseHistoryService.create(purchaseData, session);
      await session.commitTransaction();
      return reponseData;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      await session.abortTransaction();
      this.logger.error(`Lỗi khi tạo payment: ${error.message}`, error.stack);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // ❌ Khi người dùng hủy → ta gọi API kiểm tra
  async cancelPayment(orderCode: number) {
    const alreadyCancelled = await this.paymentRepo.findPaymentCancelledById(orderCode);
    if (alreadyCancelled) throw new BadRequestException('Thanh toán này đã bị hủy rồi');

    const url = `${this.baseUrl}/payment-requests/${orderCode}/cancel`;

    const resData = await this.getResponsePaymentData(url, null);

    const data: IPayosPaymentCancelDto = resData as unknown as IPayosPaymentCancelDto;

    if (data?.status === PaymentStatus.CANCELLED.toUpperCase()) {
      await this.paymentRepo.changeStatus(orderCode, PaymentStatus.CANCELLED);

      const payment = await this.paymentRepo.findByTransactionId(orderCode);
      if (payment && payment.flow === PaymentType.BUY_PRODUCT) {
        const purchase = await this.purchaseHistoryService.getPurchaseByPaymentIdAndUserId(
          payment._id.toString(),
          payment.userId.toString()
        );
        if (purchase) await this.redisService.releaseStock(purchase.products);
      }
    }

    return resData;
  }

  async handleWebhook(webhookData: IPayosWebhookBodyPayload) {
    // ✅ Validate payload trước khi xử lý
    if (!webhookData?.data?.orderCode) {
      throw new BadRequestException('Payload webhook không hợp lệ (thiếu orderCode)');
    }

    try {
      const paymentModel = this.connection.model('Payment', PaymentSchema);

      // ✅ 1. Tìm Payment theo transactionId
      const payment = await paymentModel.findOne({ transactionId: webhookData.data.orderCode }).lean<Payment>();

      if (!payment) {
        throw new NotFoundException(`Không tìm thấy giao dịch với mã ${webhookData.data.orderCode}`);
      }

      // ✅ 2. Check idempotent — nếu đã xử lý rồi thì bỏ qua
      if (payment.status === PaymentStatus.SUCCEEDED) {
        this.logger.warn(`Webhook trùng: Giao dịch ${payment.transactionId} đã thành công trước đó`);
        return { received: true };
      }

      // ✅ 3. Check loại giao dịch
      switch (payment.flow) {
        case PaymentType.BUY_PLAN:
          await this.processingPlan(payment, webhookData);
          break;

        case PaymentType.BUY_PRODUCT:
          await this.processingProduct(payment, webhookData);
          break;
      }

      this.logger.log(`Xử lý webhook thành công - orderCode: ${webhookData.data.orderCode}`);
      return { received: true };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error(`Lỗi khi xử lý webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * ✅ Xử lý khi thanh toán mua gói độc quyền thành công
   */
  async processSuccessfulPaymentPlan(payment: Payment, plan: Plan, webhookData: IPayosWebhookBodyPayload) {
    const subscriptionPlanModel = this.connection.model('SubscriptionPlan', SubscriptionPlanSchema);
    const paymentModel = this.connection.model('Payment', PaymentSchema);
    const session = await this.connection.startSession();

    try {
      // Bắt đầu transaction thủ công
      session.startTransaction();

      const userId = payment.userId;

      // Kiểm tra subscription hiện tại
      const existingSub = await subscriptionPlanModel.findOne(
        { userId, planId: payment.referenceIds[0], deleted: false },
        null,
        { session }
      );

      const now = new Date();
      let endDate: Date;

      if (!existingSub) {
        // Tạo subscription mới
        endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + plan.durationInMonths);

        const subscriptionPlanData: SubscriptionPlan = {
          userId,
          planId: payment.referenceIds[0],
          totalPaid: webhookData.data.amount,
          startDate: now,
          endDate
        };

        await subscriptionPlanModel.create([subscriptionPlanData], { session });
        this.logger.log(`Tạo mới subscription cho user ${userId}`);
      } else {
        // Gia hạn subscription cũ
        endDate = new Date(existingSub.endDate);
        endDate.setMonth(endDate.getMonth() + plan.durationInMonths);

        await subscriptionPlanModel.updateOne({ _id: existingSub._id }, { $set: { endDate } }, { session });
        this.logger.log(`Gia hạn subscription cho user ${userId}`);
      }

      // Cập nhật payment
      await paymentModel.updateOne(
        { transactionId: payment.transactionId },
        { $set: { status: PaymentStatus.SUCCEEDED } },
        { session }
      );

      // Cập nhật user premium
      await this.userService.updateIsPremium(userId.toString(), true, session);

      // Commit transaction nếu mọi thứ OK
      await session.commitTransaction();
      this.logger.log(`Payment ${payment.transactionId} đánh dấu thành công`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Nếu có lỗi, rollback transaction
      await session.abortTransaction();
      this.logger.error(`Lỗi khi xử lý payment ${payment.transactionId}: ${error.message}`, error.stack);
      throw error; // re-throw để caller biết
    } finally {
      await session.endSession();
    }
  }

  /**
   * ✅ Xử lý khi thanh toán mua snar phẩm thành công
   */
  async processSuccessfulPaymentProduct(payment: Payment, products: Product[]) {
    const purchaseHistoryModel = this.connection.model('PurchaseHistory', PurchaseHistorySchema);
    const paymentModel = this.connection.model('Payment', PaymentSchema);
    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const purchaseHistory = await purchaseHistoryModel
        .findOne({ paymentId: payment._id })
        .select('products')
        .session(session)
        .lean();
      if (!purchaseHistory) {
        throw new Error('Không tìm thấy thông tin đơn hàng');
      }

      // Tạo map để tra cứu nhanh số lượng sản phẩm từ purchaseHistory
      const quantityMap = new Map(purchaseHistory.products.map((p) => [p.productId.toString(), p.quantity]));

      // Cập nhật stock cho tất cả sản phẩm trong một lần gọi database
      const stockUpdates = products.map((product) => {
        const quantity = quantityMap.get(product._id.toString());
        if (!quantity) {
          throw new Error(`Không tìm thấy số lượng cho sản phẩm ${product._id}`);
        }
        return {
          _id: product._id.toString(),
          stock: product.stock - quantity
        };
      });
      // Gọi bulk update với session để phép rollback trong transaction nếu cần
      await this.productService.bulkUpdateStock(stockUpdates, session);

      // Đồng bộ Redis với giá trị mới từ Mongo
      await this.redisService.syncStocks(stockUpdates.map((u) => ({ productId: u._id.toString(), stock: u.stock })));

      // Cập nhật trạng thái purchase
      await purchaseHistoryModel.updateOne(
        { paymentId: payment._id },
        { status: PurchaseHistoryStatus.CONFIRMED },
        { session }
      );

      // Cập nhật trạng thái giao dịch
      await paymentModel.updateOne(
        { transactionId: payment.transactionId },
        { $set: { status: PaymentStatus.SUCCEEDED } },
        { session }
      );

      // Xóa sản phẩm đó trong giỏ hàng
      await this.cartService.removeProductsByUserId(payment.userId.toString(), purchaseHistory.products, {
        session
      });
      await session.commitTransaction();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      await session.abortTransaction();
      this.logger.error(`Lỗi khi xử lý payment ${payment.transactionId}: ${error.message}`, error.stack);
    } finally {
      await session.endSession();
    }
  }

  /**
   * ❌ Đánh dấu giao dịch khi mua thất bại
   */
  private async markPaymentFailed(payment: Payment) {
    const paymentModel = this.connection.model('Payment', PaymentSchema);
    await paymentModel.updateOne({ transactionId: payment.transactionId }, { $set: { status: PaymentStatus.FAILED } });

    this.logger.warn(`Payment ${payment.transactionId} thất bại`);
  }

  /**
   * Xử lý webhook cho plan
   */
  private async processingPlan(payment: Payment, webhookData: IPayosWebhookBodyPayload) {
    //  Lấy plan
    const plan = await this.planService.findById(payment.referenceIds[0]);
    if (!plan) {
      throw new NotFoundException('Gói đặc quyền không tồn tại');
    }
    //Nếu thanh toán thành công
    if (webhookData.success && webhookData.data?.code === '00') {
      await this.paymentPlanProducer.handleSuccessfulPaymentPlan(payment, plan, webhookData);
    } else {
      await this.markPaymentFailed(payment);
    }
  }

  /**
   * Xử lý webhook cho product
   */
  private async processingProduct(payment: Payment, webhookData: IPayosWebhookBodyPayload) {
    // Kiểm tra xem có sản phẩm nào ko tồn tại ko
    const products = await this.validateProductsExist(payment.referenceIds);

    //Nếu thanh toán thành công
    if (webhookData.success && webhookData.data?.code === '00') {
      await this.paymentProductProducer.handleSuccessPaymentProduct(payment, products);
    } else {
      // thanh toán thất bại, release lại redis
      const purchase = await this.purchaseHistoryService.getPurchaseByPaymentIdAndUserId(
        payment._id.toJSON(),
        payment.userId.toString()
      );
      if (purchase)
        await Promise.all([this.markPaymentFailed(payment), this.redisService.releaseStock(purchase.products)]);
    }
  }

  /**
   * Kiểm tra sản phẩm tồn kho
   */
  private checkInventoryProducts(productMap: Map<string, Product>, products: ProductOrderDto[]) {
    const insufficientStockProduct = products.find((reqProduct) => {
      const product = productMap.get(reqProduct.productId);
      return product.stock < reqProduct.quantity;
    });

    if (insufficientStockProduct) {
      const product = productMap.get(insufficientStockProduct.productId);
      throw new BadRequestException(`Sản phẩm ${product.name} trong kho không đủ`);
    }
  }

  /**
   * Tính tổng tiền sản phẩm
   */
  private calculateTotalPrice(productMap: Map<string, Product>, products: ProductOrderDto[]) {
    const totalAmount = products.reduce((total, reqProduct) => {
      const product = productMap.get(reqProduct.productId);
      return total + product.price * reqProduct.quantity;
    }, 0);
    return totalAmount;
  }

  /**
   * Kiểm tra có sản phẩm ko tồn ko
   */
  private async validateProductsExist(productIds: string[]) {
    const products = await this.productService.findByIds(productIds);
    if (products.length !== productIds.length) {
      throw new BadRequestException('Có sản phẩm không tồn tại ');
    }
    return products;
  }

  /**
   * Xóa các payment sau 10p chưa thanh toán
   */
  async removePaymentWhenExpried() {
    return await this.paymentRepo.removePaymentWhenExpried();
  }

  async getRevenueTotalsByDate(date: Date, flows?: string[]) {
    return await this.paymentRepo.getRevenueTotalsByDate(date, flows);
  }
}
