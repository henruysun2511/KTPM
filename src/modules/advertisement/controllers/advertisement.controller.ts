import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { AdvertisementService } from '../services/advertisement.service';
import { CreateAdvertisementDto, QueryAdvertisementDto, UpdateAdvertisementDto } from '../dtos';

@Controller('advertisements')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @ResponseMessage('Tạo quảng cáo thành công')
  @Post('')
  create(@Body() advertisementDto: CreateAdvertisementDto, @User() user: IUserRequest) {
    return this.advertisementService.create(advertisementDto, user.userId);
  }

  @Public()
  @Get('')
  @ResponseMessage('Lấy danh sách quảng cáo thành công')
  findAll(@Query() query: QueryAdvertisementDto) {
    return this.advertisementService.findAllAdvertisements(query);
  }

  @Put(':id')
  @ResponseMessage('Chỉnh sửa thông tin quảng cáo thành công')
  update(@Param('id') id: string, @Body() advertisementDtoDto: UpdateAdvertisementDto, @User() user: IUserRequest) {
    return this.advertisementService.updateAdvertisement(id, advertisementDtoDto, user.userId);
  }

  @Delete(':id')
  @ResponseMessage('Xóa quảng cáo thành công')
  remove(@Param('id') id: string, @User() user: IUserRequest) {
    return this.advertisementService.removeAdvertisement(id, user.userId);
  }

  @Patch(':id/activate')
  @ResponseMessage('Kích hoạt quảng cáo thành công')
  activate(@Param('id') id: string) {
    return this.advertisementService.activeAdvertisement(id);
  }

  @Patch(':id/deactivate')
  @ResponseMessage('Vô hiệu hóa quảng cáo thành công')
  deactivate(@Param('id') id: string) {
    return this.advertisementService.deactiveAdvertisement(id);
  }

  @Get('detail/:id')
  @ResponseMessage('Lấy ra thông tin chi tiết thành công')
  getDetail(@Param('id') id: string) {
    return this.advertisementService.getDetail(id);
  }
}
