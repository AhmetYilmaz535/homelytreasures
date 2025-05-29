import React, { useState, useEffect } from 'react';
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
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import Products from './pages/Products';
import { getSliderSettings } from './utils/imageStore';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#A67C52', // Ana kahverengi ton
      dark: '#8C6642', // Koyu kahverengi (hover için)
      light: '#D7C9B7', // Açık kahverengi
      contrastText: '#fff',
    },
    secondary: {
      main: '#5E6C74', // Mavi-gri ton
      dark: '#3E4A50', // Koyu mavi-gri
      light: '#6B6E72', // Açık mavi-gri
      contrastText: '#fff',
    },
    background: {
      default: '#F4F1EC', // Ana arka plan
      paper: '#FAF9F7', // Kart arka planı
    },
    text: {
      primary: '#33383D', // Ana metin rengi
      secondary: '#6B6E72', // İkincil metin rengi
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
  const [headerSettings, setHeaderSettings] = useState({
    text: "Image Slider Dashboard",
    color: "#A67C52",
    fontSize: 20,
    fontWeight: 700
  });

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const loadSettings = () => {
      const settings = getSliderSettings();
      if (settings?.texts?.header) {
        setHeaderSettings(settings.texts.header);
      }
    };

    loadSettings();
    window.addEventListener('settingsChanged', loadSettings);
    return () => window.removeEventListener('settingsChanged', loadSettings);
  }, []);

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
            fontSize: `${headerSettings.fontSize}px`,
            fontWeight: headerSettings.fontWeight,
            color: headerSettings.color || 'primary.main'
          }}
        >
          {headerSettings.text}
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
              to="/settings"
              sx={{ borderRadius: 2 }}
            >
              Settings
            </Button>
            <Button 
              color="primary" 
              component={Link} 
              to="/products"
              sx={{ borderRadius: 2 }}
            >
              Products
            </Button>
            <Button 
              color="primary" 
              component={Link} 
              to="/admin"
              sx={{ borderRadius: 2 }}
            >
              Admin
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

// Auth guard component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          minHeight: '100vh',
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: 2, flex: 1 }}>
            <Header />
            <Box sx={{ mb: 4 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/products" 
                  element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Box>
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App; 