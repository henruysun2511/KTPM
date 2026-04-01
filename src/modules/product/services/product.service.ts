import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { IUserRequest } from 'shared/interfaces';
import { RedisService } from 'modules/redis/services/redis.service';
import { checkMongoId } from 'shared/utils';

import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto, QueryProductDto, UpdateProductDto } from '../dtos';
import { buildProductFilterQuery } from '../queries/product.query';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly redisService: RedisService
  ) {}

  async create(productDto: CreateProductDto, user: IUserRequest) {
    try {
      const product = await this.productRepo.create({
        ...productDto,
        createdBy: user.userId
      });

      return product;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Duplicate name
      if (error?.code === 11000) {
        throw new BadRequestException('Tên sản phẩm đã tồn tại');
      }
    }
  }

  async update(_id: string, productDto: UpdateProductDto, user?: IUserRequest) {
    try {
      const product = await this.productRepo.update(_id, {
        ...productDto,
        updatedBy: user?.userId
      });

      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      return product;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('Tên sản phẩm đã tồn tại');
      }
      throw error;
    }
  }

  async findById(_id: string) {
    return await this.productRepo.findById(_id);
  }

  async findByIds(_ids: string[]) {
    return await this.productRepo.findByIds(_ids);
  }

  async updateStock(_id: string, stock: number) {
    return await this.productRepo.updateStock(_id, stock);
  }

  async bulkUpdateStock(updates: { _id: string; stock: number }[], session?: ClientSession) {
    return await this.productRepo.bulkUpdateStock(updates, session);
  }

  async findAllProducts(query: QueryProductDto) {
    const page = query.page || 1;
    const size = query.size || 10;
    const skip = (page - 1) * size;

    const { filter, sort } = buildProductFilterQuery(query);

    const [totalElements, data] = await Promise.all([
      this.productRepo.countDocuments(filter),
      this.productRepo.findAll(filter, skip, size, sort)
    ]);
    const totalPages = Math.ceil(totalElements / size);

    return {
      meta: {
        page,
        size,
        totalPages,
        totalElements
      },
      data
    };
  }

  async getIdAndStock() {
    return await this.productRepo.getIdAndStock();
  }

  async ensureRedisStock(items: { productId: string; quantity: number }[]) {
    for (const item of items) {
      const key = `product:${item.productId}:stock`;
      const exists = await this.redisService.exists(key);
      if (exists === 0) {
        const stock = await this.productRepo.getStockById(item.productId);
        await this.redisService.setValue(key, stock);
      }
    }
  }

  async remove(userId: string, id: string) {
    checkMongoId(id);
    const deleted = await this.productRepo.remove(userId, id);
    if (!deleted) throw new NotFoundException('Sản phẩm không tồn tại hoặc bạn không có quyền xóa');
    return deleted;
  }

  async removeByAdmin(id: string) {
    checkMongoId(id);
    const deleted = await this.productRepo.removeByAdmin(id);
    if (!deleted) throw new NotFoundException('Sản phẩm không tồn tại');
    return deleted;
  }

  async getProductsByUserId(userId: string) {
    return await this.productRepo.getProductsByUserId(userId);
  }
}
