import { NextApiRequest, NextApiResponse } from 'next';
import { VideoGenerator } from '@/utils/videoGenerator';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許 POST 請求' });
  }

  try {
    const { photos, text, duration } = req.body;

    if (!photos || !text || !duration) {
      return res.status(400).json({ message: '缺少必要參數' });
    }

    if (!Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ message: '至少需要一張照片' });
    }

    const videoGenerator = new VideoGenerator();
    const videoUrl = await videoGenerator.generateVideo({
      photos,
      text,
      duration,
    });

    return res.status(200).json({ url: videoUrl });
  } catch (error) {
    console.error('影片生成錯誤:', error);
    return res.status(500).json({ message: '影片生成失敗' });
  }
} 