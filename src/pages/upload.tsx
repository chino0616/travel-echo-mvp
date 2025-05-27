import { useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        setUploadedUrl(data.url);
      }
    } catch (error) {
      console.error('上傳失敗:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          檔案上傳測試
        </Typography>

        <Box sx={{ my: 2 }}>
          <input
            accept="image/*"
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button variant="contained" component="span">
              選擇照片
            </Button>
          </label>

          {selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Typography>
                已選擇: {selectedFile.name}
              </Typography>
              <Button
                variant="contained"
                onClick={handleUpload}
                sx={{ mt: 1 }}
              >
                上傳
              </Button>
            </Box>
          )}

          {uploadedUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography>上傳成功！</Typography>
              <img
                src={uploadedUrl}
                alt="已上傳的圖片"
                style={{ maxWidth: '100%', marginTop: '1rem' }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
} 