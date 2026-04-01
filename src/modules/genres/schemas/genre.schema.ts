import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Genre extends BaseSchema {
  @Prop({ type: String, required: true })
  name: string;
}

export const GenreSchema = SchemaFactory.createForClass(Genre);
GenreSchema.index({ name: 'text' });
