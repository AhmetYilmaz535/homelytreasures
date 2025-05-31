import React, { useState, useEffect } from 'react';
import { Box, IconButton, Paper } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { getSliderSettings } from '../utils/imageStore';

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [settings, setSettings] = useState({
    images: [],
    autoPlay: true,
    autoPlayInterval: 3000,
    showArrows: true,
    imageHeight: 400
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const sliderSettings = await getSliderSettings();
        if (sliderSettings) {
          setSettings(prev => ({
            ...prev,
            ...sliderSettings
          }));
        }
      } catch (error) {
        console.error('Error loading slider settings:', error);
      }
    };

    loadSettings();
    window.addEventListener('settingsChanged', loadSettings);
    return () => window.removeEventListener('settingsChanged', loadSettings);
  }, []);

  useEffect(() => {
    let interval;
    if (settings.autoPlay && settings.images.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === settings.images.length - 1 ? 0 : prevIndex + 1
        );
      }, settings.autoPlayInterval);
    }
    return () => clearInterval(interval);
  }, [settings.autoPlay, settings.autoPlayInterval, settings.images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? settings.images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === settings.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!settings.images.length) {
    return null;
  }

  return (
    <Paper 
      elevation={3}
      sx={{ 
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        mb: 4
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: settings.imageHeight,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {settings.images.map((image, index) => (
          <Box
            key={index}
            component="img"
            src={image.url}
            alt={`Slide ${index + 1}`}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: currentIndex === index ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
          />
        ))}
        
        {settings.showArrows && (
          <>
            <IconButton
              onClick={handlePrevious}
              sx={{
                position: 'absolute',
                left: 16,
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.4)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.6)'
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 16,
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.4)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.6)'
                }
              }}
            >
              <ArrowForward />
            </IconButton>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ImageSlider; 