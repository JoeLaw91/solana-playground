import { registerAs } from '@nestjs/config';

export interface BlockchainConfig {
  rpcUrl: string;
  defaultCommitment: string;
}

export default registerAs(
  'blockchain',
  (): BlockchainConfig => ({
    rpcUrl: process.env.SOLANA_RPC_URL || '',
    defaultCommitment: process.env.SOLANA_COMMITMENT || 'confirmed',
  }),
);
