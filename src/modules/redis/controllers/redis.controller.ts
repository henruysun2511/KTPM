import { Controller } from '@nestjs/common';

import { RedisService } from '../services/redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}
}
