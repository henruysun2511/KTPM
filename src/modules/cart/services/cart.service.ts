import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientSession, Types } from 'mongoose';
import { ProductService } from 'modules/product/services/product.service';
import { IUserRequest } from 'shared/interfaces';
import { checkMongoId } from 'shared/utils';

import { CartRepository } from '../repositories/cart.repository';
import { AddToCartDto, CreateCartDto } from '../dtos';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly productService: ProductService
  ) {}

  async create(cartDto: CreateCartDto, options?: { session?: ClientSession }) {
    return await this.cartRepo.create(cartDto, options);
  }

  async addProduct(addToCartDto: AddToCartDto, user: IUserRequest) {
    const [cart, product] = await Promise.all([
      this.cartRepo.findCartByUserId(user.userId),
      this.productService.findById(addToCartDto.productId)
    ]);
    if (!cart) throw new NotFoundException('Giỏ hàng này không tồn tại');
    if (!product) throw new NotFoundException('Sản phẩm này không tồn tại ');
    if (product.stock < addToCartDto.quantity) throw new BadRequestException('Số lượng trong kho không đủ');
    return await this.cartRepo.addProduct(
      cart._id.toString(),
      { productId: addToCartDto.productId, quantity: addToCartDto.quantity },
      product.price
    );
  }

  async removeProduct(user: IUserRequest, productId: string) {
    if (!productId) throw new BadRequestException('Sản phẩm muốn xóa không được để thiếu');
    const cart = await this.cartRepo.findCartByUserId(user.userId);

    if (!cart) throw new NotFoundException('Giỏ hàng này không tồn tại');
    const removedProduct = cart.products.find((p) => p.productId.toString() === productId.toString());
    if (!removedProduct) return cart; // không có thì không cần xóa

    const priceToSubtract = removedProduct.price * removedProduct.quantity;
    return await this.cartRepo.removeProduct(cart._id.toString(), productId, priceToSubtract);
  }

  async getCart(id: string, userId: string) {
    if (!userId) throw new BadRequestException('UserId không được  trống');
    checkMongoId(id);
    checkMongoId(userId);
    return await this.cartRepo.getCart(id, userId);
  }

  async findCartByUserId(userId: string) {
    checkMongoId(userId);
    const cart = await this.cartRepo.findCartByUserId(userId);

    if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');
    return cart;
  }

  async removeProductsByUserId(
    userId: string,
    products: { productId: string | Types.ObjectId; quantity: number }[],
    options?: { session?: ClientSession }
  ) {
    if (!userId) throw new BadRequestException('UserId không được trống');
    checkMongoId(userId);

    const cart = await this.cartRepo.findCartByUserId(userId);
    if (!cart) throw new NotFoundException('Giỏ hàng này không tồn tại');

    const totalToSubtract = products.reduce((sum, p) => {
      const item = cart.products.find((c) => c.productId.toString() === p.productId.toString());
      return sum + (item ? item.price * p.quantity : 0);
    }, 0);

    const productIds = products.map((p) => p.productId.toString());
    return await this.cartRepo.removeProductsByUserId(userId, productIds, totalToSubtract, options);
  }
}
