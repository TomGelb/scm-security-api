import { Test, TestingModule } from '@nestjs/testing';
import { GitleaksService } from './gitleaks.service';

jest.mock('fs/promises');
const fs = require('fs/promises');
const childProcess = require('child_process');


describe('GitleaksService', () => {
  let service: GitleaksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GitleaksService],
    }).compile();
    service = module.get<GitleaksService>(GitleaksService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve findings on code 0', async () => {
    jest.spyOn(childProcess, 'spawn').mockImplementation(() => {
      return {
        stdout: { on: (e, cb) => { if (e === 'data') cb('stdout-data'); } },
        stderr: { on: (e, cb) => { if (e === 'data') cb('stderr-data'); } },
        on: (event, cb) => { if (event === 'close') setImmediate(() => cb(0)); },
      } as any;
    });
    fs.readFile.mockResolvedValue('{"findings":[]}');
    const result = await service.scanRepository('/tmp/repo');
    expect(result).toEqual({ findings: [] });
  });

  it('should resolve findings on code 1', async () => {
    jest.spyOn(childProcess, 'spawn').mockImplementation(() => {
      return {
        stdout: { on: (e, cb) => { if (e === 'data') cb('stdout-data'); } },
        stderr: { on: (e, cb) => { if (e === 'data') cb('stderr-data'); } },
        on: (event, cb) => { if (event === 'close') setImmediate(() => cb(1)); },
      } as any;
    });
    fs.readFile.mockResolvedValue('{"findings":[{"secret":"abc"}]}');
    const result = await service.scanRepository('/tmp/repo');
    expect(result).toEqual({ findings: [{ secret: 'abc' }] });
  });

  it('should reject on non-zero/one exit code', async () => {
    jest.spyOn(childProcess, 'spawn').mockImplementation(() => {
      return {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: (event, cb) => { if (event === 'close') setImmediate(() => cb(2)); },
      } as any;
    });
    await expect(service.scanRepository('/tmp/repo')).rejects.toThrow('Gitleaks scan failed');
  });

  it('should reject on JSON parse error', async () => {
    jest.spyOn(childProcess, 'spawn').mockImplementation(() => {
      return {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: (event, cb) => { if (event === 'close') setImmediate(() => cb(0)); },
      } as any;
    });
    fs.readFile.mockResolvedValue('not-json');
    await expect(service.scanRepository('/tmp/repo')).rejects.toThrow('Unexpected token');
  });

  it('should reject on file read error', async () => {
    jest.spyOn(childProcess, 'spawn').mockImplementation(() => {
      return {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: (event, cb) => { if (event === 'close') setImmediate(() => cb(0)); },
      } as any;
    });
    fs.readFile.mockRejectedValue(new Error('file error'));
    await expect(service.scanRepository('/tmp/repo')).rejects.toThrow('file error');
  });
});
