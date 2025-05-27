import { VideoGenerator } from '../videoGenerator';
import { promises as fs } from 'fs';
import ffmpeg from 'fluent-ffmpeg';

jest.mock('fs/promises');
jest.mock('fluent-ffmpeg');

describe('VideoGenerator', () => {
  const mockPhotos = [
    'data:image/jpeg;base64,/9j/mock1',
    'data:image/jpeg;base64,/9j/mock2'
  ];
  const mockText = '測試文字';
  const mockDuration = 15;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateVideo', () => {
    it('應該成功生成影片', async () => {
      const generator = new VideoGenerator();
      const result = await generator.generateVideo({
        photos: mockPhotos,
        text: mockText,
        duration: mockDuration
      });

      expect(result.success).toBe(true);
      expect(result.videoUrl).toMatch(/^\/videos\/video-.*\.mp4$/);
      expect(fs.writeFile).toHaveBeenCalledTimes(mockPhotos.length);
      expect(ffmpeg).toHaveBeenCalled();
    });

    it('當照片格式無效時應該拋出錯誤', async () => {
      const generator = new VideoGenerator();
      const invalidPhotos = ['invalid base64'];

      const result = await generator.generateVideo({
        photos: invalidPhotos,
        text: mockText,
        duration: mockDuration
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid photo format');
    });

    it('當文字超過限制時應該拋出錯誤', async () => {
      const generator = new VideoGenerator();
      const longText = 'a'.repeat(501);

      const result = await generator.generateVideo({
        photos: mockPhotos,
        text: longText,
        duration: mockDuration
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Text length exceeds limit');
    });

    it('當照片數組為空時應該拋出錯誤', async () => {
      const generator = new VideoGenerator();
      
      const result = await generator.generateVideo({
        photos: [],
        text: mockText,
        duration: mockDuration
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('No photos provided');
    });

    it('當文字為空時應該拋出錯誤', async () => {
      const generator = new VideoGenerator();
      
      const result = await generator.generateVideo({
        photos: mockPhotos,
        text: '',
        duration: mockDuration
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Text cannot be empty');
    });

    it('當持續時間無效時應該使用預設值', async () => {
      const generator = new VideoGenerator();
      
      const result = await generator.generateVideo({
        photos: mockPhotos,
        text: mockText,
        duration: -1
      });

      expect(result.success).toBe(true);
      expect(ffmpeg).toHaveBeenCalled();
    });

    it('應該正確清理臨時文件', async () => {
      const generator = new VideoGenerator();
      await generator.generateVideo({
        photos: mockPhotos,
        text: mockText,
        duration: mockDuration
      });

      expect(fs.unlink).toHaveBeenCalledTimes(mockPhotos.length);
    });

    it('當 FFmpeg 處理失敗時應該拋出錯誤', async () => {
      const mockError = new Error('FFmpeg processing failed');
      (ffmpeg as jest.Mock).mockImplementationOnce(() => ({
        input: jest.fn().mockReturnThis(),
        outputOptions: jest.fn().mockReturnThis(),
        save: jest.fn().mockImplementation((path: string, callback: (error: Error | null) => void) => {
          callback(mockError);
        })
      }));

      const generator = new VideoGenerator();
      const result = await generator.generateVideo({
        photos: mockPhotos,
        text: mockText,
        duration: mockDuration
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('FFmpeg processing failed');
    });
  });

  describe('檔案系統操作', () => {
    it('應該在初始化時創建必要的目錄', async () => {
      const generator = new VideoGenerator();
      
      expect(fs.mkdir).toHaveBeenCalledWith('./public/storage', { recursive: true });
      expect(fs.mkdir).toHaveBeenCalledWith('./temp', { recursive: true });
      expect(fs.mkdir).toHaveBeenCalledWith('./public/videos', { recursive: true });
    });

    it('當目錄創建失敗時應該拋出錯誤', async () => {
      const mockError = new Error('Failed to create directory');
      (fs.mkdir as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(() => new VideoGenerator()).rejects.toThrow('Failed to create directory');
    });
  });
}); 