import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Public, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';
import { Response } from 'express';
import { AppConfig } from 'common/constants';

import { PaymentService } from '../services/payment.service';
import { CreatePaymentPlanDto, CreatePaymentProductDto, IPayosWebhookBodyPayload } from '../dtos';
import { PaymentWebhookGuard } from '../guards/payment.guard';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('plan')
  async createPaymentPlan(@Body() createPaymentDto: CreatePaymentPlanDto, @User() user: IUserRequest) {
    return this.paymentService.createPaymentPlan(createPaymentDto, user);
  }

  @Post('product')
  createPaymentProduct(@Body() createPaymentDto: CreatePaymentProductDto, @User() user: IUserRequest) {
    return this.paymentService.createPaymentProduct(createPaymentDto, user);
  }

  @Post('product/cart')
  async createPaymentProductInCart(@Body() createPaymentDto: CreatePaymentProductDto, @User() user: IUserRequest) {
    return this.paymentService.createPaymentProduct(createPaymentDto, user);
  }

  @Public()
  @Get('cancel')
  async cancelPayment(@Query('orderCode') orderCode: string, @Res() res: Response) {
    const code = Number(orderCode);

    if (!orderCode || isNaN(code)) {
      return res.redirect(`${AppConfig.DOMAIN.FE}/payment/error`);
    }

    await this.paymentService.cancelPayment(code);
    return res.redirect(`${AppConfig.DOMAIN.FE}`);
  }

  @Public()
  @Post('webhook')
  @UseGuards(PaymentWebhookGuard)
  handleWebhook(@Body() body: IPayosWebhookBodyPayload) {
    return this.paymentService.handleWebhook(body);
  }
}
