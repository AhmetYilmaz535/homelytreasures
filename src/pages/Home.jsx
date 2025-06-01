import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ImageSlider from '../components/ImageSlider';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: '2.5rem',
            fontWeight: 600,
            mb: 2,
            color: 'primary.main',
            textAlign: 'center'
          }}
        >
          Welcome to The Homely Treasures
        </Typography>
        <Typography 
          variant="h2" 
          sx={{ 
            fontSize: '1.5rem',
            fontWeight: 400,
            mb: 4,
            color: 'text.secondary',
            textAlign: 'center'
          }}
        >
          Discover our unique collection of home decor
        </Typography>
      </Box>

      <Box sx={{ mb: 6 }}>
        <ImageSlider />
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: '2rem',
            fontWeight: 600,
            mb: 3,
            color: 'primary.main'
          }}
        >
          About Us
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: '1.1rem',
            lineHeight: 1.8,
            color: 'text.secondary'
          }}
        >
          Welcome to The Homely Treasures, your premier destination for unique and carefully curated home products. 
          We believe that every home tells a story, and our collection is designed to help you tell yours. 
          From elegant decor pieces to functional furnishings, each item in our collection is selected with care 
          and attention to quality, design, and sustainability.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 