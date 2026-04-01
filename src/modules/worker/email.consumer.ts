import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobName } from 'common/constants/queue.constant';
import { getGlobalWorkerOptions } from 'configs';
import { CustomLogger } from 'loggers/nestToWinstonLogger.service';
import { EmailService } from 'modules/email/email.service';

@Processor('email-queue')
export class EmailConsumer extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
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
        case JobName.ResetPassword: {
          this.logger.log(`📩 Job gửi email xác nhận cho ${job.data.email}`);
          await this.emailService.sendEmailForResetPassword(job.data);
          break;
        }
        default:
          this.logger.warn(`Unhandled job: ${job.name}`, EmailConsumer.name);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error(`Đã xảy ra lỗi khi send email: ${error.message}`);
      throw error;
    }
  }
}
