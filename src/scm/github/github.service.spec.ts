import { Test, TestingModule } from '@nestjs/testing';
import { GithubService } from './github.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosHeaders } from 'axios';

const fsPromises = require('fs/promises');
const path = require('path');
const childProcess = require('child_process');

describe('GithubService', () => {
  let service: GithubService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    httpService = { get: jest.fn() } as any;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();
    service = module.get<GithubService>(GithubService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch repository info successfully', async () => {
    httpService.get.mockReturnValue(
      of({
        data: { name: 'repo', description: 'desc', default_branch: 'main' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      })
    );
    const info = await service.getRepositoryInfo('https://github.com/user/repo');
    expect(info).toEqual({ name: 'repo', description: 'desc', default_branch: 'main' });
  });

  it('should throw on GitHub API error', async () => {
    httpService.get.mockReturnValue(throwError(() => ({ response: { status: 404 } })));
    await expect(service.getRepositoryInfo('https://github.com/user/repo')).rejects.toThrow('GitHub API error: Repository not found');
  });

  it('should throw on invalid GitHub URL', async () => {
    // Use a truly invalid GitHub URL that does not match the regex
    await expect(service.getRepositoryInfo('https://github.com/')).rejects.toThrow('Invalid GitHub URL');
  });

  it('should clone repository successfully', async () => {
    jest.spyOn(fsPromises, 'mkdir').mockResolvedValue(undefined as any);
    jest.spyOn(fsPromises, 'mkdtemp').mockResolvedValue('/tmp/repo');
    jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));
    jest.spyOn(childProcess, 'spawn').mockImplementation(() => {
      return {
        stderr: { on: jest.fn() },
        on: (event, cb) => { if (event === 'close') setImmediate(() => cb(0)); },
      } as any;
    });
    const result = await service.cloneRepository('https://github.com/user/repo');
    expect(result).toBe('/tmp/repo');
  });

  it('should throw if git clone fails', async () => {
    jest.spyOn(fsPromises, 'mkdir').mockResolvedValue(undefined as any);
    jest.spyOn(fsPromises, 'mkdtemp').mockResolvedValue('/tmp/repo');
    jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));
    jest.spyOn(childProcess, 'spawn').mockImplementation(() => {
      return {
        stderr: { on: (event, cb) => { if (event === 'data') cb('error'); } },
        on: (event, cb) => { if (event === 'close') setImmediate(() => cb(1)); },
      } as any;
    });
    await expect(service.cloneRepository('https://github.com/user/repo')).rejects.toThrow('Git clone failed');
  });
});
