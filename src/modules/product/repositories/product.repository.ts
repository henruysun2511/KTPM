/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model, ClientSession, Types } from 'mongoose';

import { Product } from '../schemas/product.schema';

@Injectable()
export class ProductRepository {
  constructor(@InjectModel(Product.name) private readonly productRepo: Model<Product>) {}

  async create(productData: Partial<Product>): Promise<Product> {
    return await this.productRepo.create(productData);
  }

  async update(_id: string, productData: Partial<Product>): Promise<Product> {
    return await this.productRepo.findByIdAndUpdate({ _id }, { ...productData }, { new: true });
  }
  async findById(_id: string): Promise<Product> {
    return await this.productRepo.findOne({ _id, deleted: false }).lean();
  }

  async findAll(
    filter: Record<string, any>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>
  ): Promise<Product[] | []> {
    const f = this.getFilter(filter);
    return await this.productRepo.find(f).sort(sort).skip(skip).limit(limit).lean().exec();
  }

  async countDocuments(filter: Record<string, any>): Promise<number> {
    const f = this.getFilter(filter);
    return this.productRepo.countDocuments(f);
  }

  private getFilter(filter: Record<string, any>): Record<string, any> {
    const { start, end, ...filterFinal } = filter;
    const f: Record<string, any> = { deleted: false, ...filterFinal };
    // build price filter only if start or end provided
    const priceFilter: Record<string, any> = {};
    if (start !== undefined && start !== null && start !== '') priceFilter.$gte = Number(start);
    if (end !== undefined && end !== null && end !== '') priceFilter.$lte = Number(end);
    if (Object.keys(priceFilter).length) f.price = priceFilter;
    return f;
  }

  async updateStock(_id: string, stock: number): Promise<void> {
    await this.productRepo.updateOne({ _id }, { stock });
  }

  async bulkUpdateStock(updates: { _id: string; stock: number }[], session?: ClientSession): Promise<void> {
    const bulkOps = updates.map(({ _id, stock }) => ({
      updateOne: {
        filter: { _id },
        update: { $set: { stock } }
      }
    }));
    // Pass session to bulkWrite so this operation can participate in an existing transaction when provided
    await this.productRepo.bulkWrite(bulkOps, { session });
  }

  async findByIds(_ids: string[]): Promise<Product[]> {
    return await this.productRepo
      .find({
        _id: { $in: _ids },
        deleted: false
      })
      .lean();
  }

  async getStockById(_id: string): Promise<number> {
    const product = await this.productRepo.findOne({ _id, deleted: false }).select('stock').lean().exec();
    return product?.stock ?? 0;
  }

  async getIdAndStock(): Promise<{ productId: string; stock: number }[]> {
    const products = await this.productRepo.find({ deleted: false }).select('_id stock').lean().exec();

    return products.map((p) => ({
      productId: p._id.toString(),
      stock: p.stock
    }));
  }

  async remove(createdBy: string, _id: string): Promise<string | null> {
    const product = await this.productRepo
      .findOneAndUpdate({ createdBy, deleted: false, _id }, { deleted: true })
      .select('_id')
      .lean<{ _id: Types.ObjectId }>()
      .exec();
    return product?._id.toString();
  }

  async removeByAdmin(_id: string) {
    const product = await this.productRepo
      .findOneAndUpdate({ deleted: false, _id }, { deleted: true })
      .select('_id')
      .lean<{ _id: Types.ObjectId }>()
      .exec();
    return product?._id.toString();
  }

  async getProductsByUserId(createdBy: string): Promise<Product[] | []> {
    return await this.productRepo.find({ createdBy, deleted: false }).lean().exec();
  }
}
