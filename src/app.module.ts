import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { defaultQueueRegisterOptions } from 'configs';
import { AdvertisementModule } from 'modules/advertisement/advertisement.module';
import { AlbumModule } from 'modules/album/album.module';
import { ArtistVerificationModule } from 'modules/artist-verification/artist-verification.module';
import { ArtistModule } from 'modules/artist/artist.module';
import { CommentModule } from 'modules/comment/comment.module';
import { DashboardModule } from 'modules/dashboard/dashboard.module';
import { FollowModule } from 'modules/follow/follow.module';
import { GenreModule } from 'modules/genres/genre.module';
import { LikeModule } from 'modules/like/like.module';
import { MediaModule } from 'modules/media/media.module';
import { NotificationModule } from 'modules/notification/notification.module';
import { PlayerModule } from 'modules/player/player.module';
import { PlaylistModule } from 'modules/playlist/playlist.module';
import { RedisModule } from 'modules/redis/redis.module';
import { ReportModule } from 'modules/report/report.module';
import { RevenueModule } from 'modules/revenue/revenue.module';
import { SearchModule } from 'modules/search/search.module';
import { WorkerModule } from 'modules/worker/worker.module';
import { NewsModule } from 'modules/news/news.module';
import { SettingModule } from 'modules/setting/setting.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './loggers/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { PaymentModule } from './modules/payments/payment.module';
import { PermissionModule } from './modules/permission/permission.module';
import { PlanModule } from './modules/plan/plan.module';
import { ProductModule } from './modules/product/product.module';
import { PurchaseHistoryModule } from './modules/purchase-history/purchase-history.module';
import { RoleModule } from './modules/role/role.module';
import { SongModule } from './modules/songs/song.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { TaskModule } from './modules/task/task.module';
import { UserModule } from './modules/user/user.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 10
      }
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        maxPoolSize: 10,
        minPoolSize: 2,
        retryAttempts: 5,
        retryDelay: 3000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        heartbeatFrequencyMS: 5000,
        autoIndex: process.env.NODE_ENV !== 'production',
        connectionFactory: (connection) => {
          return connection;
        }
      }),
      inject: [ConfigService]
    }),
    BullModule.forRoot(defaultQueueRegisterOptions),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ScheduleModule.forRoot(),
    SharedModule,
    UserModule,
    AuthModule,
    AlbumModule,
    ArtistVerificationModule,
    DashboardModule,
    FollowModule,
    SongModule,
    SearchModule,
    ArtistModule,
    PaymentModule,
    PlanModule,
    PlaylistModule,
    PlayerModule,
    SubscriptionModule,
    TaskModule,
    ProductModule,
    CloudinaryModule,
    MediaModule,
    NotificationModule,
    CartModule,
    CommentModule,
    PurchaseHistoryModule,
    RoleModule,
    ReportModule,
    RevenueModule,
    PermissionModule,
    GenreModule,
    LoggerModule,
    LikeModule,
    RedisModule,
    AdvertisementModule,
    NewsModule,
    WorkerModule,
    SettingModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
