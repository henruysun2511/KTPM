import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import { PurchaseHistory } from '../schemas/purchase-history.schema';

@Injectable()
export class PurchaseHistoryRepository {
  constructor(@InjectModel(PurchaseHistory.name) private purchaseHistoryRepo: Model<PurchaseHistory>) {}

  async create(purchaseHistoryData: Partial<PurchaseHistory>, session?: ClientSession): Promise<PurchaseHistory> {
    const [purchase] = await this.purchaseHistoryRepo.create([purchaseHistoryData], { session });
    return purchase;
  }

  async getPurchaseByPaymentIdAndUserId(paymentId: string, userId: string): Promise<PurchaseHistory | null> {
    return await this.purchaseHistoryRepo.findOne({ userId, paymentId, deleted: false }).lean().exec();
  }

  async getPurchaseByUserId(userId: string): Promise<PurchaseHistory | null> {
    const result = await this.purchaseHistoryRepo
      .aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },

        {
          $lookup: {
            from: 'products',
            let: { productIds: '$products.productId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', { $map: { input: '$$productIds', as: 'id', in: '$$id' } }]
                  }
                }
              },
              { $project: { name: 1, img: 1, price: 1 } }
            ],
            as: 'productDocs'
          }
        },

        // map products + attach details (no $toObjectId)
        {
          $addFields: {
            products: {
              $map: {
                input: '$products',
                as: 'p',
                in: {
                  productId: '$$p.productId',
                  quantity: '$$p.quantity',
                  details: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$productDocs',
                          as: 'd',
                          cond: { $eq: ['$$d._id', '$$p.productId'] }
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

        // final shape: take price/name/img from details (compatible với schema)
        {
          $addFields: {
            products: {
              $map: {
                input: '$products',
                as: 'p',
                in: {
                  productId: '$$p.productId',
                  quantity: '$$p.quantity',
                  price: '$$p.details.price',
                  name: '$$p.details.name',
                  img: '$$p.details.img'
                }
              }
            }
          }
        },

        { $project: { productDocs: 0, status: 0, updatedAt: 0 } }
      ])
      .exec();

    return result && result[0] ? (result[0] as PurchaseHistory) : null;
  }
}
