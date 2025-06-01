import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { getAllAvailableImages } from '../utils/imageStore';

const ImageSlider = () => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const firebaseImages = await getAllAvailableImages();
        console.log('Firebase images:', firebaseImages);
        if (firebaseImages.length > 0) {
          setImage(firebaseImages[0]);
          console.log('Selected image:', firebaseImages[0]);
        }
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    loadImage();
  }, []);

  if (!image) return null;

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
          src={image.path}
          alt="Featured Image"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            console.error('Error loading image:', e.target.src);
          }}
        />
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
        Resim Yolu: {image.path}
      </Typography>
    </Box>
  );
};

export default ImageSlider; 