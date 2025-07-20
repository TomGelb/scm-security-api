import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GithubService } from './github/github.service';
import { ScmFactoryService } from './scm.factory';

@Module({
  imports: [HttpModule],
  providers: [GithubService, ScmFactoryService],
  exports: [ScmFactoryService],
})
export class ScmModule {}
