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
        const data = await this.getGithubRepoInfo(url, undefined) as GithubRepoInfo;
        return {
            name: data?.name,
            description: data?.description,
            default_branch: data?.default_branch,
        };
    }

    async getLashCommitHash(url: string): Promise<string> {
        const data = await this.getGithubRepoInfo(url, 'commits/master'); // Assuming 'master' is the default branch. Potential change would be to accept branch as a parameter in the controller.
        if (!data) {
            throw new NotFoundException('No commits found for the repository');
        }
        return data.sha;
    }

    async getGithubRepoInfo(url: string, path: string | undefined): Promise<any> {
        // Extract owner and repo from the URL
        const match = url.match(/github.com[/:]([^/]+)\/([^/.]+)(.git)?/);
        if (!match) throw new UnprocessableEntityException('Invalid GitHub URL');
        const [_, owner, repo] = match;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}` + (path ? `/${path}` : '');
        try {
            const response = await lastValueFrom(
                this.httpService.get(apiUrl, {
                    headers: { 'User-Agent': 'scm-security-api' },
                })
            );
        return response.data;
        // return {
        //     name: response.data?.name,
        //     description: response.data?.description,
        //     default_branch: response.data?.default_branch,
        //     last_commit_hash: path ? response.data[0]?.sha : undefined,
        // };
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
