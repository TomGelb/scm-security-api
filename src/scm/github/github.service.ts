import { HttpException, Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { IScm } from '../scm.interface';
import { GithubRepoInfo } from './github-repo-info.interface';

@Injectable()
export class GithubService implements IScm {
    constructor(private readonly httpService: HttpService) {}

    async getRepositoryInfo(url: string): Promise<GithubRepoInfo> {
        // Extract owner and repo from the URL
        const match = url.match(/github.com[/:]([^/]+)\/([^/.]+)(.git)?/);
        if (!match) throw new UnprocessableEntityException('Invalid GitHub URL');
        const [_, owner, repo] = match;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
        try {
            const response = await lastValueFrom(
                this.httpService.get(apiUrl, {
                    headers: { 'User-Agent': 'scm-security-api' },
                })
            );
        return {
            name: response.data.name,
            description: response.data.description,
            default_branch: response.data.default_branch,
        };
        } catch (error: any) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(`GitHub API error: ${error.response?.status || error.message}`);
        }
    }

    // cloning a repository is the same process for all SCMs, so theoretically this could be implemented in a shared base class
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
