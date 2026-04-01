import { Module } from '@nestjs/common';
import redisClient from 'configs/redis.config';

import { RedisService } from './services/redis.service';
import { RedisController } from './controllers/redis.controller';

@Module({
  controllers: [RedisController],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return redisClient;
      }
    },
    RedisService
  ],
  exports: ['REDIS_CLIENT', RedisService]
})
export class RedisModule {}
