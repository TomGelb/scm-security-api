import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScanModule } from './scan/scan.module';
import { ScmModule } from './scm/scm.module';
import { ScannerModule } from './scanner/scanner.module';

@Module({
  imports: [ScanModule, ScmModule, ScannerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
