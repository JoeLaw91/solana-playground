import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { BlockInfo } from './types/block-info.types';

describe('BlockchainController', () => {
  let controller: BlockchainController;
  let service: BlockchainService;

  const mockBlockInfo: BlockInfo = {
    blockHeight: '100000000',
    transactionCount: 150,
    blockTime: 1691234567,
    blockhash: 'ABCD1234567890EFGH',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainController],
      providers: [
        {
          provide: BlockchainService,
          useValue: {
            getCurrentBlockHeight: jest.fn(),
            getBlockInfo: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BlockchainController>(BlockchainController);
    service = module.get<BlockchainService>(BlockchainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBlockHeight', () => {
    it('should return current block height successfully', async () => {
      const getCurrentBlockHeightSpy = jest
        .spyOn(service, 'getCurrentBlockHeight')
        .mockResolvedValue(100000000n);

      const result = await controller.getBlockHeight();

      expect(result).toEqual({ blockHeight: '100000000' });
      expect(getCurrentBlockHeightSpy).toHaveBeenCalled();
    });

    it('should handle RPC network errors', async () => {
      jest
        .spyOn(service, 'getCurrentBlockHeight')
        .mockRejectedValue(new Error('RPC network error'));

      await expect(controller.getBlockHeight()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(controller.getBlockHeight()).rejects.toThrow(
        'Unable to connect to blockchain network',
      );
    });

    it('should handle generic errors', async () => {
      jest
        .spyOn(service, 'getCurrentBlockHeight')
        .mockRejectedValue(new Error('Unexpected error'));
      jest.spyOn(console, 'error').mockImplementation();

      await expect(controller.getBlockHeight()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(controller.getBlockHeight()).rejects.toThrow(
        'Unable to fetch current block height',
      );
    });
  });

  describe('getBlockInfo', () => {
    const mockParams = { blockNumber: '100000000' };

    it('should return block info successfully', async () => {
      const getBlockInfoSpy = jest
        .spyOn(service, 'getBlockInfo')
        .mockResolvedValue(mockBlockInfo);

      const result = await controller.getBlockInfo(mockParams);

      expect(result).toEqual({
        blockHeight: '100000000',
        transactionCount: 150,
        blockTime: 1691234567,
        blockhash: 'ABCD1234567890EFGH',
      });
      expect(getBlockInfoSpy).toHaveBeenCalledWith(100000000n);
    });

    it('should handle block not found errors', async () => {
      jest
        .spyOn(service, 'getBlockInfo')
        .mockRejectedValue(new Error('Block not found'));

      await expect(controller.getBlockInfo(mockParams)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getBlockInfo(mockParams)).rejects.toThrow(
        'Block 100000000 not found or was skipped',
      );
    });

    it('should handle slot was skipped errors', async () => {
      jest
        .spyOn(service, 'getBlockInfo')
        .mockRejectedValue(new Error('slot was skipped'));

      await expect(controller.getBlockInfo(mockParams)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle RPC network errors', async () => {
      jest
        .spyOn(service, 'getBlockInfo')
        .mockRejectedValue(new Error('RPC connection failed'));

      await expect(controller.getBlockInfo(mockParams)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(controller.getBlockInfo(mockParams)).rejects.toThrow(
        'Blockchain network error - please try again later',
      );
    });

    it('should handle timeout errors', async () => {
      jest
        .spyOn(service, 'getBlockInfo')
        .mockRejectedValue(
          new InternalServerErrorException('Request timeout occurred'),
        );

      await expect(controller.getBlockInfo(mockParams)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(controller.getBlockInfo(mockParams)).rejects.toThrow(
        'Request timeout - blockchain network is slow',
      );
    });

    it('should handle generic errors with block number context', async () => {
      jest
        .spyOn(service, 'getBlockInfo')
        .mockRejectedValue(new Error('Unknown error'));
      jest.spyOn(console, 'error').mockImplementation();

      await expect(controller.getBlockInfo(mockParams)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(controller.getBlockInfo(mockParams)).rejects.toThrow(
        'Unable to fetch block 100000000 - Unknown error',
      );
    });

    it('should convert blockTime to number when it exists', async () => {
      const blockInfoWithTime = { ...mockBlockInfo, blockTime: 1691234567 };
      jest.spyOn(service, 'getBlockInfo').mockResolvedValue(blockInfoWithTime);

      const result = await controller.getBlockInfo(mockParams);

      expect(result.blockTime).toBe(1691234567);
      expect(typeof result.blockTime).toBe('number');
    });

    it('should handle null blockTime', async () => {
      const blockInfoWithoutTime = { ...mockBlockInfo, blockTime: undefined };
      jest
        .spyOn(service, 'getBlockInfo')
        .mockResolvedValue(blockInfoWithoutTime);

      const result = await controller.getBlockInfo(mockParams);

      expect(result.blockTime).toBeUndefined();
    });
  });
});
