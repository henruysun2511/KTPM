import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueModule } from 'modules/queue/queue.module';
import { GenreModule } from 'modules/genres/genre.module';

import { ArtistService } from './services/artist.service';
import { ArtistController } from './controllers/artist.controller';
import { Artist, ArtistSchema } from './schemas/artist.schema';
import { ArtistRepository } from './repositories/artist.repository';
import { ArtistSearchService } from './services/artist.search.service';
import { ArtistAdminController } from './controllers/artist.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Artist.name, schema: ArtistSchema }]),
    forwardRef(() => QueueModule),
    GenreModule
  ],
  controllers: [ArtistController, ArtistAdminController],
  providers: [ArtistService, ArtistRepository, ArtistSearchService],
  exports: [ArtistService, ArtistSearchService]
})
export class ArtistModule {}
