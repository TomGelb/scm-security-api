import { HttpException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { GithubRepoInfo } from './github-repo-info.interface';
import { ScmBaseService } from '../scm-base.service';

@Injectable()
export class GithubService extends ScmBaseService {
    constructor(private readonly httpService: HttpService) {
        super();
    }

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
            if (error.response?.status === 404) {
                throw new NotFoundException('GitHub API error: Repository not found');
            }
            throw new InternalServerErrorException(`GitHub API error: ${error.response?.status || error.message}`);
        }
    }
}
