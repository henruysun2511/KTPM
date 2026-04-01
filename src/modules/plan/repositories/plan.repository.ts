import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Plan } from '../schemas/plan.schema';

@Injectable()
export class PlanRepository {
  constructor(@InjectModel(Plan.name) private readonly planRepo: Model<Plan>) {}

  async create(planData: Partial<Plan>): Promise<Plan> {
    return await this.planRepo.create(planData);
  }

  async findById(_id: string): Promise<Plan | null> {
    return await this.planRepo.findOne({ _id, deleted: false }).lean();
  }

  async findAll(): Promise<Plan[] | []> {
    return await this.planRepo.find({ deleted: false }).lean().exec();
  }
}
