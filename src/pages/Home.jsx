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
            mb: 3,
            color: texts.about.titleColor
          }}
        >
          {texts.about.title}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: '1.1rem',
            lineHeight: 1.8,
            color: texts.about.textColor
          }}
          dangerouslySetInnerHTML={{ __html: texts.about.text }}
        />
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
          Ürünlerimiz
        </Typography>
        <Grid container spacing={3}>
          {products.filter(product => product.isActive).map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {product.images && product.images.length > 0 && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images[0]}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {product.name}
                  </Typography>
                  <Typography>
                    {product.description}
                  </Typography>
                </CardContent>
                {product.amazonLink && (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      component={Link}
                      href={product.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Amazon'da Görüntüle
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 