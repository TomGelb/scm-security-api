import { Test, TestingModule } from '@nestjs/testing';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';

describe('ScanController', () => {
  let controller: ScanController;
  let scanService: jest.Mocked<ScanService>;

  beforeEach(async () => {
    scanService = { scanRepository: jest.fn() } as any;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanController],
      providers: [
        { provide: ScanService, useValue: scanService },
      ],
    }).compile();
    controller = module.get<ScanController>(ScanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return scan result for valid request', async () => {
    scanService.scanRepository.mockResolvedValue('scan-result');
    const dto = { url: 'https://github.com/user/repo' };
    const result = await controller.scanRepository(dto as any);
    expect(result).toBe('scan-result');
    expect(scanService.scanRepository).toHaveBeenCalledWith(dto.url);
  });

  it('should propagate errors from scanService', async () => {
    scanService.scanRepository.mockRejectedValue(new Error('scan error'));
    const dto = { url: 'https://github.com/user/repo' };
    await expect(controller.scanRepository(dto as any)).rejects.toThrow('scan error');
  });
});
