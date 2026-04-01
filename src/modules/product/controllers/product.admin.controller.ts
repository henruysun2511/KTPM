import { Controller, Delete, Param } from '@nestjs/common';
import { ResponseMessage } from 'shared/decorators/customize';

import { ProductService } from '../services/product.service';

@Controller('admin/products')
export class ProductAdminController {
  constructor(private readonly productService: ProductService) {}

  @Delete(':id')
  @ResponseMessage('Xóa thành công')
  remove(@Param('id') id: string) {
    return this.productService.removeByAdmin(id);
  }
}
