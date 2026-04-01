import { Body, Controller, Get, Post } from '@nestjs/common';
import { ResponseMessage } from 'shared/decorators/customize';

import { PlanService } from '../services/plan.service';
import { CreatePlanDto } from '../dtos';

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @ResponseMessage('Tạo thành công')
  @Post('')
  async create(@Body() planDto: CreatePlanDto) {
    return await this.planService.create(planDto);
  }

  @Get('')
  @ResponseMessage('Lấy danh sách gói thành công')
  async getAll() {
    return await this.planService.findAll();
  }
}
