export interface IScm {
    getRepositoryInfo(url: string): Promise<any>;
    cloneRepository(url: string): Promise<string>;
}