import { BadRequestException, Injectable } from '@nestjs/common';
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
    if (url.includes('gitlab.com') || url.includes('bitbucket.com')) //return this.gitLabScm;
      throw new BadRequestException('GitLab SCM is not supported yet');
    console.warn(`No SCM implementation found for URL: ${url}, returning GitHub as default`);
    return this.githubScm; // this is not a good practice in this case because the resolution is based on URL. I wanted to see how other exceptions propogate later
  }
}
