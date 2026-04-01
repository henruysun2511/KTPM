import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { ArtistVerificationService } from '../services/artist-verification.service';
import { CreateArtistVerificationDto, QueryArtistVerificationDto, UpdateArtistVerificationDto } from '../dtos';

@Controller('artist-verifications')
export class ArtistVerificationController {
  constructor(private readonly artistVerificationService: ArtistVerificationService) {}

  @ResponseMessage('Gửi yêu cầu thành công, vui lòng đợi xác nhận')
  @Post('')
  async create(@Body() artistVerificationDto: CreateArtistVerificationDto, @User() user: IUserRequest) {
    return this.artistVerificationService.create(artistVerificationDto, { userId: user.userId });
  }

  @Patch('status/:id')
  @ResponseMessage('Cập nhật thành công')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateArtistVerificationDto, @User() user: IUserRequest) {
    return await this.artistVerificationService.updateStatus(id, dto, user.userId);
  }

  @Get('')
  @ResponseMessage('Lấy ra danh sách thành công')
  async findAll(@Query() query: QueryArtistVerificationDto) {
    return await this.artistVerificationService.findAll(query);
  }
}
