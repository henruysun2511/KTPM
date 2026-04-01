import { Controller, Get } from '@nestjs/common';
import { ResponseMessage, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { PurchaseHistoryService } from '../services/purchase-history.service';

@Controller('purchase-history')
export class PurchaseHistoryController {
  constructor(private readonly purchaseHistoryService: PurchaseHistoryService) {}

  @Get('')
  @ResponseMessage('Lấy ra lịc sử mua hàng thành công')
  getPurchasesByUserId(@User() user: IUserRequest) {
    return this.purchaseHistoryService.getPurchaseByUserId(user.userId);
  }
}
