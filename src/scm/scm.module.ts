import { Module } from '@nestjs/common';
import { GithubService } from './github/github.service';

@Module({
  providers: [GithubService]
})
export class ScmModule {}
