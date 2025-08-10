import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [ConfigModule, CacheModule],
  providers: [BlockchainService],
  exports: [BlockchainService],
  controllers: [BlockchainController],
})
export class BlockchainModule { }
