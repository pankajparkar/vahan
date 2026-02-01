import path from 'path';
import fs from 'fs';

export function getDownloadPath(): string {
  const downloadDir = path.join(process.cwd(), 'downloads');

  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  return downloadDir;
}

export function generateFileName(
  state: string,
  xAxis: string,
  extension: string = 'xlsx'
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedState = state.replace(/\s+/g, '_');
  const sanitizedXAxis = xAxis.replace(/\s+/g, '_');

  return `${sanitizedState}_${sanitizedXAxis}_${timestamp}.${extension}`;
}

export async function waitForDownload(
  downloadPath: string,
  timeoutMs: number = 60000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (fs.existsSync(downloadPath)) {
      const stats = fs.statSync(downloadPath);
      if (stats.size > 0) {
        return true;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return false;
}

export function cleanupDownloads(): void {
  const downloadDir = getDownloadPath();

  if (fs.existsSync(downloadDir)) {
    const files = fs.readdirSync(downloadDir);

    files.forEach((file: string) => {
      const filePath = path.join(downloadDir, file);
      fs.unlinkSync(filePath);
    });
  }
}
