'use client';

import { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useDemo } from '@/contexts/DemoContext';
import { GenerationProgress } from '@/utils/mockResponses';

export function VideoPlayer() {
  const { photos, text } = useDemo();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBlobData = async (blobUrl: string): Promise<string> => {
    try {
      // 從 Blob URL 獲取數據
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      // 將 Blob 轉換為 Base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('無法讀取照片數據'));
          }
        };
        reader.onerror = () => reject(new Error('讀取照片失敗'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('獲取照片數據失敗:', error);
      throw new Error('無法獲取照片數據');
    }
  };

  const handleGenerate = async () => {
    if (photos.length === 0) {
      setError('請先上傳照片');
      return;
    }

    if (!text) {
      setError('請先生成回憶文字');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setProgress(null);

      // 將所有 Blob URL 轉換為 Base64 數據
      console.log('開始處理照片數據...');
      const photoDataPromises = photos.map(fetchBlobData);
      const photoDataList = await Promise.all(photoDataPromises);
      console.log('照片數據處理完成');

      const requestData = {
        photos: photoDataList,
        text,
        duration: 15, // 預設 15 秒
      };

      console.log('開始生成影片，參數:', {
        photoCount: photos.length,
        textLength: text.length,
        duration: requestData.duration
      });

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        cache: 'no-store',
      });

      console.log('API 回應狀態:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      console.log('API 回應數據:', data);

      if (!data.success) {
        throw new Error(data.error || '影片生成失敗');
      }

      if (!data.videoUrl) {
        throw new Error('未收到影片 URL');
      }

      // 確保影片 URL 是相對路徑
      const fullVideoUrl = data.videoUrl.startsWith('http') 
        ? data.videoUrl 
        : `${window.location.origin}${data.videoUrl}`;

      console.log('設置影片 URL:', fullVideoUrl);
      setVideoUrl(fullVideoUrl);

    } catch (err) {
      console.error('影片生成詳細錯誤:', {
        error: err,
        message: err instanceof Error ? err.message : '未知錯誤',
        stack: err instanceof Error ? err.stack : null
      });
      setError(err instanceof Error ? err.message : '影片生成過程發生錯誤');
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {videoUrl ? (
        <Box sx={{ 
          width: '100%', 
          aspectRatio: '16/9',
          bgcolor: 'black',
          borderRadius: 1,
          overflow: 'hidden'
        }}>
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            style={{ width: '100%', height: '100%' }}
            poster="/video-poster.jpg"
            onError={(e) => {
              console.error('影片載入錯誤:', e);
              setError('影片載入失敗');
            }}
          />
        </Box>
      ) : (
        <Box sx={{
          width: '100%',
          aspectRatio: '16/9',
          bgcolor: 'grey.100',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isGenerating ? (
            <>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="body1">
                {progress?.stage || '正在生成影片...'}
                {progress?.progress ? ` (${progress.progress}%)` : ''}
              </Typography>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={isGenerating || photos.length === 0 || !text}
            >
              生成回憶影片
            </Button>
          )}
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          錯誤：{error}
        </Typography>
      )}
    </Box>
  );
} 