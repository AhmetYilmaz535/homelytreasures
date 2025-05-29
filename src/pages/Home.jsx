import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Grid, Button } from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getSliderSettings, getAllAvailableImages } from '../utils/imageStore';

const Home = () => {
  const [mainSliderSettings, setMainSliderSettings] = useState(null);
  const [mainImages, setMainImages] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadSettings = () => {
      const settings = getSliderSettings();
      const images = getAllAvailableImages();
      if (settings && images) {
        setMainSliderSettings(settings);
        setMainImages(images);
      }
    };

    const loadProducts = () => {
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        setProducts(parsedProducts.filter(p => p.isActive && p.images.length > 0));
      }
    };

    loadSettings();
    loadProducts();

    window.addEventListener('settingsChanged', loadSettings);
    return () => window.removeEventListener('settingsChanged', loadSettings);
  }, []);

  if (!mainSliderSettings || !mainImages || mainImages.length === 0) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" sx={{ mt: 4 }}>
          Henüz görüntülenecek içerik yok
        </Typography>
      </Container>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: mainSliderSettings.autoplay || false,
    autoplaySpeed: mainSliderSettings.autoplaySpeed || 3000,
    fade: true,
    cssEase: 'linear',
    arrows: true,
    pauseOnHover: true
  };

  const productSliderSettings = {
    ...sliderSettings,
    fade: false,
    speed: 300,
  };

  return (
    <Container maxWidth="lg">
      {/* Ana Slider */}
      {mainImages.length > 0 && (
        <Box sx={{ mb: 4, mt: 4 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              color: mainSliderSettings.texts?.heading?.color || '#000000',
              fontSize: mainSliderSettings.texts?.heading?.fontSize || 32,
              fontWeight: mainSliderSettings.texts?.heading?.fontWeight || 600
            }}
          >
            {mainSliderSettings.texts?.heading?.text || 'Hoş Geldiniz'}
          </Typography>
          <Paper elevation={3} sx={{ p: 1 }}>
            <Slider {...sliderSettings}>
              {mainImages.map((image, index) => (
                <div key={image.id || index}>
                  <img
                    src={image.path}
                    alt={`Slide ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ))}
            </Slider>
          </Paper>
        </Box>
      )}

      {/* About Bölümü */}
      <Box sx={{ mb: 6, mt: 6 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              color: mainSliderSettings.texts?.about?.titleColor || '#A67C52',
              fontSize: mainSliderSettings.texts?.about?.titleSize || 32,
              mb: 3
            }}
          >
            {mainSliderSettings.texts?.about?.title || 'About'}
          </Typography>
          <div
            dangerouslySetInnerHTML={{
              __html: mainSliderSettings.texts?.about?.text || 'Welcome to our store. Here you can find the best products with the best prices.'
            }}
            style={{
              color: mainSliderSettings.texts?.about?.textColor || '#666666',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center'
            }}
          />
        </Paper>
      </Box>

      {/* Ürün Resimleri */}
      {products.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              color: mainSliderSettings.texts?.heading?.color || '#000000',
              fontSize: mainSliderSettings.texts?.heading?.fontSize || 24,
              fontWeight: mainSliderSettings.texts?.heading?.fontWeight || 400,
              mb: 3
            }}
          >
            Ürünlerimiz
          </Typography>
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={2.4} key={product.id}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: mainSliderSettings.texts?.heading?.color || '#000000',
                      textAlign: 'center',
                      mb: 1,
                      fontSize: '1rem',
                      fontWeight: 500
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Slider {...productSliderSettings}>
                      {product.images.map((image, index) => (
                        <div key={index}>
                          <img
                            src={image}
                            alt={`${product.name} - Resim ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      ))}
                    </Slider>
                  </Box>
                  {product.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: 'center',
                        mt: 1,
                        mb: 1,
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}
                    >
                      {product.description}
                    </Typography>
                  )}
                  {product.amazonLink && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<ShoppingCartIcon />}
                      href={product.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        mt: 'auto',
                        backgroundColor: '#FF9900',
                        '&:hover': {
                          backgroundColor: '#FF8400'
                        }
                      }}
                    >
                      Buy on Amazon
                    </Button>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Home; 