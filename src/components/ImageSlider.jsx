import React, { useState, useEffect } from 'react';
import { Box, IconButton, Paper, CircularProgress } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { getSliderSettings } from '../utils/imageStore';

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setLoading(true);
        setError(null);
        const sliderSettings = await getSliderSettings();
        console.log('Loaded slider settings:', sliderSettings);
        
        if (sliderSettings && sliderSettings.images) {
          console.log('Setting images:', sliderSettings.images);
          setSettings(prev => ({
            ...prev,
            ...sliderSettings
          }));
        } else {
          setError('No images found');
        }
      } catch (error) {
        console.error('Error loading slider settings:', error);
        setError(error.message);
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
        Error: {error}
      </Paper>
    );
  }

  if (!settings.images || settings.images.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        No images available
      </Paper>
    );
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
            src={image.path}
            alt={`Slide ${index + 1}`}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: currentIndex === index ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
            onError={(e) => {
              console.error('Error loading image:', image.path);
              e.target.src = '/images/placeholder.jpg';
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