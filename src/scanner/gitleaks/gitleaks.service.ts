import { Injectable } from '@nestjs/common';
import { IScanner } from '../scanner.interface';

@Injectable()
export class GitleaksService implements IScanner {
    async scanRepository(localPath: string): Promise<string> {
        const { spawn } = await import('child_process');
        return new Promise((resolve, reject) => {
            const gitleaks = spawn('gitleaks', ['detect', '--source', localPath, '--report-format', 'json'], {
                stdio: ['ignore', 'pipe', 'pipe'],
            });

            let output = '';
            let errorOutput = '';

            gitleaks.stdout.on('data', (data) => {
                output += data.toString();
            });

            gitleaks.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            gitleaks.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Gitleaks scan failed with code ${code}: ${errorOutput}`));
                }
            });
        });
    }
}
