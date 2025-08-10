import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { CacheService } from '../cache/cache.service';
import { createSolanaRpc } from '@solana/kit';

// Mock the @solana/kit module
jest.mock('@solana/kit', () => ({
  createSolanaRpc: jest.fn(),
}));

// Define types for mocks
interface MockSolanaRpc {
  getBlockHeight: jest.Mock;
  getBlock: jest.Mock;
}

describe('BlockchainService', () => {
  let service: BlockchainService;
  let configService: ConfigService;
  let cacheService: CacheService;
  let mockSolanaRpc: MockSolanaRpc;
  let mockCreateSolanaRpc: jest.Mock;

  const mockBlockInfo = {
    blockHeight: '100000000',
    transactionCount: 150,
    blockTime: 1691234567,
    blockhash: 'ABCD1234567890EFGH',
  };

  const mockSolanaBlock = {
    signatures: new Array(150).fill('signature'),
    blockTime: 1691234567n,
    blockhash: 'ABCD1234567890EFGH',
  };

  beforeEach(async () => {
    // Create mock RPC with chained methods
    mockSolanaRpc = {
      getBlockHeight: jest.fn().mockReturnValue({
        send: jest.fn().mockResolvedValue(100000000n),
      }),
      getBlock: jest.fn().mockReturnValue({
        send: jest.fn().mockResolvedValue(mockSolanaBlock),
      }),
    };

    // Mock the createSolanaRpc function
    mockCreateSolanaRpc = jest.fn().mockReturnValue(mockSolanaRpc);
    (createSolanaRpc as jest.Mock).mockImplementation(mockCreateSolanaRpc);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'blockchain.rpcUrl')
                return 'https://api.mainnet-beta.solana.com';
              return undefined;
            }),
          },
        },
        {
          provide: CacheService,
          useValue: {
            generateKey: jest.fn().mockReturnValue('block:100000000'),
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
    configService = module.get<ConfigService>(ConfigService);
    cacheService = module.get<CacheService>(CacheService);

    // Suppress console logs during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize the service', () => {
      service.onModuleInit();
    });

    it('should throw error if RPC URL is not configured', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      expect(() => service.onModuleInit()).toThrow(
        'SOLANA_RPC_URL environment variable is required',
      );
    });
  });

  describe('getCurrentBlockHeight', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should return current block height successfully', async () => {
      const result = await service.getCurrentBlockHeight();

      expect(result).toBe(100000000n);
      expect(mockSolanaRpc.getBlockHeight).toHaveBeenCalled();
    });

    it('should handle RPC errors gracefully', async () => {
      mockSolanaRpc.getBlockHeight.mockReturnValue({
        send: jest.fn().mockRejectedValue(new Error('RPC Error')),
      });

      await expect(service.getCurrentBlockHeight()).rejects.toThrow(
        'Unable to fetch current block height',
      );
    });
  });

  describe('getBlockInfo', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should return block info for specific block number', async () => {
      const blockNumber = 100000000n;
      const result = await service.getBlockInfo(blockNumber);

      expect(result).toEqual({
        blockHeight: '100000000',
        transactionCount: 150,
        blockTime: 1691234567,
        blockhash: 'ABCD1234567890EFGH',
      });
    });

    it('should use cache if available', async () => {
      const cacheGetSpy = jest
        .spyOn(cacheService, 'get')
        .mockResolvedValue(mockBlockInfo);

      const blockNumber = 100000000n;
      const result = await service.getBlockInfo(blockNumber);

      expect(result).toEqual(mockBlockInfo);
      expect(cacheGetSpy).toHaveBeenCalledWith('block:100000000');
      expect(mockSolanaRpc.getBlock).not.toHaveBeenCalled();
    });

    it('should cache result after fetching from RPC', async () => {
      const cacheSetSpy = jest.spyOn(cacheService, 'set');

      const blockNumber = 100000000n;
      await service.getBlockInfo(blockNumber);

      expect(cacheSetSpy).toHaveBeenCalledWith(
        'block:100000000',
        expect.objectContaining({
          blockHeight: '100000000',
          transactionCount: 150,
        }),
      );
    });

    it('should handle block not found', async () => {
      mockSolanaRpc.getBlock.mockReturnValue({
        send: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getBlockInfo(100000000n)).rejects.toThrow(
        'Unable to fetch block information',
      );
    });

    it('should handle RPC errors', async () => {
      mockSolanaRpc.getBlock.mockReturnValue({
        send: jest.fn().mockRejectedValue(new Error('Slot was skipped')),
      });

      await expect(service.getBlockInfo(100000000n)).rejects.toThrow(
        'Unable to fetch block information',
      );
    });
  });

  describe('getTransactionCount', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should return transaction count for a block', async () => {
      const result = await service.getTransactionCount(100000000n);
      expect(result).toBe(150);
    });
  });
});
