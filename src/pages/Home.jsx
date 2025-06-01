import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, Grid, Card, CardMedia, CardContent, Button, Link } from '@mui/material';
import ImageSlider from '../components/ImageSlider';
import { getSliderSettings } from '../utils/imageStore';
import { getProducts } from '../firebase/services';

const Home = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sliderSettings, productList] = await Promise.all([
          getSliderSettings(),
          getProducts()
        ]);
        setSettings(sliderSettings);
        setProducts(productList);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    window.addEventListener('settingsChanged', loadData);
    return () => window.removeEventListener('settingsChanged', loadData);
  }, []);

  if (loading || !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { texts } = settings;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: texts.heading.fontSize + 'px',
            fontWeight: texts.heading.fontWeight,
            mb: 2,
            color: texts.heading.color,
            textAlign: 'center'
          }}
        >
          {texts.heading.text}
        </Typography>
        <Typography 
          variant="h2" 
          sx={{ 
            fontSize: texts.subheading.fontSize + 'px',
            fontWeight: texts.subheading.fontWeight,
            mb: 4,
            color: texts.subheading.color,
            textAlign: 'center'
          }}
        >
          {texts.subheading.text}
        </Typography>
      </Box>

      <Box sx={{ mb: 6 }}>
        <ImageSlider />
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: texts.about.titleSize + 'px',
            fontWeight: 600,
            mb: 2,
            color: texts.about.titleColor,
            textAlign: 'center'
          }}
        >
          About Us
        </Typography>
        <Typography 
          variant="body1"
          sx={{ 
            fontSize: texts.about.textSize + 'px',
            color: texts.about.textColor,
            textAlign: 'center',
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.8
          }}
        >
          {texts.about.content}
        </Typography>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: texts.about.titleSize + 'px',
            fontWeight: 600,
            mb: 4,
            color: texts.about.titleColor,
            textAlign: 'center'
          }}
        >
          Our Products
        </Typography>
        <Grid container spacing={4}>
          {products.filter(product => product.isActive).map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  },
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                {product.images && product.images.length > 0 && (
                  <CardMedia
                    component="img"
                    height="280"
                    image={product.images[0]}
                    alt={product.name}
                    sx={{ 
                      objectFit: 'cover',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography 
                    gutterBottom 
                    variant="h5" 
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      color: '#2C3E50',
                      mb: 2
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#666',
                      mb: 3,
                      lineHeight: 1.6
                    }}
                  >
                    {product.description}
                  </Typography>
                  {product.amazonLink && (
                    <Button
                      component={Link}
                      href={product.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      fullWidth
                      sx={{
                        mt: 'auto',
                        py: 1.5,
                        backgroundColor: '#FF9900',
                        color: '#fff',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#FF8C00'
                        },
                        borderRadius: 1.5
                      }}
                    >
                      View on Amazon
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 