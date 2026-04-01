import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JobName, QueueName } from 'common/constants';
import { Song } from 'modules/songs/schemas/song.schema';

@Injectable()
export class FanoutFollowerProducer {
  constructor(@InjectQueue(QueueName.FanoutFollowerQueue) private readonly fanoutFollowerQueue: Queue) {}

  async fanoutFollower(song: Partial<Song>) {
    await this.fanoutFollowerQueue.add(JobName.ProcessFollowerNotifications, {
      songId: song._id.toString(),
      artistId: song.artistId.toString(),
      songName: song.name
    });
  }
}
