import { createMocks } from 'node-mocks-http';
import generateHandler from '../generate';
import { VideoGenerator } from '@/services/videoGenerator';

jest.mock('@/services/videoGenerator');

describe('/api/generate', () => {
  const mockPhotos = [
    'data:image/jpeg;base64,/9j/mock1',
    'data:image/jpeg;base64,/9j/mock2'
  ];
  const mockText = '測試文字';
  const mockDuration = 15;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該成功處理有效的請求', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        photos: mockPhotos,
        text: mockText,
        duration: mockDuration
      }
    });

    const mockResult = {
      success: true,
      videoUrl: '/videos/test.mp4'
    };

    (VideoGenerator.prototype.generateVideo as jest.Mock).mockResolvedValueOnce(mockResult);

    await generateHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockResult);
  });

  it('應該處理無效的請求方法', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });

    await generateHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Method not allowed'
    });
  });

  it('應該處理缺少必要參數的請求', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        text: mockText,
        duration: mockDuration
      }
    });

    await generateHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Missing required parameters'
    });
  });

  it('應該處理生成失敗的情況', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        photos: mockPhotos,
        text: mockText,
        duration: mockDuration
      }
    });

    const mockError = {
      success: false,
      error: 'Generation failed'
    };

    (VideoGenerator.prototype.generateVideo as jest.Mock).mockResolvedValueOnce(mockError);

    await generateHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual(mockError);
  });

  it('應該處理請求體解析錯誤', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: null
    });

    await generateHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Invalid request body'
    });
  });

  it('應該處理超大的請求體', async () => {
    const largePhotos = Array(11).fill('data:image/jpeg;base64,/9j/mock');
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        photos: largePhotos,
        text: mockText,
        duration: mockDuration
      }
    });

    await generateHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Too many photos'
    });
  });
}); 