import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobName } from 'common/constants';
import { getGlobalWorkerOptions } from 'configs';
import { CustomLogger } from 'loggers/nestToWinstonLogger.service';
import { PaymentService } from 'modules/payments/services/payment.service';

@Processor('payment-product-queue')
export class PaymentProductConsumer extends WorkerHost {
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
        case JobName.SuccessPaymentProduct: {
          const { payment, products } = job.data ?? {};

          if (!payment || !products) {
            throw new Error('Invalid job payload');
          }
          await this.paymentService.processSuccessfulPaymentProduct(payment, products);
          break;
        }
        default:
          this.logger.warn(`Unhandled job: ${job.name}`, PaymentProductConsumer.name);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack, PaymentProductConsumer.name);
      throw error; // rethrow so BullMQ can retry / handle failures}
    }
  }
}
