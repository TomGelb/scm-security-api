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
      getLashCommitHash: jest.fn(), // Add this line
    } as any;
    scm.constructor = MockedObjectService;
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
    scm.getLashCommitHash.mockResolvedValue('mock-commit-hash'); // Add this line
    scanner.scanRepository.mockResolvedValue('{"findings":[]}');
    const result = await service.analyzeRepository('https://github.com/user/repo');
    expect(JSON.parse(result)).toEqual({
      SCM: 'MockedObject',
      Scanner: 'MockedObject',
      Metadata: {
        repoInfo: { name: 'repo', description: 'desc', default_branch: 'main' },
        lastCommitHash: 'mock-commit-hash',
      },
      scanResult: '{"findings":[]}'
    });
  });

  it('should throw if SCM is not supported', async () => {
    scmFactory.resolve.mockImplementation(() => { throw new Error('Unsupported SCM provider'); });
    await expect(service.analyzeRepository('https://unknown.com/repo')).rejects.toThrow('Unsupported SCM provider');
  });

  it('should throw if scanner fails', async () => {
    scmFactory.resolve.mockReturnValue(scm);
    scm.getRepositoryInfo.mockResolvedValue({ name: 'repo', description: 'desc', default_branch: 'main' });
    scm.cloneRepository.mockResolvedValue('/tmp/repo');
    scanner.scanRepository.mockRejectedValue(new Error('scan error'));
    await expect(service.analyzeRepository('https://github.com/user/repo')).rejects.toThrow('scan error');
  });

  describe('cloneRepository', () => {
    beforeEach(() => {
      // Clear static cache before each test
      // @ts-ignore
      ScanService['scannedReposCommitHash'].clear();
    });

    it('should return cached path if commit hash is present', async () => {
      scmFactory.resolve.mockReturnValue(scm);
      Object.defineProperty(scm.constructor, 'name', { value: 'GithubService' });
      scm.getRepositoryInfo.mockResolvedValue({ name: 'repo' });
      scm.getLashCommitHash.mockResolvedValue('hash1');
      // @ts-ignore
      ScanService['scannedReposCommitHash'].set('hash1', '/cached/path');
      const result = await service.cloneRepository('url');
      expect(result).toEqual({
        localPath: '/cached/path',
        scmType: 'Github',
        repoInfo: { name: 'repo' },
        lastCommitHash: 'hash1',
      });
    });

    it('should throw if cached path is missing', async () => {
      scmFactory.resolve.mockReturnValue(scm);
      Object.defineProperty(scm.constructor, 'name', { value: 'GithubService' });
      scm.getRepositoryInfo.mockResolvedValue({ name: 'repo' });
      scm.getLashCommitHash.mockResolvedValue('hash2');
      // @ts-ignore
      ScanService['scannedReposCommitHash'].set('hash2', '');
      await expect(service.cloneRepository('url')).rejects.toThrow('No local path found for commit hash: hash2');
    });

    it('should clone and cache if not present', async () => {
      scmFactory.resolve.mockReturnValue(scm);
      Object.defineProperty(scm.constructor, 'name', { value: 'GithubService' });
      scm.getRepositoryInfo.mockResolvedValue({ name: 'repo' });
      scm.getLashCommitHash.mockResolvedValue('hash3');
      scm.cloneRepository.mockResolvedValue('/new/path');
      const result = await service.cloneRepository('url');
      expect(result).toEqual({
        localPath: '/new/path',
        scmType: 'Github',
        repoInfo: { name: 'repo' },
        lastCommitHash: 'hash3',
      });
      // @ts-ignore
      expect(ScanService['scannedReposCommitHash'].get('hash3')).toBe('/new/path');
    });
  });

  describe('cleanup', () => {
    it('should cleanup successfully', async () => {
      const fs = require('fs').promises;
      const rmSpy = jest.spyOn(fs, 'rm').mockResolvedValue(undefined);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await expect(service.cleanup('/tmp/path')).resolves.toBeUndefined();
      expect(rmSpy).toHaveBeenCalledWith('/tmp/path', { recursive: true, force: true });
      logSpy.mockRestore();
      rmSpy.mockRestore();
    });
  });
});
