import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';

import { PurchaseHistoryRepository } from '../repositories/purchase-history.repository';
import { CreateAddressDto, CreatePurchaseHistoryDto } from '../dtos';

@Injectable()
export class PurchaseHistoryService {
  constructor(private readonly purchaseHistoryRepo: PurchaseHistoryRepository) {}

  async create(purchaseHistoryDto: CreatePurchaseHistoryDto, session?: ClientSession) {
    const { fullName, phone, address, ...purchase } = purchaseHistoryDto;
    const shippingAddress: CreateAddressDto = {
      fullName,
      phone,
      address
    };

    return await this.purchaseHistoryRepo.create({ shippingAddress, ...purchase }, session);
  }

  async getPurchaseByUserId(userId: string) {
    return await this.purchaseHistoryRepo.getPurchaseByUserId(userId);
  }

  async getPurchaseByPaymentIdAndUserId(paymentId: string, userId: string) {
    return await this.purchaseHistoryRepo.getPurchaseByPaymentIdAndUserId(paymentId, userId);
  }
}
