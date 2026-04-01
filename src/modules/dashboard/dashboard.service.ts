import { Injectable } from '@nestjs/common';
import { ArtistService } from 'modules/artist/services/artist.service';
import { RevenueService } from 'modules/revenue/services/revenue.service';
import { UserService } from 'modules/user/services/user.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userService: UserService,
    private readonly artistService: ArtistService,
    private readonly revenueService: RevenueService
  ) {}

  async getArtistsByYear(year: number) {
    return this.artistService.getArtistsByYear(year);
  }

  async getUserByYear(year: number) {
    return await this.userService.getUsersByYear(year);
  }

  async getRevenueByYear(year: number) {
    return await this.revenueService.getRevenueByYear(year);
  }
}
