import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Token } from '../schemas/token.schema';
import { OtpAuth } from '../schemas/otp.schema';
import { OtpDto } from '../dtos';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(Token.name) private authRepo: Model<Token>,
    @InjectModel(OtpAuth.name) private otpRepo: Model<OtpAuth>
  ) {}
  async create(tokenData: Token) {
    return await this.authRepo.create(tokenData);
  }

  async deleteByToken(token: string): Promise<void> {
    await this.authRepo.deleteOne({ token });
  }

  async findToken(userId: string, jti: string) {
    return await this.authRepo.findOne({ userId, jti });
  }

  async saveOtp(otpDto: OtpDto) {
    return await this.otpRepo.create(otpDto);
  }

  async findOtp(otpDto: OtpDto) {
    return await this.otpRepo.findOne({ ...otpDto }).lean();
  }

  async deleteOtp(otpDto: OtpDto) {
    await this.otpRepo.deleteOne({ ...otpDto });
  }
}
