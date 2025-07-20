import { Module } from '@nestjs/common';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';
import { ScmModule } from '../scm/scm.module';
import { ScannerModule } from '../scanner/scanner.module';

@Module({
  imports: [ScmModule, ScannerModule],
  controllers: [ScanController],
  providers: [ScanService]
})
export class ScanModule {}
