import { Body, Controller, Post, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ScanService } from './scan.service';
import { ScanRepoDto } from './dto/scan-repo.dto';

@Controller('scm-scanner')
export class ScanController {
    constructor(private readonly scanService : ScanService) {}

    @Post("scan")
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe())
    async scanRepository(@Body() scanRepoDto: ScanRepoDto): Promise<string> {
        const scanResult = await this.scanService.analyzeRepository(scanRepoDto.url);
        console.log(scanResult);
        return scanResult;
    }
}
