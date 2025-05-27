import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  LinearProgress,
  Card,
  CardMedia,
  Grid,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon, Share as ShareIcon } from '@mui/icons-material';
import { styled } from '@mui/system';

const Input = styled('input')({
  display: 'none',
});

interface ProgressState {
  stage: string;
  progress: number;
}

export default function Demo() {
  // 狀態管理
  const [photos, setPhotos] = useState<string[]>([]);
  const [tripInfo, setTripInfo] = useState({
    location: '',
    date: '',
    mood: '文青', // 預設心情
  });
  const [generatedText, setGeneratedText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // 參考
  const eventSourceRef = useRef<EventSource | null>(null);

  // 處理照片上傳
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  // 處理照片刪除
  const handlePhotoDelete = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  // 生成記憶文字
  const generateMemory = async () => {
    try {
      const response = await fetch('/api/memories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripData: tripInfo, mood: tripInfo.mood }),
      });

      if (!response.ok) throw new Error('生成記憶失敗');

      const data = await response.json();
      setGeneratedText(data.content);
    } catch (error) {
      setSnackbar({ open: true, message: '生成記憶失敗', severity: 'error' });
    }
  };

  // 生成影片
  const generateVideo = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // 建立帶有參數的 URL
    const params = new URLSearchParams({
      photos: JSON.stringify(photos),
      text: generatedText,
      duration: String(photos.length * 5)
    });

    // 建立 EventSource 連接
    const eventSource = new EventSource(`/api/memories/video?${params.toString()}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received event:', data);
      
      if (data.type === 'progress') {
        setProgress({
          stage: data.stage,
          progress: data.progress,
        });
      } else if (data.type === 'complete') {
        setVideoUrl(data.url);
        eventSource.close();
        setSnackbar({ open: true, message: '影片生成成功！', severity: 'success' });
      } else if (data.type === 'error') {
        eventSource.close();
        setSnackbar({ open: true, message: data.message, severity: 'error' });
      }
    };

    // 添加錯誤處理
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
      setSnackbar({ open: true, message: '連接中斷，請重試', severity: 'error' });
    };
  };

  // 分享功能
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tripInfo.location}的旅行回憶`,
          text: generatedText,
          url: videoUrl,
        });
      } catch (error) {
        console.error('分享失敗:', error);
      }
    } else {
      // 複製連結到剪貼簿
      navigator.clipboard.writeText(videoUrl);
      setSnackbar({ open: true, message: '影片連結已複製到剪貼簿！', severity: 'success' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Travel Echo Demo
      </Typography>

      {/* 旅程資訊輸入 */}
      <Card sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          旅程資訊
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="地點"
              placeholder="例如：京都、清邁夜市、富士山..."
              value={tripInfo.location}
              onChange={(e) => setTripInfo({ ...tripInfo, location: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="日期"
              InputLabelProps={{ shrink: true }}
              value={tripInfo.date}
              onChange={(e) => setTripInfo({ ...tripInfo, date: e.target.value })}
            />
          </Grid>
        </Grid>
      </Card>

      {/* 照片上傳 */}
      <Card sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          照片上傳
        </Typography>
        <Box sx={{ mb: 2 }}>
          <label htmlFor="photo-upload">
            <Input
              accept="image/*"
              id="photo-upload"
              multiple
              type="file"
              onChange={handlePhotoUpload}
            />
            <Button variant="contained" component="span">
              上傳照片
            </Button>
          </label>
        </Box>
        <Grid container spacing={2}>
          {photos.map((photo, index) => (
            <Grid item xs={6} sm={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={photo}
                  alt={`照片 ${index + 1}`}
                />
                <IconButton
                  size="small"
                  onClick={() => handlePhotoDelete(index)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* 生成按鈕 */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          onClick={generateMemory}
          disabled={!tripInfo.location || !tripInfo.date || photos.length === 0}
          sx={{ mr: 2 }}
        >
          生成記憶
        </Button>
        <Button
          variant="contained"
          onClick={generateVideo}
          disabled={!generatedText || photos.length === 0}
        >
          生成影片
        </Button>
      </Box>

      {/* 進度顯示 */}
      {progress && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" gutterBottom>
            {progress.stage} ({progress.progress}%)
          </Typography>
          <LinearProgress variant="determinate" value={progress.progress} />
        </Box>
      )}

      {/* 生成結果 */}
      {generatedText && (
        <Card sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            生成的記憶
          </Typography>
          <Typography variant="body1">{generatedText}</Typography>
        </Card>
      )}

      {/* 影片預覽 */}
      {videoUrl && (
        <Card sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            生成的影片
          </Typography>
          <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
            <video
              controls
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
              src={videoUrl}
              onError={(e) => {
                console.error('Video error:', e);
                setSnackbar({ 
                  open: true, 
                  message: '影片載入失敗，請重試', 
                  severity: 'error' 
                });
              }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            sx={{ mt: 2 }}
          >
            分享影片
          </Button>
        </Card>
      )}

      {/* 提示訊息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 