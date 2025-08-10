import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  environment: string;
}

export default registerAs(
  'app',
  (): AppConfig => ({
    port: parseInt(process.env.PORT || '3001', 10),
    environment: process.env.NODE_ENV || 'development',
  }),
);
