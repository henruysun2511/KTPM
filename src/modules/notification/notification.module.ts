import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueModule } from 'modules/queue/queue.module';
import { JwtModule } from '@nestjs/jwt';

import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationGateway } from './gateways/notification.gateway';
import { NotificationRepository } from './repositories/notification.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    QueueModule,
    JwtModule
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway, NotificationRepository],
  exports: [NotificationService, NotificationGateway]
})
export class NotificationModule {}
