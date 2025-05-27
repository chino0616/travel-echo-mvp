import { NextRequest } from 'next/server';
import { VideoGenerator } from '@/utils/videoGenerator';
import { GenerationResponse } from '@/utils/mockResponses';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    console.log('收到影片生成請求');
    const data = await req.json();
    console.log('請求數據:', data);
    
    const { photos, text, duration } = data;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      console.error('照片驗證失敗:', { photos });
      return new Response(
        JSON.stringify({
          success: false,
          error: '請提供至少一張照片'
        } as GenerationResponse),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!text || typeof text !== 'string') {
      console.error('文字驗證失敗:', { text });
      return new Response(
        JSON.stringify({
          success: false,
          error: '請提供文字內容'
        } as GenerationResponse),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('開始生成影片，參數:', {
      photoCount: photos.length,
      textLength: text.length,
      duration
    });

    const videoGenerator = new VideoGenerator();
    const videoUrl = await videoGenerator.generateVideo({
      photos,
      text,
      duration: duration || photos.length * 5 // 預設每張照片 5 秒
    });

    console.log('影片生成成功:', videoUrl);

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl
      } as GenerationResponse),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('影片生成詳細錯誤:', {
      error,
      message: error instanceof Error ? error.message : '未知錯誤',
      stack: error instanceof Error ? error.stack : null
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '影片生成失敗'
      } as GenerationResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 