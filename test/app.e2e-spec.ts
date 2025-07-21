import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ScanService } from '../src/scan/scan.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ScanService)
      .useValue({ analyzeRepository: jest.fn().mockResolvedValue('mock-scan-result') })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/scm-scanner/scan (POST) should return scan result', async () => {
    const res = await request(app.getHttpServer())
      .post('/scm-scanner/scan')
      .send({ url: 'https://github.com/user/repo' })
      .expect(200);
    expect(res.text).toBe('mock-scan-result');
  });

  it('/scm-scanner/scan (POST) should return 400 for invalid url', async () => {
    const res = await request(app.getHttpServer())
      .post('/scm-scanner/scan')
      .send({ url: 'not-a-url' })
      .expect(400);
    expect(res.body.message).toBeDefined();
  });
});
