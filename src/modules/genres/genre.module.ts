import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Genre, GenreSchema } from './schemas/genre.schema';
import { GenreRepository } from './repositories/genre.repository';
import { GenreService } from './services/genre.service';
import { GenresController } from './controllers/genre.controller';
import { GenreSearchService } from './services/genre.search.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Genre.name, schema: GenreSchema }])],
  controllers: [GenresController],
  providers: [GenreService, GenreRepository, GenreSearchService],
  exports: [GenreService, GenreSearchService]
})
export class GenreModule {}
