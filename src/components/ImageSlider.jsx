import React, { useState, useEffect } from 'react';
import { Paper, Box } from '@mui/material';
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
  );
};

export default ImageSlider; 