import { PartialType } from '@nestjs/mapped-types';

import { CreateNewsDto } from './create-news.dto';

// Đồng bộ cách dùng PartialType giống Artist
export class UpdateNewsDto extends PartialType(CreateNewsDto) {}
