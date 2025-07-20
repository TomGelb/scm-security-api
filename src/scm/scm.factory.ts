import { Injectable } from '@nestjs/common';
import { IScm } from './scm.interface';
import { GithubService } from './github/github.service';
// import { GitLabScmService } from './gitlab/gitlab.scm';

@Injectable()
export class ScmFactoryService {
  constructor(
    private readonly githubScm: GithubService,
    // private readonly gitLabScm: GitLabScmService,
  ) {}

  resolve(url: string): IScm {
    if (url.includes('github.com')) return this.githubScm;
    // if (url.includes('gitlab.com')) return this.gitLabScm;

    throw new Error('Unsupported SCM provider');
  }
}
