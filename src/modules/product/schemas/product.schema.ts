import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'shared/base';
import { WithTimestamps } from 'shared/decorators/customize';

@WithTimestamps()
export class Product extends BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: String, require: true, unique: true })
  name: string;

  @Prop({ required: true })
  stock: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: String, required: true })
  img: string;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
