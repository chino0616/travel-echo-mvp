import { promises as fs } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface VideoGeneratorOptions {
  photos: string[];
  text: string;
  duration: number;
}

export interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

export class VideoGenerator {
  private readonly MAX_TEXT_LENGTH = 500;
  private readonly MIN_DURATION = 5;
  private readonly DEFAULT_DURATION = 15;
  private readonly STORAGE_PATH = './public/storage';
  private readonly TEMP_PATH = './temp';
  private readonly VIDEO_PATH = './public/videos';

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.STORAGE_PATH, { recursive: true });
      await fs.mkdir(this.TEMP_PATH, { recursive: true });
      await fs.mkdir(this.VIDEO_PATH, { recursive: true });
    } catch (error) {
      throw new Error('Failed to create directory');
    }
  }

  private validateInput(options: VideoGeneratorOptions): void {
    if (!options.photos.length) {
      throw new Error('No photos provided');
    }

    if (!options.text.trim()) {
      throw new Error('Text cannot be empty');
    }

    if (options.text.length > this.MAX_TEXT_LENGTH) {
      throw new Error('Text length exceeds limit');
    }

    options.photos.forEach(photo => {
      if (!photo.startsWith('data:image/')) {
        throw new Error('Invalid photo format');
      }
    });
  }

  private validateDuration(duration: number): number {
    if (duration < this.MIN_DURATION) {
      return this.DEFAULT_DURATION;
    }
    return duration;
  }

  private async saveBase64AsImage(base64Data: string): Promise<string> {
    const matches = base64Data.match(/^data:image\/([A-Za-z]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image format');
    }

    const [, extension, data] = matches;
    const buffer = Buffer.from(data, 'base64');
    const filename = `${uuidv4()}.${extension}`;
    const filepath = path.join(this.TEMP_PATH, filename);
    
    await fs.writeFile(filepath, buffer);
    return filepath;
  }

  public async generateVideo(options: VideoGeneratorOptions): Promise<VideoGenerationResult> {
    try {
      this.validateInput(options);
      const duration = this.validateDuration(options.duration);

      const imageFiles = await Promise.all(
        options.photos.map(photo => this.saveBase64AsImage(photo))
      );

      const outputFilename = `video-${uuidv4()}.mp4`;
      const outputPath = path.join(this.VIDEO_PATH, outputFilename);

      await new Promise<void>((resolve, reject) => {
        const command = ffmpeg();
        
        imageFiles.forEach(file => {
          command.input(file);
        });

        command
          .outputOptions([
            '-filter_complex', `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2[v0]`,
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-movflags', '+faststart',
            '-t', duration.toString()
          ])
          .save(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });

      // 清理臨時文件
      await Promise.all(imageFiles.map(file => fs.unlink(file)));

      return {
        success: true,
        videoUrl: `/videos/${outputFilename}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤'
      };
    }
  }
} 