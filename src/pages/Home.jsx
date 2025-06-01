import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import ImageSlider from '../components/ImageSlider';
import { getSliderSettings } from '../utils/imageStore';

const Home = () => {
  const [settings, setSettings] = useState({
    texts: {
      heading: {
        text: "Welcome to Our Store",
        color: "#000000",
        fontSize: 32,
        fontWeight: 600
      },
      about: {
        title: "About Us",
        text: "Welcome to The Homely Treasures, your premier destination for unique and carefully curated home products.",
        titleColor: "#000000",
        textColor: "#666666",
        titleSize: 28
      }
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const sliderSettings = await getSliderSettings();
        if (sliderSettings) {
          setSettings(sliderSettings);
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
      {/* Hero Section with Slider */}
      <Box sx={{ my: 4 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: settings.texts.heading.fontSize,
            fontWeight: settings.texts.heading.fontWeight,
            color: settings.texts.heading.color,
            mb: 2,
            textAlign: 'center'
          }}
        >
          {settings.texts.heading.text}
        </Typography>
        <ImageSlider />
      </Box>

      {/* About Section */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2, backgroundColor: 'background.paper' }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontSize: settings.texts.about.titleSize,
            color: settings.texts.about.titleColor,
            mb: 2
          }}
        >
          {settings.texts.about.title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: settings.texts.about.textColor,
            fontSize: 16,
            lineHeight: 1.6
          }}
        >
          {settings.texts.about.text}
        </Typography>
      </Paper>

      {/* Products Preview Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontSize: 28,
            color: 'text.primary',
            mb: 3,
            textAlign: 'center'
          }}
        >
          Featured Products
        </Typography>
        <Grid container spacing={3}>
          {/* Product cards will be dynamically loaded here */}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 