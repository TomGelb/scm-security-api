import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { IScm } from '../scm.interface';

@Injectable()
export class GithubService implements IScm {
    constructor(private readonly httpService: HttpService) {}

    async getRepositoryInfo(url: string): Promise<any> {
        // Extract owner and repo from the URL
        const match = url.match(/github.com[/:]([^/]+)\/([^/.]+)(.git)?/);
        if (!match) throw new Error('Invalid GitHub URL');
        const [_, owner, repo] = match;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
        try {
            const response = await lastValueFrom(
                this.httpService.get(apiUrl, {
                    headers: { 'User-Agent': 'scm-security-api' },
                })
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`GitHub API error: ${error.response?.status || error.message}`);
        }
    }

    async cloneRepository(url: string): Promise<string> {
        const { mkdtemp } = await import('fs/promises');
        const { tmpdir } = await import('os');
        const { join } = await import('path');
        const { spawn } = await import('child_process');
        const tmp = await mkdtemp(join(tmpdir(), 'repo-'));
        return new Promise((resolve, reject) => {
            const git = spawn('git', ['clone', url, tmp], { stdio: ['ignore', 'pipe', 'pipe'] });
            let errorOutput = '';
            git.stderr.on('data', (data) => { errorOutput += data.toString(); });
            git.on('close', (code) => {
                if (code === 0) resolve(tmp);
                else reject(new Error(`Git clone failed: ${errorOutput}`));
            });
        });
    }
}
