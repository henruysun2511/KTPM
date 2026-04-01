import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import { Cart } from '../schemas/cart.schema';
import { AddToCartDto } from '../dtos';

@Injectable()
export class CartRepository {
  constructor(@InjectModel(Cart.name) private readonly cartRepo: Model<Cart>) {}

  async create(cartData: Partial<Cart>, options?: { session?: ClientSession }) {
    await this.cartRepo.create([cartData], options);
  }

  async addProduct(cartId: string, addToCartDto: AddToCartDto, price: number) {
    const productId = addToCartDto.productId;
    const quantity = addToCartDto.quantity;
    const totalPrice = quantity * price;
    return this.cartRepo
      .findOneAndUpdate(
        { _id: cartId, 'products.productId': productId },
        {
          $inc: { 'products.$.quantity': quantity, totalPrice: totalPrice },
          $set: { 'products.$.price': price }
        },
        { new: true }
      )
      .then((result) => {
        if (result) return result;

        return this.cartRepo.findByIdAndUpdate(
          cartId,
          { $push: { products: { productId, quantity, price } }, $inc: { totalPrice: price * quantity } },
          { new: true }
        );
      });
  }
  async findCartByUserId(userId: string): Promise<Cart | null> {
    const result = await this.cartRepo
      .aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },

        {
          $lookup: {
            from: 'products',
            let: { productIds: '$products.productId' }, // truyền mảng productId
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', { $map: { input: '$$productIds', as: 'id', in: { $toObjectId: '$$id' } } }]
                  }
                }
              },
              { $project: { name: 1, img: 1 } }
            ],
            as: 'productDocs'
          }
        },

        {
          $addFields: {
            products: {
              $map: {
                input: '$products',
                as: 'p',
                in: {
                  productId: '$$p.productId',
                  quantity: '$$p.quantity',
                  price: '$$p.price',
                  details: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$productDocs',
                          cond: { $eq: ['$$this._id', { $toObjectId: '$$p.productId' }] }
                        }
                      },
                      0
                    ]
                  }
                }
              }
            }
          }
        },

        {
          $addFields: {
            products: {
              $map: {
                input: '$products',
                as: 'p',
                in: {
                  productId: '$$p.productId',
                  quantity: '$$p.quantity',
                  price: '$$p.price',
                  name: '$$p.details.name',
                  img: '$$p.details.img'
                }
              }
            }
          }
        },

        { $project: { productDocs: 0 } }
      ])
      .exec();

    return result && result[0] ? (result[0] as Cart) : null;
  }

  async removeProduct(cartId: string, productId: string, priceToSubtract: number): Promise<Cart> {
    return await this.cartRepo.findByIdAndUpdate(
      cartId,
      { $pull: { products: { productId } }, $inc: { totalPrice: -priceToSubtract } },
      { new: true }
    );
  }

  async getCart(_id: string, userId: string): Promise<Partial<Cart> | null> {
    return await this.cartRepo.findOne({ _id, userId }, { deleted: false }).select('products totalPrice').lean().exec();
  }

  async removeProductsByUserId(
    userId: string,
    productIds: string[],
    priceToSubtract: number,
    options?: { session?: ClientSession }
  ): Promise<Cart> {
    return await this.cartRepo
      .findOneAndUpdate(
        { userId },
        { $pull: { products: { productId: { $in: productIds } } }, $inc: { totalPrice: -priceToSubtract } },
        { new: true, session: options?.session }
      )
      .lean()
      .exec();
  }

  async incrementProductInCart(_id: string, productId: string): Promise<Cart | null> {
    const cart = await this.cartRepo.findById(_id).lean().exec();
    if (!cart) return null;

    const prod = cart.products.find((p) => p.productId.toString() === productId.toString());
    if (!prod) return cart as Cart;

    const unitPrice = prod.price || 0;

    return await this.cartRepo
      .findOneAndUpdate(
        { _id, 'products.productId': productId },
        {
          $inc: { 'products.$.quantity': 1, totalPrice: unitPrice },
          $set: { 'products.$.price': unitPrice }
        },
        { new: true }
      )
      .lean()
      .exec();
  }

  async decrementProductInCart(_id: string, productId: string): Promise<Cart | null> {
    const cart = await this.cartRepo.findById(_id).lean().exec();
    if (!cart) return null;

    const prod = cart.products.find((p) => p.productId.toString() === productId.toString());
    if (!prod) return cart as Cart;

    const unitPrice = prod.price || 0;
    const newQty = prod.quantity - 1;

    if (newQty > 0) {
      return await this.cartRepo
        .findOneAndUpdate(
          { _id, 'products.productId': productId },
          {
            $inc: { 'products.$.quantity': -1, totalPrice: -unitPrice },
            $set: { 'products.$.price': unitPrice }
          },
          { new: true }
        )
        .lean()
        .exec();
    }
  }
}
