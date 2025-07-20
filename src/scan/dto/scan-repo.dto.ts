import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ScanRepoDto {
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    url: string;
}