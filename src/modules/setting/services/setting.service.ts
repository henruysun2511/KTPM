import { Injectable } from '@nestjs/common';

import { UpdateSettingDto } from '../dtos/update-setting.dto';
import { SettingRepository } from '../repositories/setting.repository';

@Injectable()
export class SettingService {
  constructor(private readonly settingRepo: SettingRepository) {}

  async getSettings() {
    const settings = await this.settingRepo.findOne();
    if (!settings) {
      // Trả về object mặc định nếu chưa bao giờ cấu hình
      return {
        logo: '',
        mainBanner: [],
        contactPhone: '',
        contactEmail: '',
        childrenBanner: {}
      };
    }
    return settings;
  }

  async updateSettings(updateDto: UpdateSettingDto) {
    return await this.settingRepo.update(updateDto);
  }
}
