import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScanModule } from './scan/scan.module';
import { ScmModule } from './scm/scm.module';
import { ScannerModule } from './scanner/scanner.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ScanModule,
    ScmModule,
    ScannerModule,
    ThrottlerModule.forRoot([
      {
        ttl: 30000,
        limit: 5,
      },
    ])
    ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, 
    },
  ],
})
export class AppModule {}
