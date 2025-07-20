import { Test, TestingModule } from '@nestjs/testing';
import { GitleaksService } from './gitleaks.service';

describe('GitleaksService', () => {
  let service: GitleaksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GitleaksService],
    }).compile();

    service = module.get<GitleaksService>(GitleaksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
