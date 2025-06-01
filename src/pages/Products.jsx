import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  FormControlLabel,
  Box,
  Alert,
  Snackbar,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  DeleteForever as DeleteImageIcon
} from '@mui/icons-material';

// Örnek ürün verisi
const defaultProduct = {
  id: null,
  name: '',
  description: '',
  images: [],
  isActive: true,
  amazonLink: ''
};

const Products = () => {
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(defaultProduct);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const handleOpenDialog = (product = defaultProduct) => {
    setCurrentProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProduct(defaultProduct);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { checked } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      isActive: checked
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(imageUrls => {
      setCurrentProduct(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setCurrentProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSave = () => {
    if (!currentProduct.name.trim()) {
      showSnackbar('Please enter a product name!', 'error');
      return;
    }

    if (currentProduct.images.length === 0) {
      showSnackbar('Please upload at least one image!', 'error');
      return;
    }

    if (currentProduct.id) {
      // Update
      setProducts(prev =>
        prev.map(p => p.id === currentProduct.id ? currentProduct : p)
      );
      showSnackbar('Product updated successfully!', 'success');
    } else {
      // Add new product
      const newProduct = {
        ...currentProduct,
        id: Date.now()
      };
      setProducts(prev => [...prev, newProduct]);
      showSnackbar('Product added successfully!', 'success');
    }
    handleCloseDialog();
  };

  const handleDelete = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showSnackbar('Ürün başarıyla silindi!', 'success');
  };

  const handleToggleActive = (productId) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, isActive: !p.isActive } : p
      )
    );
    showSnackbar('Ürün durumu güncellendi!', 'success');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Product Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Product
          </Button>
        </Box>

        <Grid container spacing={3}>
          {products.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                {product.images.length > 0 ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images[0]}
                    alt={product.name}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.200'
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {product.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Number of Images: {product.images.length}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={product.isActive}
                        onChange={() => handleToggleActive(product.id)}
                        color="primary"
                      />
                    }
                    label={product.isActive ? 'Active' : 'Inactive'}
                  />
                </CardContent>
                <CardActions>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(product.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentProduct.id ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={currentProduct.name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amazon Product Link"
                  name="amazonLink"
                  value={currentProduct.amazonLink}
                  onChange={handleInputChange}
                  placeholder="https://www.amazon.com/..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={currentProduct.description}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<ImageIcon />}
                    fullWidth
                  >
                    Upload Images (Multiple)
                  </Button>
                </label>
              </Grid>
              {currentProduct.images.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Uploaded Images
                  </Typography>
                  <ImageList cols={3} rowHeight={200} gap={8}>
                    {currentProduct.images.map((image, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          loading="lazy"
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.7)'
                            }
                          }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <DeleteImageIcon sx={{ color: 'white' }} />
                        </IconButton>
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentProduct.isActive}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label="Product Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Products; 