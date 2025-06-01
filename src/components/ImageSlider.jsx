import React, { useState, useEffect } from 'react';
import { Paper, Box, IconButton, Typography } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { getAllAvailableImages } from '../utils/imageStore';

const ImageSlider = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const firebaseImages = await getAllAvailableImages();
        console.log('Firebase images:', firebaseImages);
        setImages(firebaseImages);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (!images.length) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrevClick = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setCurrentIndex(prevIndex => 
      (prevIndex + 1) % images.length
    );
  };

  if (!images.length) return null;

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
            transition: 'opacity 0.5s ease-in-out'
          }}
          onError={(e) => {
            console.error('Error loading image:', e.target.src);
          }}
        />

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