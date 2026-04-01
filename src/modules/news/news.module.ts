import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NewsController } from './controllers/news.controller';
import { NewsRepository } from './repositories/news.repository';
import { News, NewsSchema } from './schemas/news.schema';
import { NewsService } from './services/news.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }])],
  controllers: [NewsController],
  providers: [NewsService, NewsRepository],
  exports: [NewsService]
})
export class NewsModule {}
