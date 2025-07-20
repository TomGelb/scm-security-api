import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { IScanner } from '../scanner/scanner.interface';
import { ScmFactoryService } from '../scm/scm.factory';
import { IScm } from '../scm/scm.interface';

@Injectable()
export class ScanService {
    constructor ( 
        @Inject('IScanner') private readonly scanner: IScanner,
        private readonly scmFactory: ScmFactoryService
    ) {}
    
    async scanRepository(url: string): Promise<string> {
        try {
        const scm: IScm = this.scmFactory.resolve(url);
        const repoInfo = await scm.getRepositoryInfo(url);
        const localPath = await scm.cloneRepository(url);
        const scanResult = await this.scanner.scanRepository(localPath);
        return JSON.stringify({
            Scanner: this.scanner.constructor.name.replace('Service', ''),
            repoInfo,
            scanResult
        });
        } catch (error) {
            throw new InternalServerErrorException(`Failed to scan repository: ${error.message}`);
        }
    }
}