import { forwardRef, Module } from '@nestjs/common';
import { QueueModule } from 'modules/queue/queue.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtistModule } from 'modules/artist/artist.module';

import { AlbumController } from './controllers/album.controller';
import { AlbumService } from './services/album.service';
import { AlbumRepository } from './repositories/album.repository';
import { Album, AlbumSchema } from './schemas/album.schema';
import { AlbumAdminController } from './controllers/album.admin.controller';
import { AlbumSearchService } from './services/album.search.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Album.name, schema: AlbumSchema }]),
    forwardRef(() => QueueModule),
    ArtistModule
  ],
  controllers: [AlbumController, AlbumAdminController],
  providers: [AlbumService, AlbumRepository, AlbumSearchService],
  exports: [AlbumService, AlbumSearchService]
})
export class AlbumModule {}
