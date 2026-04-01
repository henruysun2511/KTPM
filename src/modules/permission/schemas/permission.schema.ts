import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HttpMethod } from 'common/enum';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Permission extends BaseSchema {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ enum: HttpMethod, required: true })
  method: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, default: '' })
  description?: string;

  @Prop({ type: String, default: '' })
  module?: string;
}
export const PermissionSchema = SchemaFactory.createForClass(Permission);
