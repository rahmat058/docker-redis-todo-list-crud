import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public readonly client: Redis;
  private readonly defaultTtl: number;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.defaultTtl = Number(this.config.get('CACHE_TTL', 60));

    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });

    this.client.on('connect', () => this.logger.log('Connected to Redis'));
    this.client.on('error', (err) =>
      this.logger.error(`Redis error: ${err.message}`),
    );
  }

  /** Read a JSON value from the cache, returns null on miss/corrupt value. */
  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /** Store a JSON value in the cache with an optional TTL (seconds). */
  async set(key: string, value: unknown, ttl: number = this.defaultTtl) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  /** Delete one or more exact keys. */
  async del(...keys: string[]) {
    if (keys.length) await this.client.del(...keys);
  }

  /** Delete every key matching a glob pattern (uses SCAN, never KEYS). */
  async delByPattern(pattern: string) {
    const keys: string[] = [];
    const stream = this.client.scanStream({ match: pattern, count: 100 });

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk: string[]) => keys.push(...chunk));
      stream.on('end', () => resolve());
      stream.on('error', reject);
    });

    if (keys.length) {
      await this.client.del(...keys);
    }
  }

  ping() {
    return this.client.ping();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
