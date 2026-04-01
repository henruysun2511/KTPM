import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { PlayerService } from '../services/player.service';
import { GetNextTrackDto, StartPlayingDto } from '../dtos';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post('start')
  start(@Body() playingDto: StartPlayingDto, @User() user: IUserRequest) {
    return this.playerService.start(playingDto, user);
  }

  @Get('next')
  getNextTrack(@Query() query: GetNextTrackDto, @User() user: IUserRequest) {
    return this.playerService.getNextTrack(query.currentSongId, user);
  }

  @Get('previous')
  previous(@User() user: IUserRequest) {
    return this.playerService.getPrevious(user);
  }

  @Post('play-from-queue')
  playFromQueue(@Body('songId') songId: string, @User() user: IUserRequest) {
    return this.playerService.playFromQueue(songId, user);
  }
}
