import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JobName, QueueName } from 'common/constants';
import { Payment } from 'modules/payments/schemas/payment.schema';
import { Product } from 'modules/product/schemas/product.schema';

@Injectable()
export class PaymentProductProducer {
  constructor(@InjectQueue(QueueName.PaymentProductQueue) private readonly paymentProductQueue: Queue) {}

  async handleSuccessPaymentProduct(payment: Payment, products: Product[]) {
    await this.paymentProductQueue.add(JobName.SuccessPaymentProduct, { payment, products });
  }
}
