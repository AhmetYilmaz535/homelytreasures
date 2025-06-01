import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  CssBaseline,
  Box
} from '@mui/material';
import Home from './pages/Home';
import Products from './pages/Products';
import Footer from './components/Footer';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import Settings from './pages/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#A67C52',
      dark: '#8C6642',
      light: '#D7C9B7',
      contrastText: '#fff',
    },
    secondary: {
      main: '#5E6C74',
      dark: '#3E4A50',
      light: '#6B6E72',
      contrastText: '#fff',
    },
    background: {
      default: '#F4F1EC',
      paper: '#FAF9F7',
    },
    text: {
      primary: '#33383D',
      secondary: '#6B6E72',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontWeight: 600,
      color: '#33383D',
    },
    h2: {
      fontWeight: 600,
      color: '#33383D',
    },
    h3: {
      fontWeight: 600,
      color: '#33383D',
    },
    h4: {
      fontWeight: 600,
      color: '#33383D',
    },
    h5: {
      fontWeight: 600,
      color: '#33383D',
    },
    h6: {
      fontWeight: 600,
      color: '#33383D',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FAF9F7',
          borderBottom: '1px solid #E1D9CF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #E1D9CF',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname === '/settings';

  if (isAdminPage) return null;

  return (
    <AppBar position="static" elevation={0} sx={{ 
      borderRadius: 2,
      mb: 3
    }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontSize: '20px',
            fontWeight: 700,
            color: 'primary.main'
          }}
        >
          The Homely Treasures
        </Typography>
        {!isHomePage && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="primary" 
              component={Link} 
              to="/"
              sx={{ borderRadius: 2 }}
            >
              Home
            </Button>
            <Button 
              color="primary" 
              component={Link} 
              to="/products"
              sx={{ borderRadius: 2 }}
            >
              Products
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App; 