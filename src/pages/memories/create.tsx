import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Icon,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface UploadedPhoto {
  url: string;
  name: string;
}

export default function CreateMemory() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [mood, setMood] = useState<'文青' | '幽默' | '感性'>('文青');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.url) {
          setPhotos(prev => [...prev, { url: data.url, name: file.name }]);
        }
      } catch (error) {
        console.error('上傳失敗:', error);
        setError('照片上傳失敗，請重試');
      }
    }
  };

  const handleMoodChange = (
    event: React.MouseEvent<HTMLElement>,
    newMood: '文青' | '幽默' | '感性',
  ) => {
    if (newMood !== null) {
      setMood(newMood);
    }
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (photos.length === 0) {
      setError('請至少上傳一張照片');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // 首先生成文案
      const textResponse = await fetch('/api/memories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripData: {
            photos: photos.length,
            mood: mood,
          },
          mood: mood,
        }),
      });

      const textData = await textResponse.json();
      
      if (!textData.content) {
        throw new Error('文案生成失敗');
      }

      // 然後生成影片
      const videoResponse = await fetch('/api/memories/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: photos.map(p => p.url),
          text: textData.content,
          duration: 15, // 15秒影片
        }),
      });

      const videoData = await videoResponse.json();
      
      if (videoData.url) {
        setGeneratedVideo(videoData.url);
      } else {
        throw new Error('影片生成失敗');
      }
    } catch (error) {
      console.error('生成失敗:', error);
      setError('記憶生成失敗，請重試');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          創建新的旅行記憶
        </Typography>

        {/* 照片上傳區域 */}
        <Box sx={{ my: 4 }}>
          <input
            accept="image/*"
            type="file"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
            id="photo-input"
            multiple
          />
          <label htmlFor="photo-input">
            <Button
              variant="contained"
              component="span"
              fullWidth
              sx={{ mb: 2 }}
            >
              上傳照片
            </Button>
          </label>

          {/* 已上傳的照片預覽 */}
          <Grid container spacing={2}>
            {photos.map((photo, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={photo.url}
                      alt={photo.name}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                      }}
                      size="small"
                      onClick={() => handleDeletePhoto(index)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 心情選擇 */}
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            選擇記憶風格
          </Typography>
          <ToggleButtonGroup
            value={mood}
            exclusive
            onChange={handleMoodChange}
            aria-label="記憶風格"
          >
            <ToggleButton value="文青">文青</ToggleButton>
            <ToggleButton value="幽默">幽默</ToggleButton>
            <ToggleButton value="感性">感性</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* 生成按鈕 */}
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={isGenerating || photos.length === 0}
            size="large"
          >
            {isGenerating ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                生成中...
              </>
            ) : (
              '生成記憶'
            )}
          </Button>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>

        {/* 生成的影片預覽 */}
        {generatedVideo && (
          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom align="center">
              你的旅行記憶
            </Typography>
            <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
              <video
                src={generatedVideo}
                controls
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
} 