import { BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';

export const checkMongoId = (_id: string) => {
  if (!mongoose.isValidObjectId(_id)) throw new BadRequestException(' Id không hợp lệ');
};
