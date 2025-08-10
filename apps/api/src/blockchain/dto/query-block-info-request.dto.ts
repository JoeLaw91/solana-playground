import { IsNumberString } from 'class-validator';

/**
 * Request DTO for querying block information by block number
 * Extends the shared interface with validation decorators for API use
 */
export class QueryBlockInfoRequestDto {
  /**
   * Block number to query - must be a valid positive integer
   */
  @IsNumberString({}, { message: 'Block number must be a valid number' })
  blockNumber!: string;
}
