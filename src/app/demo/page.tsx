'use client';

import { Box, Container, Typography, Paper } from '@mui/material';
import { PhotoUpload } from '@/components/PhotoUpload';
import { MemoryText } from '@/components/MemoryText';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useDemo } from '@/contexts/DemoContext';

export default function DemoPage() {
  const { photos } = useDemo();
  
  console.log('DemoPage rendered, photos:', photos);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        旅行回憶生成器
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          1. 上傳照片
        </Typography>
        <PhotoUpload />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          2. 生成回憶文字
        </Typography>
        <MemoryText />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          3. 生成回憶影片
        </Typography>
        <VideoPlayer />
      </Paper>
    </Container>
  );
} 