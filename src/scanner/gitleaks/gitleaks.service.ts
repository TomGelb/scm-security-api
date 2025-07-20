import { Injectable } from '@nestjs/common';
import { IScanner } from '../scanner.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class GitleaksService implements IScanner {
    async scanRepository(localPath: string): Promise<string> {
        const { spawn } = await import('child_process');
        return new Promise((resolve, reject) => {
            console.log(`Scanning repository at ${localPath} using Gitleaks...`);
            // const gitleaks = spawn('gitleaks', ['git', localPath, '--report-format=json'], {
            //     shell: false
            // });
            const gitleaks = spawn('gitleaks', [
                'git',
                localPath,
                `--report-path=${localPath}_results.json`,
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
                        const raw = await fs.readFile(`${localPath}_results.json`, 'utf-8');
                        const findings = JSON.parse(raw);
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
}
