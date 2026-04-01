import { Body, Controller, Get, Put } from '@nestjs/common';
import { Public, ResponseMessage } from 'shared/decorators/customize';

import { UpdateSettingDto } from '../dtos/update-setting.dto';
import { SettingService } from '../services/setting.service';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Public() // Client có thể lấy được logo/banner mà không cần login
  @Get('')
  @ResponseMessage('Lấy cấu hình hệ thống thành công')
  getSettings() {
    return this.settingService.getSettings();
  }

  @Put('')
  @ResponseMessage('Cập nhật cấu hình hệ thống thành công')
  // Bạn có thể thêm @Roles('ADMIN') ở đây nếu dự án đã có phân quyền
  update(@Body() updateDto: UpdateSettingDto) {
    return this.settingService.updateSettings(updateDto);
  }
}
