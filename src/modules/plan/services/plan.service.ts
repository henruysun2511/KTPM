import { Injectable } from '@nestjs/common';

import { PlanRepository } from '../repositories/plan.repository';
import { CreatePlanDto } from '../dtos';

@Injectable()
export class PlanService {
  constructor(private readonly planRepo: PlanRepository) {}

  async create(planDto: CreatePlanDto) {
    return await this.planRepo.create(planDto);
  }
  async findById(_id: string) {
    return await this.planRepo.findById(_id);
  }

  async findAll() {
    return await this.planRepo.findAll();
  }
}
