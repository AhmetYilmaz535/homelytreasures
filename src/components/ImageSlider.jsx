import React, { useState, useEffect } from 'react';
import { Paper, Box, IconButton, Typography } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { getAllAvailableImages, getSliderSettings } from '../utils/imageStore';

const ImageSlider = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [settings, setSettings] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const loadImagesAndSettings = async () => {
      try {
        const [firebaseImages, sliderSettings] = await Promise.all([
          getAllAvailableImages(),
          getSliderSettings()
        ]);
        console.log('Firebase images:', firebaseImages);
        console.log('Slider settings:', sliderSettings);
        setImages(firebaseImages);
        setSettings(sliderSettings);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadImagesAndSettings();
  }, []);

  useEffect(() => {
    if (!images.length || !settings?.autoplay) return;

    const interval = setInterval(() => {
      handleNextClick();
    }, settings.autoplaySpeed || 3000);

    return () => clearInterval(interval);
  }, [images.length, settings]);

  const handleTransition = (newIndex) => {
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    setTimeout(() => setIsTransitioning(false), settings?.effects?.transition?.duration || 500);
  };

  const handlePrevClick = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    handleTransition(newIndex);
  };

  const handleNextClick = () => {
    const newIndex = (currentIndex + 1) % images.length;
    handleTransition(newIndex);
  };

  if (!images.length || !settings) return null;

  const { effects } = settings;
  const transitionDuration = effects?.transition?.duration || 500;
  const darkOverlay = effects?.transition?.darkOverlay || 0;
  const blurAmount = effects?.transition?.blurAmount || 0;

  const getKenBurnsStyle = () => {
    if (!effects?.kenBurns?.enabled) return {};
    
    const zoomRange = effects.kenBurns.zoomRange || { min: 1.0, max: 1.2 };
    const duration = effects.kenBurns.duration || 20000;
    
    return {
      animation: `kenBurns ${duration}ms ease-in-out infinite alternate`,
      '@keyframes kenBurns': {
        '0%': {
          transform: `scale(${zoomRange.min})`,
        },
        '100%': {
          transform: `scale(${zoomRange.max})`,
        },
      },
    };
  };

  const getFilmGrainStyle = () => {
    if (!effects?.filmGrain?.enabled) return {};
    
    return {
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: effects.filmGrain.opacity || 0.05,
        backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANxM8mAAAACHRSTlMzMzMzMzMzM85JBgUAAAA1SURBVDjLY2AYBaNg4IDgB2AGH75FIMCIzGFEY6DxWRgRGKJ8dD4LggjBR+ezIIgQ/FEwCgBhdQQFLGKc8AAAAABJRU5ErkJggg==)',
        backgroundRepeat: 'repeat',
        animation: `grain ${effects.filmGrain.animationSpeed || 8}s steps(1) infinite`,
        pointerEvents: 'none',
      },
      '@keyframes grain': {
        '0%, 100%': { transform: 'translate(0, 0)' },
        '10%': { transform: 'translate(-5%, -5%)' },
        '20%': { transform: 'translate(5%, 5%)' },
        '30%': { transform: 'translate(5%, -5%)' },
        '40%': { transform: 'translate(-5%, 5%)' },
        '50%': { transform: 'translate(-10%, 5%)' },
        '60%': { transform: 'translate(15%, 0)' },
        '70%': { transform: 'translate(0, 15%)' },
        '80%': { transform: 'translate(3%, 35%)' },
        '90%': { transform: 'translate(-10%, 10%)' }
      }
    };
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          height: 400,
          width: '100%'
        }}
      >
        <Box
          component="img"
          src={images[currentIndex].path}
          alt={`Slide ${currentIndex + 1}`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: `all ${transitionDuration}ms ease-in-out`,
            filter: isTransitioning ? `blur(${blurAmount}px)` : 'none',
            opacity: isTransitioning ? 0.8 : 1,
            ...getKenBurnsStyle(),
            ...getFilmGrainStyle()
          }}
          onError={(e) => {
            console.error('Error loading image:', e.target.src);
          }}
        />

        {/* Karartma katmanı */}
        {darkOverlay > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: `rgba(0,0,0,${darkOverlay})`,
              transition: `opacity ${transitionDuration}ms ease-in-out`,
              opacity: isTransitioning ? 1 : 0,
              pointerEvents: 'none'
            }}
          />
        )}

        <IconButton
          onClick={handlePrevClick}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
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
          onClick={handleNextClick}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.4)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.6)'
            }
          }}
        >
          <ArrowForward />
        </IconButton>
      </Paper>
      <Typography 
        sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: '#f5f5f5', 
          borderRadius: 1,
          fontFamily: 'monospace',
          wordBreak: 'break-all'
        }}
      >
        Resim Yolu: {images[currentIndex].path}
      </Typography>
    </Box>
  );
};

export default ImageSlider; 