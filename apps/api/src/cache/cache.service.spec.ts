import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { CacheService } from './cache.service';

const CACHE_MANAGER = 'CACHE_MANAGER';

interface MockCacheManager {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
  reset: jest.Mock;
}

interface MockConfigService {
  get: jest.Mock;
}

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: MockCacheManager;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockCacheManager: MockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const mockConfigService: MockConfigService = {
      get: jest
        .fn()
        .mockImplementation((key: string, defaultValue?: unknown) => {
          if (key === 'cache.ttl') return 300;
          return defaultValue;
        }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get<MockCacheManager>(CACHE_MANAGER);

    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateKey', () => {
    it('should generate cache key with prefix only', () => {
      const key = service.generateKey('block');
      expect(key).toBe('block');
    });

    it('should generate cache key with prefix and identifier', () => {
      const key = service.generateKey('block', 12345);
      expect(key).toBe('block:12345');
    });

    it('should handle string identifier', () => {
      const key = service.generateKey('tx', 'hash123');
      expect(key).toBe('tx:hash123');
    });

    it('should handle bigint identifier', () => {
      const key = service.generateKey('block', 12345n);
      expect(key).toBe('block:12345');
    });
  });

  describe('get', () => {
    it('should retrieve value from cache', async () => {
      const mockValue = { data: 'test' };
      cacheManager.get.mockResolvedValue(mockValue);

      const result = await service.get('test:key');

      expect(result).toEqual(mockValue);
      expect(cacheManager.get).toHaveBeenCalledWith('test:key');
    });

    it('should return undefined when key does not exist', async () => {
      cacheManager.get.mockResolvedValue(undefined);

      const result = await service.get('nonexistent:key');

      expect(result).toBeUndefined();
      expect(cacheManager.get).toHaveBeenCalledWith('nonexistent:key');
    });

    it('should handle cache errors gracefully', async () => {
      cacheManager.get.mockRejectedValue(new Error('Cache error'));

      const result = await service.get('error:key');

      expect(result).toBeUndefined();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Cache GET error for key error:key:',
        expect.any(Error),
      );
    });
  });

  describe('set', () => {
    it('should store value in cache with default TTL', async () => {
      const value = { data: 'test' };

      await service.set('test:key', value);

      expect(cacheManager.set).toHaveBeenCalledWith('test:key', value, 300000);
    });

    it('should store value with custom TTL', async () => {
      const value = { data: 'test' };

      await service.set('test:key', value, 600);

      expect(cacheManager.set).toHaveBeenCalledWith('test:key', value, 600000);
    });

    it('should handle cache set errors gracefully', async () => {
      cacheManager.set.mockRejectedValue(new Error('Cache set error'));

      await service.set('error:key', { data: 'test' });

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Cache SET error for key error:key:',
        expect.any(Error),
      );
    });
  });
});
