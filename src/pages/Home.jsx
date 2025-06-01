import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress } from '@mui/material';
import ImageSlider from '../components/ImageSlider';
import { getSliderSettings } from '../utils/imageStore';

const Home = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const sliderSettings = await getSliderSettings();
        setSettings(sliderSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
    window.addEventListener('settingsChanged', loadSettings);
    return () => window.removeEventListener('settingsChanged', loadSettings);
  }, []);

  if (loading || !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { texts } = settings;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: texts.heading.fontSize + 'px',
            fontWeight: texts.heading.fontWeight,
            mb: 2,
            color: texts.heading.color,
            textAlign: 'center'
          }}
        >
          {texts.heading.text}
        </Typography>
        <Typography 
          variant="h2" 
          sx={{ 
            fontSize: texts.subheading.fontSize + 'px',
            fontWeight: texts.subheading.fontWeight,
            mb: 4,
            color: texts.subheading.color,
            textAlign: 'center'
          }}
        >
          {texts.subheading.text}
        </Typography>
      </Box>

      <Box sx={{ mb: 6 }}>
        <ImageSlider />
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: texts.about.titleSize + 'px',
            fontWeight: 600,
            mb: 3,
            color: texts.about.titleColor
          }}
        >
          {texts.about.title}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: '1.1rem',
            lineHeight: 1.8,
            color: texts.about.textColor
          }}
          dangerouslySetInnerHTML={{ __html: texts.about.text }}
        />
      </Box>
    </Container>
  );
};

export default Home; 