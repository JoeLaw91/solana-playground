import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  environment: string;
  origin: string;
}

export default registerAs(
  'app',
  (): AppConfig => ({
    port: parseInt(process.env.PORT || '3001', 10),
    environment: process.env.NODE_ENV || 'development',
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000',
  }),
);
