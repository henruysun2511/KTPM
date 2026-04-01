import { PaymentService } from 'modules/payments/services/payment.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobName } from 'common/constants';
import { getGlobalWorkerOptions } from 'configs';
import { CustomLogger } from 'loggers/nestToWinstonLogger.service';

@Processor('payment-plan-queue')
export class PaymentPlanConsumer extends WorkerHost {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly logger: CustomLogger
  ) {
    super();
  }

  getWorkerOptions(): WorkerOptions {
    return getGlobalWorkerOptions();
  }

  async process(job: Job) {
    try {
      switch (job.name) {
        case JobName.SuccessPaymentPlan: {
          const { payment, plan, webhookData } = job.data;
          await this.paymentService.processSuccessfulPaymentPlan(payment, plan, webhookData);
          break;
        }
        default:
          this.logger.warn(`Unhandled job: ${job.name}`, PaymentPlanConsumer.name);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error(
        'Đã xảy ra lỗi khi cập nhật trạng thái mua hàng gói độc quyền',
        error.stack,
        PaymentPlanConsumer.name,
        {
          jobId: job.id
        }
      );
      throw error;
    }
  }
}
