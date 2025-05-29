import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Image as ImageIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ProductsIcon
} from '@mui/icons-material';

const AdminPanel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin-login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Slider Yönetimi', icon: <ImageIcon />, path: '/settings' },
    { text: 'Ürün Yönetimi', icon: <ProductsIcon />, path: '/products' },
    { text: 'Site Ayarları', icon: <SettingsIcon />, path: '/settings' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Sol Menü */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Admin Panel
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
              <Divider sx={{ my: 2 }} />
              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Çıkış Yap" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Ana İçerik */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Hoş Geldiniz
            </Typography>
            <Typography paragraph>
              Bu panelden slider ayarlarını, ürünleri ve site içeriğini yönetebilirsiniz.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'primary.light',
                      color: 'white'
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 40 }} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Slider Yönetimi
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/settings')}
                    >
                      Düzenle
                    </Button>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'secondary.light',
                      color: 'white'
                    }}
                  >
                    <ProductsIcon sx={{ fontSize: 40 }} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Ürün Yönetimi
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/products')}
                    >
                      Düzenle
                    </Button>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'info.light',
                      color: 'white'
                    }}
                  >
                    <SettingsIcon sx={{ fontSize: 40 }} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Site Ayarları
                    </Typography>
                    <Button
                      variant="contained"
                      color="info"
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/settings')}
                    >
                      Düzenle
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminPanel; 