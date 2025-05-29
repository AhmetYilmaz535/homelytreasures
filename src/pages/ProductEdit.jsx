import React, { useState } from 'react';
import {
  Typography,
  Paper,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const ProductEdit = () => {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    inStock: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Product data:', product);
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Product
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update your product information using the form below.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={product.name}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="clothing">Clothing</MenuItem>
                  <MenuItem value="books">Books</MenuItem>
                  <MenuItem value="food">Food</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={product.price}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={product.inStock}
                    onChange={(e) => setProduct(prev => ({
                      ...prev,
                      inStock: e.target.checked
                    }))}
                    color="primary"
                  />
                }
                label="In Stock"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={product.description}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                sx={{ mt: 2 }}
              >
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductEdit; 