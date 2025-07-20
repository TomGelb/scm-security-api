import { GithubRepoInfo } from "./github/github-repo-info.interface";

export interface IScm {
    getRepositoryInfo(url: string): Promise<GithubRepoInfo>;
    cloneRepository(url: string): Promise<string>;
}