import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JobName, QueueName } from 'common/constants/queue.constant';

@Injectable()
export class EmailProducer {
  constructor(
    @InjectQueue(QueueName.EmailQueue)
    private readonly emailQueue: Queue
  ) {}

  async sendEmail(email: string, otp: string) {
    await this.emailQueue.add(JobName.ResetPassword, { email, otp });
  }
}
