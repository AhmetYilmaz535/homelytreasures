import React, { useState, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import ImageSlider from '../components/ImageSlider';
import { getSliderSettings } from '../utils/imageStore';

const Home = () => {
  const [settings, setSettings] = useState({
    texts: {
      title: {
        text: "Welcome to Our Store",
        color: "#333",
        fontSize: 32,
        fontWeight: 700
      },
      subtitle: {
        text: "Discover our amazing products",
        color: "#666",
        fontSize: 18,
        fontWeight: 400
      }
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const sliderSettings = await getSliderSettings();
        if (sliderSettings?.texts) {
          setSettings(prev => ({
            ...prev,
            texts: {
              ...prev.texts,
              ...sliderSettings.texts
            }
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
    window.addEventListener('settingsChanged', loadSettings);
    return () => window.removeEventListener('settingsChanged', loadSettings);
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: `${settings.texts.title.fontSize}px`,
            fontWeight: settings.texts.title.fontWeight,
            color: settings.texts.title.color,
            mb: 2
          }}
        >
          {settings.texts.title.text}
        </Typography>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontSize: `${settings.texts.subtitle.fontSize}px`,
            fontWeight: settings.texts.subtitle.fontWeight,
            color: settings.texts.subtitle.color,
            mb: 4
          }}
        >
          {settings.texts.subtitle.text}
        </Typography>
      </Box>
      <ImageSlider />
    </Container>
  );
};

export default Home; 