export interface ScanResult {
    scanner: string;
    findings: any[];
    metadata: string;
}

export interface IScanner {
    scanRepository(localPath: string): Promise<string>;
}