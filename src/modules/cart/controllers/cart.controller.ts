import { Body, Controller, Patch, Get } from '@nestjs/common';
import { ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dtos';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ResponseMessage('Thêm sản phẩm thành công')
  @Patch('')
  async addProduct(@Body() addToCartDto: AddToCartDto, @User() user: IUserRequest) {
    return await this.cartService.addProduct(addToCartDto, user);
  }

  @Patch('remove-product')
  async removeProduct(@Body('productId') productId: string, @User() user: IUserRequest) {
    return await this.cartService.removeProduct(user, productId);
  }

  @Get('me')
  async getMyCart(@User() user: IUserRequest) {
    return await this.cartService.findCartByUserId(user.userId);
  }
}
