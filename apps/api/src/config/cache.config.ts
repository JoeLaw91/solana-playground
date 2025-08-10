import { registerAs } from '@nestjs/config';

export interface CacheConfig {
  ttl: number;
  max: number;
}

export default registerAs(
  'cache',
  (): CacheConfig => ({
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
    max: parseInt(process.env.MAX_CACHE_SIZE || '1000', 10),
  }),
);
