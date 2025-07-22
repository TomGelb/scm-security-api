import { Injectable } from '@nestjs/common';
import { IScanner } from '../scanner.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class GitleaksService implements IScanner {
    private static readonly fileNamePostfix = '_results.json';

    async scanRepository(localPath: string): Promise<string> {
        if (await this.fileExists(`${localPath}${GitleaksService.fileNamePostfix}`)) {
            try {
                    const findings = await this.readResults(`${localPath}`);
                    console.log(`Found existing scan results for ${localPath} in local cache.`);
                    return findings;
                } catch (err) {
                    console.error('Failed to parse existing JSON scan results from Gitleaks:', err.message);
                }
        }
        const { spawn } = await import('child_process');
        return new Promise((resolve, reject) => {
            console.log(`Scanning repository at ${localPath} using Gitleaks...`);
            const gitleaks = spawn('gitleaks', [
                'git',
                localPath,
                `--report-path=${localPath}${GitleaksService.fileNamePostfix}`,
                '--report-format=json',
                '--no-banner'  // hides the ASCII logo
            ]);

            let output = '';

            gitleaks.stdout.on('data', (data) => {
                output += data.toString();
            });

            gitleaks.stderr.on('data', (data) => {
                output += data.toString();
            });


            gitleaks.on('close', async (code) => {
                if (code === 0 || code === 1) {
                    console.log(`Gitleaks process found: ${output}`);
                    try {
                        const findings = this.readResults(localPath);
                        resolve(findings);
                    } catch (err) {
                        console.error('Failed to parse JSON from Gitleaks:', err.message);
                        reject(err);
                    }
                } else {
                    reject(new Error(`Gitleaks scan failed with code ${code}: ${output}`));
                }
            });
        });
    }

    async fileExists(path: string): Promise<boolean> {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }

    async readResults(localPath: string): Promise<string> {
        const raw = await fs.readFile(`${localPath}${GitleaksService.fileNamePostfix}`, 'utf-8');
        const findings = JSON.parse(raw);
        return findings;
    }
}
