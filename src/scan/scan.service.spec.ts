import { Test, TestingModule } from '@nestjs/testing';
import { ScanService } from './scan.service';
import { IScanner } from '../scanner/scanner.interface';
import { ScmFactoryService } from '../scm/scm.factory';
import { IScm } from '../scm/scm.interface';

describe('ScanService', () => {
  let service: ScanService;
  let scanner: jest.Mocked<IScanner>;
  let scmFactory: jest.Mocked<ScmFactoryService>;
  let scm: jest.Mocked<IScm>;

  beforeEach(async () => {
    scanner = { scanRepository: jest.fn() } as any;
    // Set the constructor name for the mock using a real function
    function MockedObjectService() {}
    Object.defineProperty(MockedObjectService, 'name', { value: 'MockedObjectService' });
    scanner.constructor = MockedObjectService;
    scm = {
      getRepositoryInfo: jest.fn(),
      cloneRepository: jest.fn(),
    } as any;
    scmFactory = { resolve: jest.fn() } as any;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanService,
        { provide: 'IScanner', useValue: scanner },
        { provide: ScmFactoryService, useValue: scmFactory },
      ],
    }).compile();
    service = module.get<ScanService>(ScanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should scan repository successfully', async () => {
    scmFactory.resolve.mockReturnValue(scm);
    scm.getRepositoryInfo.mockResolvedValue({ name: 'repo', description: 'desc', default_branch: 'main' });
    scm.cloneRepository.mockResolvedValue('/tmp/repo');
    scanner.scanRepository.mockResolvedValue('{"findings":[]}');
    const result = await service.scanRepository('https://github.com/user/repo');
    expect(JSON.parse(result)).toEqual({
      Scanner: 'MockedObject',
      repoInfo: { name: 'repo', description: 'desc', default_branch: 'main' },
      scanResult: '{"findings":[]}'
    });
  });

  it('should throw if SCM is not supported', async () => {
    scmFactory.resolve.mockImplementation(() => { throw new Error('Unsupported SCM provider'); });
    await expect(service.scanRepository('https://unknown.com/repo')).rejects.toThrow('Unsupported SCM provider');
  });

  it('should throw if scanner fails', async () => {
    scmFactory.resolve.mockReturnValue(scm);
    scm.getRepositoryInfo.mockResolvedValue({ name: 'repo', description: 'desc', default_branch: 'main' });
    scm.cloneRepository.mockResolvedValue('/tmp/repo');
    scanner.scanRepository.mockRejectedValue(new Error('scan error'));
    await expect(service.scanRepository('https://github.com/user/repo')).rejects.toThrow('scan error');
  });
});
