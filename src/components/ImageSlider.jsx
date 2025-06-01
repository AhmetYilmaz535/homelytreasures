import React, { useState, useEffect } from 'react';
import { Box, IconButton, Paper } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { getAllAvailableImages } from '../utils/imageStore';

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);

  // Firebase'den resimleri al
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

  // Otomatik geçiş için
  useEffect(() => {
    if (!images.length) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Önceki resme geç
  const handlePrevClick = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Sonraki resme geç
  const handleNextClick = () => {
    setCurrentIndex(prevIndex => 
      (prevIndex + 1) % images.length
    );
  };

  if (!images.length) return null;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        mb: 4,
        height: 400,
        width: '100%'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Mevcut resim */}
        <Box
          component="img"
          src={images[currentIndex].path}
          alt={`Slide ${currentIndex + 1}`}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.5s ease-in-out'
          }}
          onError={(e) => {
            console.error('Error loading image:', e.target.src);
          }}
        />

        {/* Kontrol butonları */}
        <IconButton
          onClick={handlePrevClick}
          sx={{
            position: 'absolute',
            left: 16,
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
      </Box>
    </Paper>
  );
};

export default ImageSlider; 