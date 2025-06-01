import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Box, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const ImageSlider = ({ images = [], settings = null, height = 400, autoPlay = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTransition = useCallback((newIndex) => {
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    setTimeout(() => setIsTransitioning(false), settings?.effects?.transition?.duration || 800);
  }, [settings?.effects?.transition?.duration]);

  useEffect(() => {
    let interval;
    if (autoPlay && settings?.autoplay && images.length > 1) {
      interval = setInterval(() => {
        handleTransition((currentIndex + 1) % images.length);
      }, settings?.autoplaySpeed || 6000);
    }
    return () => clearInterval(interval);
  }, [currentIndex, settings, images.length, handleTransition, autoPlay]);

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

  const cssVariables = {
    '--ken-burns-duration': `${effects?.kenBurns?.duration || 15000}ms`,
    '--grain-opacity': effects?.filmGrain?.opacity || 0.03,
    '--grain-speed': `${effects?.filmGrain?.animationSpeed || 8}s`
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          height: height,
          width: '100%'
        }}
      >
        <Box
          component="img"
          src={typeof images[currentIndex] === 'string' ? images[currentIndex] : images[currentIndex].path}
          alt={`Slide ${currentIndex + 1}`}
          className={`
            slider-image
            ${isTransitioning ? 'transitioning' : ''}
            ${effects?.kenBurns?.enabled ? 'ken-burns-active' : ''}
            ${effects?.filmGrain?.enabled ? 'film-grain' : ''}
          `}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            ...cssVariables
          }}
          onError={(e) => {
            console.error('Error loading image:', e.target.src);
          }}
        />

        {effects?.transition?.darkOverlay > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: `rgba(0,0,0,${effects.transition.darkOverlay})`,
              transition: 'opacity 500ms ease-in-out',
              opacity: isTransitioning ? 1 : 0,
              pointerEvents: 'none'
            }}
          />
        )}

        {images.length > 1 && (
          <>
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
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ImageSlider; 