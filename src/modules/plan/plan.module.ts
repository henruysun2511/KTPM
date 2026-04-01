import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Plan, PlanSchema } from './schemas/plan.schema';
import { PlanController } from './controllers/plan.controller';
import { PlanService } from './services/plan.service';
import { PlanRepository } from './repositories/plan.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }])],
  controllers: [PlanController],
  providers: [PlanService, PlanRepository],
  exports: [PlanService]
})
export class PlanModule {}
