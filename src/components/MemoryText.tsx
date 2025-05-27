'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, CircularProgress, Alert } from '@mui/material';
import { useDemo } from '@/contexts/DemoContext';

export function MemoryText() {
  const { text, setText } = useDemo();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMemory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 這裡應該是呼叫 API 生成文字的邏輯
      // 目前使用模擬數據
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockText = "在這個美麗的午後，陽光灑落在古老的街道上，空氣中瀰漫著淡淡的花香。每一個轉角都帶來新的驚喜，每一刻都是值得珍藏的回憶。";
      
      setText(mockText);
    } catch (err) {
      setError('生成回憶文字時發生錯誤，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={generateMemory}
          disabled={isLoading}
          sx={{ mb: 2 }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              生成中...
            </>
          ) : (
            '生成回憶文字'
          )}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {text && (
        <TextField
          fullWidth
          multiline
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="這裡將顯示生成的回憶文字..."
        />
      )}
    </Box>
  );
} 