import { NextApiRequest, NextApiResponse } from 'next';
import { VideoGenerator } from '@/utils/videoGenerator';
import { isDevelopment, useMockAPI, mockVideoGeneration } from '@/utils/mockResponses';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只允許 GET 請求' });
  }

  // 設置 SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 用於發送進度更新
  const sendProgress = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { photos: photosStr, text, duration: durationStr } = req.query;

    if (!photosStr || !text || !durationStr) {
      sendProgress({ type: 'error', message: '缺少必要參數' });
      return res.end();
    }

    const photos = JSON.parse(photosStr as string);
    const duration = parseInt(durationStr as string, 10);

    if (!Array.isArray(photos) || photos.length === 0) {
      sendProgress({ type: 'error', message: '至少需要一張照片' });
      return res.end();
    }

    let videoUrl: string;

    if (isDevelopment) {
      // 使用模擬模式
      videoUrl = await mockVideoGeneration(photos, text as string, (progress) => {
        sendProgress({ type: 'progress', ...progress });
      });
    } else {
      // 使用實際的影片生成
      const videoGenerator = new VideoGenerator();
      videoUrl = await videoGenerator.generateVideo({
        photos,
        text: text as string,
        duration,
      }, (progress) => {
        sendProgress({ type: 'progress', ...progress });
      });
    }

    // 發送完成事件
    sendProgress({ type: 'complete', url: videoUrl });
    res.end();
  } catch (error) {
    console.error('影片生成錯誤:', error);
    sendProgress({ type: 'error', message: '影片生成失敗' });
    res.end();
  }
} 