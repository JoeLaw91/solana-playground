import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSolanaRpc } from '@solana/kit';
import { CacheService } from '../cache/cache.service';
import { BlockInfo } from './types/block-info.types';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private solanaRpc: ReturnType<typeof createSolanaRpc>;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) { }

  onModuleInit() {
    const rpcEndpoint = this.configService.get<string>('blockchain.rpcUrl');

    if (!rpcEndpoint) {
      throw new Error('SOLANA_RPC_URL environment variable is required');
    }

    this.solanaRpc = createSolanaRpc(rpcEndpoint);
    this.logger.log(
      `Blockchain service initialized with endpoint: ${rpcEndpoint}`,
    );
  }

  /**
   * Get the current block height from the Solana network
   */
  async getCurrentBlockHeight(): Promise<bigint> {
    try {
      const result = await this.solanaRpc.getBlockHeight().send();
      this.logger.debug(`Fetched current block height: ${result}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch current block height', error);
      throw new InternalServerErrorException(
        'Unable to fetch current block height',
      );
    }
  }

  /**
   * Get block information with transaction count
   * @param blockNumber - The block number to fetch (optional, defaults to recent block)
   */
  async getBlockInfo(blockNumber: bigint): Promise<BlockInfo> {
    try {
      // Check cache first (only for specific block numbers, not recent blocks)
      const cacheKey = this.cacheService.generateKey('block', blockNumber);
      console.log(`Checking cache for block ${blockNumber}`);
      console.log(`Cache key: ${cacheKey}`);
      const cachedBlock = await this.cacheService.get<BlockInfo>(cacheKey);

      if (cachedBlock) {
        this.logger.debug(`Cache hit for block ${blockNumber}`);
        return cachedBlock;
      }

      const block = await this.solanaRpc
        .getBlock(blockNumber, {
          maxSupportedTransactionVersion: 0,
          transactionDetails: 'signatures', // Only fetch signatures for efficiency
          rewards: false, // Skip rewards to save bandwidth
        })
        .send();

      if (!block) {
        throw new Error(`Block ${blockNumber} not found`);
      }

      const blockInfo: BlockInfo = {
        blockHeight: blockNumber.toString(), // Convert BigInt to string
        transactionCount: block.signatures?.length || 0,
        blockTime: block.blockTime ? Number(block.blockTime) : undefined,
        blockhash: block.blockhash,
      };

      // Cache the result (only for specific block numbers, with longer TTL since they don't change)
      if (blockNumber) {
        const cacheKey = this.cacheService.generateKey('block', blockNumber);
        await this.cacheService.set(cacheKey, blockInfo);
      }

      this.logger.debug(
        `Fetched block ${blockNumber} with ${blockInfo.transactionCount} transactions`,
      );
      return blockInfo;
    } catch (error) {
      this.logger.error(
        `Failed to fetch block info for block ${blockNumber}`,
        error,
      );
      throw new InternalServerErrorException(
        `Unable to fetch block information: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get transaction count for a specific block
   * @param blockNumber - The block number to check
   */
  async getTransactionCount(blockNumber: bigint): Promise<number> {
    const blockInfo = await this.getBlockInfo(blockNumber);
    return blockInfo.transactionCount;
  }
}
