import { Controller, Get, Query } from '@nestjs/common';

import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('artists')
  getArtists(@Query('year') year: number) {
    return this.dashboardService.getArtistsByYear(year);
  }

  @Get('users')
  getUsers(@Query('year') year: number) {
    return this.dashboardService.getUserByYear(year);
  }

  @Get('revenue')
  getRevenueByYear(@Query('year') year: number) {
    return this.dashboardService.getRevenueByYear(year);
  }
}
