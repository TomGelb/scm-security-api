import { GithubRepoInfo } from "./github/github-repo-info.interface";

export interface IScm {
    getRepositoryInfo(url: string): Promise<any>;
    cloneRepository(url: string): Promise<string>;
    getLashCommitHash(url: string): Promise<string>;
}