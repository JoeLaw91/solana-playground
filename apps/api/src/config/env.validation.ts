export interface EnvironmentVariables {
  // Application
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';

  // Cache
  CACHE_TTL: number;
  MAX_CACHE_SIZE: number;
  MAX_BLOCK_INFO_CACHE_SIZE: number;

  // Blockchain
  SOLANA_RPC_URL?: string;
  SOLANA_COMMITMENT?: string;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const nodeEnv = config.NODE_ENV as string;
  const validatedNodeEnv: 'development' | 'production' | 'test' =
    nodeEnv === 'development' || nodeEnv === 'test' ? nodeEnv : 'production';

  const validatedConfig: EnvironmentVariables = {
    PORT: Number(config.PORT) || 3001,
    NODE_ENV: validatedNodeEnv,
    CACHE_TTL: Number(config.CACHE_TTL) || 300,
    MAX_CACHE_SIZE: Number(config.MAX_CACHE_SIZE) || 1000,
    MAX_BLOCK_INFO_CACHE_SIZE: Number(config.MAX_BLOCK_INFO_CACHE_SIZE) || 1000,
    SOLANA_RPC_URL:
      (config.SOLANA_RPC_URL as string) ||
      'https://api.mainnet-beta.solana.com',
    SOLANA_COMMITMENT: (config.SOLANA_COMMITMENT as string) || 'confirmed',
  };

  return validatedConfig;
}
