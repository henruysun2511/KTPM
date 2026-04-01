import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductModule } from '../product/product.module';

import { CartService } from './services/cart.service';
import { Cart, CartSchema } from './schemas/cart.schema';
import { CartRepository } from './repositories/cart.repository';
import { CartController } from './controllers/cart.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]), ProductModule],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService]
})
export class CartModule {}
