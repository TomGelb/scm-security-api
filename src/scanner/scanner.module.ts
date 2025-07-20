import { Module } from '@nestjs/common';
import { GitleaksService } from './gitleaks/gitleaks.service';

@Module({
  providers: [
    {
      provide: 'IScanner',
      useClass: GitleaksService,
    },
  ],
  exports: ['IScanner'],
})
export class ScannerModule {}
