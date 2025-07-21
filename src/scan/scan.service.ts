import { HttpException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { IScanner } from '../scanner/scanner.interface';
import { ScmFactoryService } from '../scm/scm.factory';
import { IScm } from '../scm/scm.interface';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class ScanService {
    constructor ( 
        @Inject('IScanner') private readonly scanner: IScanner,
        private readonly scmFactory: ScmFactoryService
    ) {}
    
    async analyzeRepository(url: string): Promise<string> {
        let clonedRepoPath: string | undefined = undefined;
        try {
            const { localPath, scmType, repoInfo } = await this.cloneRepository(url);
            clonedRepoPath = localPath;
            const scanResult = await this.scanner.scanRepository(localPath);
            return JSON.stringify({
                SCM: scmType,
                Scanner: this.scanner.constructor.name.replace('Service', ''),
                repoInfo,
                scanResult
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to scan repository: ${error.message}`);
        } finally {
            if (clonedRepoPath) {
                await this.cleanup(clonedRepoPath);
            }
        }
    }

    async cloneRepository(url: string): Promise<{localPath: string, scmType: string, repoInfo: any}> {
        const scm: IScm = this.scmFactory.resolve(url);
        const scmType = scm.constructor.name.replace('Service', '');
        const repoInfo = await scm.getRepositoryInfo(url);
        const localPath = await scm.cloneRepository(url);
        return { localPath, scmType ,repoInfo };
    }

    async cleanup(localPath: string): Promise<void> {
        try {
            console.log(`Cleaning up cloned repository at ${localPath}`);
            await fs.rm(localPath, { recursive: true, force: true });
        } catch (error) {
            throw new InternalServerErrorException(`Failed to cleanup repository at ${localPath}: ${error.message}`);
        }
    }
}