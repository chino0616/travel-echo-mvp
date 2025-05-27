import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { GenerationProgress } from './mockResponses';

interface VideoGeneratorOptions {
  photos: string[];
  text: string;
  duration: number;
}

export class VideoGenerator {
  private readonly STORAGE_DIR = path.join(process.cwd(), 'public', 'storage');
  private readonly VIDEO_DIR = path.join(this.STORAGE_DIR, 'videos');
  private readonly TEMP_DIR = path.join(process.cwd(), 'temp');

  constructor() {
    // 確保必要的目錄存在
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.STORAGE_DIR, { recursive: true });
      await fs.mkdir(this.VIDEO_DIR, { recursive: true });
      await fs.mkdir(this.TEMP_DIR, { recursive: true });
      
      // 測試目錄權限
      const testFile = path.join(this.TEMP_DIR, 'test.txt');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      
      console.log('目錄創建成功，權限正常');
    } catch (error) {
      console.error('目錄創建或權限測試失敗:', error);
      throw new Error('無法創建或訪問必要的目錄');
    }
  }

  private async downloadPhoto(url: string): Promise<string> {
    try {
      console.log('開始下載照片:', url);
      
      // 如果是本地檔案（以 /storage/ 開頭），直接返回完整路徑
      if (url.startsWith('/storage/')) {
        const fullPath = path.join(process.cwd(), 'public', url);
        // 確認檔案存在
        await fs.access(fullPath);
        console.log('本地照片路徑:', fullPath);
        return fullPath;
      }

      // 如果是外部 URL，下載檔案
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`照片下載失敗: ${response.status} ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const filename = `photo-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = path.join(this.TEMP_DIR, filename);
      
      await fs.writeFile(filePath, Buffer.from(buffer));
      console.log('照片下載完成:', filePath);
      return filePath;
    } catch (error) {
      console.error('照片下載失敗:', error);
      throw new Error(`照片下載失敗: ${error.message}`);
    }
  }

  private async createSubtitleFile(text: string, duration: number): Promise<string> {
    try {
      const srtPath = path.join(this.TEMP_DIR, `subtitles-${Date.now()}.srt`);
      const srtContent = `1
00:00:00,000 --> ${this.formatSrtTime(duration)}
${text}`;

      await fs.writeFile(srtPath, srtContent);
      console.log('字幕檔案創建成功:', srtPath);
      return srtPath;
    } catch (error) {
      console.error('字幕檔案創建失敗:', error);
      throw new Error(`字幕檔案創建失敗: ${error.message}`);
    }
  }

  private formatSrtTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${
      String(minutes).padStart(2, '0')}:${
      String(secs).padStart(2, '0')},${
      String(ms).padStart(3, '0')}`;
  }

  public async generateVideo(
    options: VideoGeneratorOptions,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<string> {
    const { photos, text, duration } = options;

    try {
      // 1. 準備照片
      onProgress?.({ stage: '準備照片', progress: 0 });
      console.log('開始處理照片...');
      const photoFiles = await Promise.all(
        photos.map(url => this.downloadPhoto(url))
      );
      console.log('所有照片處理完成:', photoFiles);
      onProgress?.({ stage: '準備照片', progress: 100 });

      // 2. 準備字幕檔
      onProgress?.({ stage: '生成影片', progress: 0 });
      console.log('開始生成字幕檔...');
      const srtFile = await this.createSubtitleFile(text, duration);
      console.log('字幕檔生成完成');

      // 3. 生成影片
      const outputFilename = `video-${Date.now()}.mp4`;
      const outputPath = path.join(this.VIDEO_DIR, outputFilename);
      console.log('影片輸出路徑:', outputPath);

      // 計算每張照片的顯示時間
      const photoDuration = duration / photos.length;
      console.log('每張照片顯示時間:', photoDuration, '秒');

      // 建立 concat 檔案
      const concatFile = await this.createConcatFile(photoFiles, photoDuration);
      console.log('Concat 檔案創建完成:', concatFile);

      // 建立 FFmpeg 命令
      const ffmpegArgs = [
        '-y',                // 覆蓋現有檔案
        '-f', 'concat',      // 使用 concat 分離器
        '-safe', '0',        // 允許絕對路徑
        '-i', concatFile,    // 輸入檔案
        '-vf', [
          'scale=1920:1080:force_original_aspect_ratio=decrease',  // 縮放
          'pad=1920:1080:(ow-iw)/2:(oh-ih)/2',                    // 置中
          `subtitles=${srtFile}:force_style='FontSize=24,Alignment=2,BorderStyle=3,Outline=1,Shadow=0'` // 字幕
        ].join(','),
        '-c:v', 'libx264',    // 使用 H.264 編碼
        '-preset', 'medium',   // 編碼預設
        '-crf', '23',         // 畫質設定
        '-pix_fmt', 'yuv420p', // 像素格式
        outputPath            // 輸出路徑
      ];

      console.log('FFmpeg 命令:', 'ffmpeg', ffmpegArgs.join(' '));

      // 執行 FFmpeg
      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', ffmpegArgs);
        let progress = 0;
        let errorOutput = '';

        ffmpeg.stderr.on('data', (data) => {
          const output = data.toString();
          errorOutput += output;
          console.log('FFmpeg 輸出:', output);
          if (output.includes('frame=')) {
            progress = Math.min(progress + 5, 95);
            onProgress?.({ stage: '生成影片', progress });
          }
        });

        ffmpeg.stdout.on('data', (data) => {
          console.log('FFmpeg stdout:', data.toString());
        });

        ffmpeg.on('close', (code) => {
          if (code === 0) {
            console.log('FFmpeg 處理完成');
            resolve();
          } else {
            console.error('FFmpeg 處理失敗，完整錯誤輸出:', errorOutput);
            reject(new Error(`FFmpeg 處理失敗，錯誤碼：${code}，錯誤輸出：${errorOutput}`));
          }
        });

        ffmpeg.on('error', (err) => {
          console.error('FFmpeg 執行錯誤:', err);
          reject(err);
        });
      });

      onProgress?.({ stage: '生成影片', progress: 100 });

      // 4. 清理臨時檔案
      await this.cleanup();
      console.log('臨時檔案清理完成');

      // 5. 檢查生成的影片是否存在
      await fs.access(outputPath);
      console.log('影片檔案存在性確認成功');

      // 6. 返回相對路徑
      const videoUrl = `/storage/videos/${outputFilename}`;
      console.log('影片生成完成，URL:', videoUrl);
      return videoUrl;

    } catch (error) {
      console.error('影片生成過程中發生錯誤:', error);
      throw error;
    }
  }

  private async createConcatFile(photoFiles: string[], duration: number): Promise<string> {
    try {
      const concatFilePath = path.join(this.TEMP_DIR, `concat-${Date.now()}.txt`);
      const content = photoFiles.map(file => `file '${file}'\nduration ${duration}`).join('\n');
      await fs.writeFile(concatFilePath, content);
      console.log('Concat 檔案內容:', content);
      return concatFilePath;
    } catch (error) {
      console.error('Concat 檔案創建失敗:', error);
      throw new Error(`Concat 檔案創建失敗: ${error.message}`);
    }
  }

  private async cleanup() {
    try {
      const files = await fs.readdir(this.TEMP_DIR);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.TEMP_DIR, file)))
      );
      console.log('臨時檔案清理完成');
    } catch (error) {
      console.error('清理臨時檔案失敗:', error);
      // 不要拋出錯誤，因為這不是致命錯誤
    }
  }
} 