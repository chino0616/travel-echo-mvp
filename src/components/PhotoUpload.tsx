'use client';

import React, { useCallback, useEffect } from 'react';
import { Box, Button, Grid, Card, CardMedia, IconButton, styled, Typography } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useDemo } from '@/contexts/DemoContext';

const Input = styled('input')({
  display: 'none',
});

export function PhotoUpload() {
  const { photos, setPhotos } = useDemo();

  useEffect(() => {
    console.log('Current photos:', photos);
    return () => {
      photos.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [photos]);

  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered');
    const files = event.target.files;
    
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    console.log('Files selected:', files.length);

    // 驗證檔案類型和大小
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB 限制
      console.log('File validation:', { name: file.name, isImage, isValidSize, size: file.size });
      return isImage && isValidSize;
    });

    if (validFiles.length === 0) {
      console.log('No valid files found');
      return;
    }

    // 創建新的 URL 物件
    const newPhotos = validFiles.map(file => {
      const url = URL.createObjectURL(file);
      console.log('Created URL for file:', { name: file.name, url });
      return url;
    });

    console.log('Setting new photos:', newPhotos);
    setPhotos(prev => {
      const updated = [...prev, ...newPhotos];
      console.log('Updated photos array:', updated);
      return updated;
    });

    // 清理 input 值，允許重複上傳相同檔案
    event.target.value = '';
  }, [setPhotos]);

  const handlePhotoDelete = useCallback((index: number) => {
    console.log('Deleting photo at index:', index);
    setPhotos(prev => {
      const url = prev[index];
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, [setPhotos]);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <label htmlFor="photo-upload">
          <Input
            accept="image/*"
            id="photo-upload"
            multiple
            type="file"
            onChange={handlePhotoUpload}
            onClick={(e) => {
              // 確保即使選擇相同檔案也會觸發 onChange
              (e.target as HTMLInputElement).value = '';
            }}
          />
          <Button 
            variant="contained" 
            component="span"
            disabled={photos.length >= 10} // 限制最多 10 張照片
          >
            上傳照片 {photos.length > 0 ? `(${photos.length}/10)` : ''}
          </Button>
        </label>
      </Box>

      {photos.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 2 }}>
          尚未上傳任何照片
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {photos.map((photo, index) => (
            <Grid item xs={12} sm={6} md={4} key={photo}>
              <Card sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={photo}
                  alt={`照片 ${index + 1}`}
                  sx={{ 
                    objectFit: 'cover',
                    bgcolor: 'grey.100'
                  }}
                  onError={(e) => {
                    console.error('Image load error:', e);
                    // 如果圖片載入失敗，可以設置一個預設圖片
                    (e.target as HTMLImageElement).src = '/placeholder.jpg';
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handlePhotoDelete(index)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
} 