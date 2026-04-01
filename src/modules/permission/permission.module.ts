import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PermissionService } from './services/permission.service';
import { PermissionController } from './controllers/permission.controller';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { PermissionRepository } from './repositories/permission.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Permission.name, schema: PermissionSchema }])],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository],
  exports: [PermissionService]
})
export class PermissionModule {}
