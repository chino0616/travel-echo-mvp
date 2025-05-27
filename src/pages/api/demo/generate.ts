import type { NextApiRequest, NextApiResponse } from 'next';
import { VideoGenerator, VideoGenerationResult } from '@/services/videoGenerator';
import { OpenAIService } from '@/services/openai';

interface KKdayReview {
  orderId: string;
  productId: string;
  productName: string;
  reviewText: string;
  rating: number;
  reviewDate: string;
  photos: string[];
}

interface GenerateResponse extends VideoGenerationResult {
  enhancedText?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const review = req.body as KKdayReview;

    // 驗證輸入
    if (!review.reviewText || !review.photos?.length) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // 使用 OpenAI 增強評論文字
    const openai = new OpenAIService();
    const enhancedText = await openai.enhanceReviewText({
      review: review.reviewText,
      productName: review.productName,
      rating: review.rating
    });

    // 生成影片
    const generator = new VideoGenerator();
    const result = await generator.generateVideo({
      photos: review.photos,
      text: enhancedText,
      duration: 15
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json({
      ...result,
      enhancedText
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
} 