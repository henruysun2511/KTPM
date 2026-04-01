import { Module } from '@nestjs/common';
import { LoggerModule } from 'loggers/logger.module';

import { EmailService } from './email.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
