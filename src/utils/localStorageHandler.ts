import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

export class LocalStorageHandler {
  private readonly publicDir: string;
  private readonly uploadsDir: string;
  private readonly videosDir: string;

  constructor() {
    this.publicDir = path.join(process.cwd(), 'public');
    this.uploadsDir = path.join(this.publicDir, 'uploads');
    this.videosDir = path.join(this.publicDir, 'videos');
    this.initDirectories();
  }

  private async initDirectories() {
    await fs.mkdir(this.uploadsDir, { recursive: true });
    await fs.mkdir(this.videosDir, { recursive: true });
  }

  async saveUploadedFile(file: Buffer, originalName: string): Promise<string> {
    const fileHash = createHash('md5').update(file).digest('hex');
    const ext = path.extname(originalName);
    const fileName = `${fileHash}${ext}`;
    const filePath = path.join(this.uploadsDir, fileName);
    
    await fs.writeFile(filePath, file);
    
    // 返回相對於 public 目錄的路徑，可直接用於前端訪問
    return `/uploads/${fileName}`;
  }

  async saveVideo(videoBuffer: Buffer): Promise<string> {
    const videoHash = createHash('md5').update(videoBuffer).digest('hex');
    const fileName = `${videoHash}.mp4`;
    const filePath = path.join(this.videosDir, fileName);
    
    await fs.writeFile(filePath, videoBuffer);
    
    return `/videos/${fileName}`;
  }

  async getFileUrl(fileName: string): Promise<string> {
    // 在開發環境中直接返回相對路徑
    return `/uploads/${fileName}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    const absolutePath = path.join(this.publicDir, filePath.replace(/^\//, ''));
    await fs.unlink(absolutePath);
  }
} 