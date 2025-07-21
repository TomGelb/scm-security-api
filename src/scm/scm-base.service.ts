import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IScm } from './scm.interface';

@Injectable()
export abstract class ScmBaseService implements IScm {

    getRepositoryInfo(url: string): Promise<any> {
        throw new Error('Method not implemented in base class.');
    }
    
    async cloneRepository(url: string): Promise<string> {
        const { mkdtemp, mkdir } = await import('fs/promises');
        const { join } = await import('path');
        const { spawn } = await import('child_process');
        const reposDir = join(process.cwd(), 'repos');
        await mkdir(reposDir, { recursive: true });
        const tmp = await mkdtemp(join(reposDir, 'repo-'));
        return new Promise((resolve, reject) => {
            const git = spawn('git', ['clone', url, tmp], { stdio: ['ignore', 'pipe', 'pipe'] });
            let errorOutput = '';
            git.stderr.on('data', (data) => { errorOutput += data.toString(); });
            git.on('close', (code) => {
                if (code === 0) resolve(tmp);
                else reject(new InternalServerErrorException(`Git clone failed: ${errorOutput}`));
            });
        });
    }
}