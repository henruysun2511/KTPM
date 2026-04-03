import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlbumModule } from 'modules/album/album.module';
import { PlaylistModule } from 'modules/playlist/playlist.module';
import { SongModule } from 'modules/songs/song.module';

import { RoomController } from './controllers/room.controller';
import { RoomGateway } from './gateways/room.gateway';
import { RoomMessageRepository } from './repositories/room-message.repository';
import { RoomParticipantRepository } from './repositories/room-participant.repository';
import { RoomQueueRepository } from './repositories/room-queue.repository';
import { RoomRepository } from './repositories/room.repository';
import { RoomMessage, RoomMessageSchema } from './schemas/room-message.schema';
import { RoomParticipant, RoomParticipantSchema } from './schemas/room-participant.schema';
import { RoomQueueItem, RoomQueueItemSchema } from './schemas/room-queue-item.schema';
import { Room, RoomSchema } from './schemas/room.schema';
import { RoomService } from './services/room.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: RoomQueueItem.name, schema: RoomQueueItemSchema },
      { name: RoomParticipant.name, schema: RoomParticipantSchema },
      { name: RoomMessage.name, schema: RoomMessageSchema }
    ]),
    JwtModule,
    SongModule,
    PlaylistModule,
    AlbumModule
  ],
  controllers: [RoomController],
  providers: [
    RoomService,
    RoomGateway,
    RoomRepository,
    RoomQueueRepository,
    RoomParticipantRepository,
    RoomMessageRepository
  ],
  exports: [RoomService]
})
export class RoomModule {}
