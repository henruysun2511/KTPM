import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from 'modules/redis/redis.module';

import { QueueModule } from '../queue/queue.module';

import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductRepository } from './repositories/product.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    forwardRef(() => QueueModule),
    RedisModule
  ],
  controllers: [ProductController, ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService]
})
export class ProductModule {}
