import { Module } from '@nestjs/common';
import { UserModule } from 'modules/user/user.module';
import { ArtistModule } from 'modules/artist/artist.module';
import { RevenueModule } from 'modules/revenue/revenue.module';

import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [UserModule, ArtistModule, RevenueModule],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
