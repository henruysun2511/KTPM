import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SongModule } from 'modules/songs/song.module';
import { ArtistModule } from 'modules/artist/artist.module';
import { UserModule } from 'modules/user/user.module';
import { PlaylistModule } from 'modules/playlist/playlist.module';
import { AlbumModule } from 'modules/album/album.module';

import { ReportRepository } from './repositories/report.repository';
import { Report, ReportSchema } from './schemas/report.schema';
import { ReportController } from './controllers/report.controller';
import { ReportService } from './services/report.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    SongModule,
    ArtistModule,
    UserModule,
    PlaylistModule,
    AlbumModule
  ],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository]
})
export class ReportModule {}
