import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentService } from 'modules/payments/services/payment.service';
import { ProductService } from 'modules/product/services/product.service';
import { RedisService } from 'modules/redis/services/redis.service';
import { RevenueService } from 'modules/revenue/services/revenue.service';
import { SongService } from 'modules/songs/services/song.service';
import { SubscriptionService } from 'modules/subscription/services/subscription.service';
import { UserService } from 'modules/user/services/user.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly paymentService: PaymentService,
    private readonly songService: SongService,
    private readonly userService: UserService,
    private readonly revenueService: RevenueService,
    private readonly redisService: RedisService,
    private readonly productService: ProductService
  ) {}
  // mỗi 30p tự động cập nhật lại các subscription sau khi hết hạn
  @Cron(CronExpression.EVERY_30_MINUTES)
  async changeStatusSubscriptionWhenExpired() {
    await this.subscriptionService.changeStatusWhenExpired();
    this.logger.log('Chạy job cập nhật trạng thái subscription');
  }

  // Mỗi 10p tự động xóa các giao dịch chưa được thanh toán
  @Cron(CronExpression.EVERY_10_MINUTES)
  async removePaymentWhenExpried() {
    await this.paymentService.removePaymentWhenExpried();
    this.logger.log('Chạy job xóa các giao dịch chưa thanh toán');
  }

  // Mỗi 10p tự động phát hành bài hát khi đến ngày phát hành
  @Cron(CronExpression.EVERY_10_MINUTES)
  async autoPublishSongs() {
    await this.songService.autoPublishSongs();
    this.logger.log('Chạy job đăng bài hát khí đến ngày phát hành');
  }

  // Cứ 8.00 am cập nhật trạng thái đặc quyền của user
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async autoUpdateIsPremiumUser() {
    const userIds = await this.subscriptionService.findExpiredActivePremiumUserIds();
    await this.userService.updateExpiredPremiumUsers(userIds);
    this.logger.log('Chạy job cập nhật trạng thái đặc quyền của user');
  }

  // Cứ 3.00 cập nhật lại top 10 bài hát nhiều like
  @Cron('0 3 * * *')
  async rebuildLeaderboard() {
    await this.songService.rebuildLeaderboard();
  }

  // Cứ 2.00 mỗi ngày tính doanh thu ngày hôm trước
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async caculatorRevenue() {
    await this.revenueService.create();
  }

  // Sau 15p cập nhật lại stock cho redis
  @Cron('*/14 * * * *')
  async syncRedisStock() {
    const products = await this.productService.getIdAndStock();

    await this.redisService.syncStocks(products);
  }
}
