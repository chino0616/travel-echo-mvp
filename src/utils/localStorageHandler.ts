import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

export class LocalStorageHandler {
  private readonly STORAGE_DIR = path.join(process.cwd(), 'public', 'storage');
  private readonly VIDEO_DIR = path.join(this.STORAGE_DIR, 'videos');

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.STORAGE_DIR, { recursive: true });
    await fs.mkdir(this.VIDEO_DIR, { recursive: true });
  }

  async saveVideo(videoBuffer: Buffer): Promise<string> {
    const filename = `video-${Date.now()}.mp4`;
    const filePath = path.join(this.VIDEO_DIR, filename);
    
    await fs.writeFile(filePath, videoBuffer);
    
    // 返回相對於 public 目錄的路徑
    return `/storage/videos/${filename}`;
  }

  async cleanup(): Promise<void> {
    // 清理超過 24 小時的檔案
    const files = await fs.readdir(this.VIDEO_DIR);
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(this.VIDEO_DIR, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.ctimeMs > ONE_DAY) {
          await fs.unlink(filePath);
        }
      })
    );
  }

  async saveUploadedFile(file: Buffer, originalName: string): Promise<string> {
    const fileHash = createHash('md5').update(file).digest('hex');
    const ext = path.extname(originalName);
    const fileName = `${fileHash}${ext}`;
    const filePath = path.join(this.STORAGE_DIR, fileName);
    
    await fs.writeFile(filePath, file);
    
    // 返回相對於 public 目錄的路徑，可直接用於前端訪問
    return `/storage/${fileName}`;
  }

  async getFileUrl(fileName: string): Promise<string> {
    // 在開發環境中直接返回相對路徑
    return `/storage/${fileName}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    const absolutePath = path.join(this.STORAGE_DIR, filePath.replace(/^\//, ''));
    await fs.unlink(absolutePath);
  }
} 