import { db } from '/src/firebase/config.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Varsayılan ayarlar
const defaultSettings = {
  texts: {
    header: {
      text: 'The Homely Treasures',
      color: '#000000',
      fontSize: '24px',
      fontWeight: 600
    },
    heading: {
      text: 'Welcome to Our Store',
      color: '#000000',
      fontSize: '32px',
      fontWeight: 600
    },
    about: {
      title: 'About Us',
      text: 'Welcome to The Homely Treasures, your premier destination for unique and carefully curated home products.',
      titleColor: '#000000',
      textColor: '#666666',
      titleSize: '28px'
    }
  },
  effects: {
    kenBurns: {
      enabled: true,
      duration: 20000,
      zoomRange: 1.2
    },
    transition: {
      duration: 500,
      blurAmount: 2,
      darkOverlay: 0.3
    },
    filmGrain: {
      enabled: true,
      opacity: 0.05,
      animationSpeed: 10
    }
  },
  footer: {
    leftText: {
      text: '© 2024 The Homely Treasures',
      color: '#666666',
      fontSize: '14px',
      fontWeight: 400
    },
    rightText: {
      text: 'All rights reserved',
      color: '#666666',
      fontSize: '14px',
      fontWeight: 400
    },
    socialMedia: {
      facebook: { enabled: false, url: '' },
      twitter: { enabled: false, url: '' },
      instagram: { enabled: false, url: '' },
      linkedin: { enabled: false, url: '' },
      youtube: { enabled: false, url: '' },
      amazon: { enabled: true, url: 'https://amazon.com' }
    }
  }
};

// Veritabanını başlat
export const initializeDatabase = async () => {
  try {
    // Settings collection'ı kontrol et
    const settingsDoc = await getDoc(doc(db, 'settings', 'main'));
    if (!settingsDoc.exists()) {
      // Settings yoksa oluştur
      await setDoc(doc(db, 'settings', 'main'), defaultSettings);
      console.log('Default settings created');
    }

    // Products collection'ı için örnek ürün
    const sampleProductDoc = await getDoc(doc(db, 'products', 'sample'));
    if (!sampleProductDoc.exists()) {
      // Örnek ürün yoksa oluştur
      await setDoc(doc(db, 'products', 'sample'), {
        name: 'Sample Product',
        description: 'This is a sample product description.',
        images: [],
        isActive: true,
        amazonLink: '',
        createdAt: new Date()
      });
      console.log('Sample product created');
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}; 