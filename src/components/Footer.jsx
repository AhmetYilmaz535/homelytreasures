import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, IconButton, Grid } from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Shop as AmazonIcon
} from '@mui/icons-material';
import { getSliderSettings } from '../utils/imageStore';

const Footer = () => {
  const [footerSettings, setFooterSettings] = useState({
    leftText: {
      text: "© 2024 The Homely Treasures. All rights reserved.",
      color: "#666666",
      fontSize: 14,
      fontWeight: 400
    },
    rightText: {
      text: "Contact: info@homelytreasures.com",
      color: "#666666",
      fontSize: 14,
      fontWeight: 400
    },
    socialMedia: {
      facebook: { enabled: true, url: "https://facebook.com" },
      twitter: { enabled: true, url: "https://twitter.com" },
      instagram: { enabled: true, url: "https://instagram.com" },
      linkedin: { enabled: true, url: "https://linkedin.com" },
      youtube: { enabled: true, url: "https://youtube.com" },
      color: "#666666"
    }
  });

  useEffect(() => {
    const loadSettings = () => {
      const settings = getSliderSettings();
      if (settings?.footer) {
        setFooterSettings(settings.footer);
      }
    };

    loadSettings();
    window.addEventListener('settingsChanged', loadSettings);
    return () => window.removeEventListener('settingsChanged', loadSettings);
  }, []);

  const socialIcons = {
    facebook: FacebookIcon,
    twitter: TwitterIcon,
    instagram: InstagramIcon,
    linkedin: LinkedInIcon,
    youtube: YouTubeIcon,
    amazon: AmazonIcon
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography
              variant="body2"
              sx={{
                color: footerSettings.leftText?.color,
                fontSize: footerSettings.leftText?.fontSize,
                fontWeight: footerSettings.leftText?.fontWeight
              }}
            >
              {footerSettings.leftText?.text}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            {Object.entries(socialIcons).map(([platform, Icon]) => (
              footerSettings.socialMedia?.[platform]?.enabled && (
                <IconButton
                  key={platform}
                  component="a"
                  href={footerSettings.socialMedia[platform].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: footerSettings.socialMedia?.color,
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  <Icon />
                </IconButton>
              )
            ))}
          </Grid>

          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography
              variant="body2"
              sx={{
                color: footerSettings.rightText?.color,
                fontSize: footerSettings.rightText?.fontSize,
                fontWeight: footerSettings.rightText?.fontWeight
              }}
            >
              {footerSettings.rightText?.text}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 