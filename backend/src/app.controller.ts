import { Controller, Get } from '@nestjs/common';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(private readonly redis: RedisService) {}

  @Get('health')
  async health() {
    let redis: 'up' | 'down' = 'up';
    try {
      await this.redis.ping();
    } catch {
      redis = 'down';
    }

    return {
      status: 'ok',
      redis,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
