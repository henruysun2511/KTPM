import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Setting, SettingDocument } from '../schemas/setting.schema';

@Injectable()
export class SettingRepository {
  constructor(@InjectModel(Setting.name) private settingModel: Model<SettingDocument>) {}

  async findOne(): Promise<SettingDocument | null> {
    // Luôn lấy bản ghi đầu tiên vì hệ thống chỉ có 1 cấu hình chung
    return this.settingModel.findOne().exec();
  }

  async update(updateData: any): Promise<SettingDocument | null> {
    // Nếu chưa có record nào thì tạo mới, có rồi thì cập nhật (upsert)
    const existing = await this.findOne();
    if (!existing) {
      return this.settingModel.create(updateData);
    }
    return this.settingModel.findByIdAndUpdate(existing._id, { $set: updateData }, { new: true }).exec();
  }
}
