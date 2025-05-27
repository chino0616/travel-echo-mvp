import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import { LocalStorageHandler } from './localStorageHandler';
import { GenerationProgress } from './mockResponses';

interface VideoGeneratorOptions {
  photos: string[];  // 照片 URL 列表
  text: string;      // AI 生成的文字
  duration: number;  // 影片總時長（秒）
}

export class VideoGenerator {
  private storage: LocalStorageHandler;

  constructor() {
    this.storage = new LocalStorageHandler();
  }

  async generateVideo(
    options: VideoGeneratorOptions,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<string> {
    const { photos, text, duration } = options;
    const tempDir = path.join(process.cwd(), 'temp');
    const outputPath = path.join(tempDir, `output-${Date.now()}.mp4`);

    // 回報準備階段
    onProgress?.({ stage: '準備照片', progress: 0 });

    // 確保臨時目錄存在
    await fs.mkdir(tempDir, { recursive: true });

    // 下載照片到本地
    const localPhotos = await Promise.all(
      photos.map(async (url, index) => {
        const photoPath = path.join(tempDir, `photo-${index}.jpg`);
        await this.downloadFile(url, photoPath);
        // 回報下載進度
        onProgress?.({ 
          stage: '準備照片', 
          progress: Math.round((index + 1) / photos.length * 100) 
        });
        return photoPath;
      })
    );

    // 回報開始生成影片
    onProgress?.({ stage: '生成影片', progress: 0 });

    // 生成影片
    await this.createVideo(localPhotos, text, duration, outputPath, onProgress);

    // 回報開始添加文字
    onProgress?.({ stage: '添加文字', progress: 0 });

    // 讀取生成的影片
    const videoBuffer = await fs.readFile(outputPath);
    
    // 保存到本地存儲
    const videoUrl = await this.storage.saveVideo(videoBuffer);

    // 清理臨時文件
    await this.cleanup(tempDir);

    // 回報完成
    onProgress?.({ stage: '完成', progress: 100 });

    return videoUrl;
  }

  private async downloadFile(url: string, destination: string): Promise<void> {
    // 如果是本地文件，直接複製
    if (url.startsWith('/')) {
      const sourcePath = path.join(process.cwd(), 'public', url);
      await fs.copyFile(sourcePath, destination);
      return;
    }

    // 如果是外部 URL，下載文件
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer'
    });

    await fs.writeFile(destination, response.data);
  }

  private createVideo(
    photos: string[],
    text: string,
    duration: number,
    outputPath: string,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      // 為每張照片設置轉場效果
      photos.forEach((photo, index) => {
        command
          .input(photo)
          .duration(duration / photos.length)
          .inputOptions(['-loop 1']);
      });

      // 添加進度監聽
      command.on('progress', (progress: { percent?: number }) => {
        onProgress?.({
          stage: '生成影片',
          progress: Math.min(Math.round(progress.percent || 0), 100)
        });
      });

      // 添加文字
      command
        .complexFilter([
          {
            filter: 'drawtext',
            options: {
              text,
              fontsize: 24,
              fontcolor: 'white',
              x: '(w-text_w)/2',
              y: 'h-th-50',
              shadowcolor: 'black',
              shadowx: 2,
              shadowy: 2,
              // 添加淡入淡出效果
              alpha: 'if(lt(t,1),t,if(lt(t,duration-1),1,duration-t))'
            }
          }
        ])
        .on('end', () => {
          onProgress?.({ stage: '添加文字', progress: 100 });
          resolve();
        })
        .on('error', reject)
        .save(outputPath);
    });
  }

  private async cleanup(directory: string): Promise<void> {
    await fs.rm(directory, { recursive: true, force: true });
  }
} 