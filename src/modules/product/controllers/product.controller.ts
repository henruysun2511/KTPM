import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { ProductService } from '../services/product.service';
import { CreateProductDto, QueryProductDto } from '../dtos';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ResponseMessage('Thêm thành công')
  @Post('')
  async create(@Body() productDto: CreateProductDto, @User() user: IUserRequest) {
    return await this.productService.create(productDto, user);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thành công')
  async update(@Param('id') productId: string, @Body() productDto: CreateProductDto, @User() user: IUserRequest) {
    return await this.productService.update(productId, productDto, user);
  }

  @Public()
  @Get('')
  @ResponseMessage('Lấy danh sách sản phẩm thành công')
  async findAll(@Query() query: QueryProductDto) {
    return await this.productService.findAllProducts(query);
  }

  @Get('me')
  @ResponseMessage('Lấy ra danh sách của sản phẩm thành công')
  async getProductOfMe(@User() user: IUserRequest) {
    return await this.productService.getProductsByUserId(user.userId);
  }

  @Delete(':id')
  @ResponseMessage('Xóa thành công')
  remove(@Param('id') id: string, @User() user: IUserRequest) {
    return this.productService.remove(user.userId, id);
  }
}
