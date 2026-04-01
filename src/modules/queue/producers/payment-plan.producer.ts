import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JobName, QueueName } from 'common/constants';
import { IPayosWebhookBodyPayload } from 'modules/payments/dtos';
import { Payment } from 'modules/payments/schemas/payment.schema';
import { Plan } from 'modules/plan/schemas/plan.schema';

@Injectable()
export class PaymentPlanProducer {
  constructor(
    @InjectQueue(QueueName.PaymentPlanQueue)
    private readonly paymentPlanQueue: Queue
  ) {}
  async handleSuccessfulPaymentPlan(payment: Payment, plan: Plan, webhookData: IPayosWebhookBodyPayload) {
    await this.paymentPlanQueue.add(JobName.SuccessPaymentPlan, { payment, plan, webhookData });
  }
}
