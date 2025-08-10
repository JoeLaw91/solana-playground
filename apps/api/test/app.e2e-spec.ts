import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import request from 'supertest';
import { QueryBlockInfoResponseDto } from 'src/blockchain/dto/query-block-info-response.dto';
import { QueryBlockHeightResponseDto } from 'src/blockchain/dto/query-block-height-response.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/blockchain', () => {
    it('/blockchain/block-height (GET)', () => {
      return request(app.getHttpServer())
        .get('/blockchain/block-height')
        .expect(200)
        .expect((res) => {
          const body = res.body as QueryBlockHeightResponseDto;
          expect(body).toHaveProperty('blockHeight');
          expect(typeof body.blockHeight).toBe('string');
          expect(Number(body.blockHeight)).toBeGreaterThan(0);
        });
    });

    it('/blockchain/block-info/:blockNumber (GET) - recent valid block', async () => {
      const heightResponse = await request(app.getHttpServer())
        .get('/blockchain/block-height')
        .expect(200);

      const heightBody = heightResponse.body as QueryBlockHeightResponseDto;
      const currentHeight = Number(heightBody.blockHeight);
      const recentValidBlock = currentHeight - 100;
      console.log(`Testing with recent valid block: ${recentValidBlock}`);
      return request(app.getHttpServer())
        .get(`/blockchain/block-info/${recentValidBlock}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as QueryBlockInfoResponseDto;
          expect(body).toHaveProperty('blockHeight');
          expect(body).toHaveProperty('transactionCount');
          expect(body).toHaveProperty('blockTime');
          expect(body).toHaveProperty('blockhash');

          expect(typeof body.blockHeight).toBe('string');
          expect(typeof body.transactionCount).toBe('number');
          expect(typeof body.blockhash).toBe('string');

          if (body.blockTime !== null) {
            expect(typeof body.blockTime).toBe('number');
          }
        });
    });

    it('/blockchain/block-info/:blockNumber (GET) - invalid block number (non-numeric)', () => {
      return request(app.getHttpServer())
        .get('/blockchain/block-info/invalid')
        .expect(500)
        .expect((res) => {
          const body = res.body as { statusCode: number; message: string };
          expect(body).toHaveProperty('statusCode', 500);
          expect(body).toHaveProperty('message');
        });
    });

    it('/blockchain/block-info/:blockNumber (GET) - negative block number', () => {
      return request(app.getHttpServer())
        .get('/blockchain/block-info/-1')
        .expect(500)
        .expect((res) => {
          const body = res.body as { statusCode: number; message: string };
          expect(body).toHaveProperty('statusCode', 500);
          expect(body).toHaveProperty('message');
        });
    });

    it('/blockchain/block-info/:blockNumber (GET) - very large block number (not found)', () => {
      const futureBlockNumber = '999999999999';

      return request(app.getHttpServer())
        .get(`/blockchain/block-info/${futureBlockNumber}`)
        .expect(500)
        .expect((res) => {
          const body = res.body as { statusCode: number; message: string };
          expect(body).toHaveProperty('statusCode', 500);
          expect(body).toHaveProperty('message');
        });
    });

    it('/blockchain/block-info/:blockNumber (GET) - test throttling', async () => {
      const validBlockNumber = '306000000';

      const responses: Array<{ status: number }> = [];
      for (let i = 0; i < 15; i++) {
        try {
          const response = await request(app.getHttpServer()).get(
            `/blockchain/block-info/${validBlockNumber}`,
          );
          responses.push(response);
        } catch {
          responses.push({ status: 500 });
        }
      }

      const throttledCount = responses.filter(
        (res) => res.status === 429,
      ).length;

      // We expect at least some throttling with 15 rapid requests
      expect(throttledCount).toBeGreaterThan(0);
    }, 15000); // Increase timeout for this test
  });

  afterAll(async () => {
    await app.close();
  });
});
