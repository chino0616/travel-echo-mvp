import { Box, Container, Typography, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Travel Echo - 旅人記憶共鳴系統</title>
        <meta name="description" content="將您的旅行回憶轉化為獨特的視覺記憶" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: '100vh',
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Typography variant="h1" component="h1" align="center" gutterBottom>
            Travel Echo
          </Typography>
          
          <Typography variant="h4" component="h2" align="center" color="text.secondary">
            讓每一段旅程都成為永恆的回憶
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Button variant="contained" size="large" href="/trips">
              開始回憶旅程
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
} 