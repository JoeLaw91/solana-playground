import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { QueryBlockHeightResponseDto } from './dto/query-block-height-response.dto';
import { QueryBlockInfoRequestDto } from './dto/query-block-info-request.dto';
import { QueryBlockInfoResponseDto } from './dto/query-block-info-response.dto';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('block-height')
  async getBlockHeight(): Promise<QueryBlockHeightResponseDto> {
    try {
      const height = await this.blockchainService.getCurrentBlockHeight();
      return { blockHeight: height.toString() };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('RPC') || errorMessage.includes('network')) {
        throw new InternalServerErrorException(
          'Unable to connect to blockchain network',
        );
      }
      console.error('Block height error:', error);
      throw new InternalServerErrorException(
        'Unable to fetch current block height',
      );
    }
  }

  @Get('block-info/:blockNumber')
  async getBlockInfo(
    @Param() params: QueryBlockInfoRequestDto,
  ): Promise<QueryBlockInfoResponseDto> {
    try {
      // Service returns internal type
      return await this.blockchainService.getBlockInfo(
        BigInt(params.blockNumber),
      );
    } catch (error) {
      // Handle InternalServerErrorException from service layer
      if (error instanceof InternalServerErrorException) {
        if (error.message.includes('timeout')) {
          throw new InternalServerErrorException(
            'Request timeout - blockchain network is slow',
          );
        }
        // Re-throw other InternalServerErrorExceptions as-is
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Handle different types of errors with specific messages
      if (
        errorMessage.includes('Block not found') ||
        errorMessage.includes('slot was skipped')
      ) {
        throw new NotFoundException(
          `Block ${params.blockNumber} not found or was skipped`,
        );
      }

      if (
        errorMessage.includes('RPC connection failed') ||
        errorMessage.includes('network')
      ) {
        throw new InternalServerErrorException(
          'Blockchain network error - please try again later',
        );
      }

      if (errorMessage.includes('timeout')) {
        throw new InternalServerErrorException(
          'Request timeout - blockchain network is slow',
        );
      }

      // Log the actual error for debugging but don't expose internal details
      console.error('Blockchain service error:', error);

      // Generic fallback with hint about the block number
      throw new InternalServerErrorException(
        `Unable to fetch block ${params.blockNumber} - ${errorMessage}`,
      );
    }
  }
}
