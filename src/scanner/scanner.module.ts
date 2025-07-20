import { Module } from '@nestjs/common';
import { GitleaksService } from './gitleaks/gitleaks.service';

@Module({
  providers: [GitleaksService]
})
export class ScannerModule {}
