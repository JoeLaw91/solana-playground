import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  /**
   * Get a value from cache
   * @param key - Cache key
   * @returns Cached value or undefined if not found
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      this.logger.debug(
        `Cache GET: ${key} ${value ? 'HIT' : 'MISS'} - Value: ${value ? JSON.stringify(value) : 'undefined'}`,
      );
      return value;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set a value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      let ttlValue = this.configService.get('cache.ttl', 300) * 1000; // Default TTL in milliseconds
      if (ttl) {
        ttlValue = ttl * 1000; // Convert provided TTL to milliseconds
      }
      await this.cacheManager.set(key, value, ttlValue);
      this.logger.debug(
        `Cache SET: ${key} (TTL: ${ttlValue / 1000}s) - Value: ${JSON.stringify(value)}`,
      );
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  /**
   * Generate a cache key for blockchain data
   * @param prefix - Key prefix (e.g., 'block', 'height')
   * @param identifier - Unique identifier (e.g., block number)
   */
  generateKey(prefix: string, identifier?: string | number | bigint): string {
    return identifier ? `${prefix}:${identifier}` : prefix;
  }
}
