import { initializeApp } from 'firebase/app';
import { 
  getFirestore,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase servislerini başlat
let app;
let db;
let storage;
let auth;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
  
  // Firestore'u cache ayarlarıyla başlat
  db = initializeFirestore(app, {
    cache: {
      sizeBytes: CACHE_SIZE_UNLIMITED
    }
  });
  console.log('Database initialized successfully');
  
  storage = getStorage(app);
  auth = getAuth(app);
  analytics = getAnalytics(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Firebase bağlantı durumunu kontrol et
const checkFirebaseConnection = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Firebase connection successful');
    return true;
  } catch (error) {
    console.error('Firebase connection error:', error);
    return false;
  }
};

// Bağlantıyı kontrol et
checkFirebaseConnection();

// Veritabanını başlat
const initializeDatabase = async () => {
  try {
    // Settings collection'ı kontrol et
    const settingsDoc = await getDoc(doc(db, 'settings', 'sliderSettings'));
    if (!settingsDoc.exists()) {
      // Settings yoksa oluştur
      await setDoc(doc(db, 'settings', 'sliderSettings'), defaultSettings);
      console.log('Default settings created');
    }

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Varsayılan ayarlar
const defaultSettings = {
  texts: {
    header: {
      text: 'The Homely Treasures',
      color: '#000000',
      fontSize: 24,
      fontWeight: 600
    },
    heading: {
      text: 'Welcome to Our Store',
      color: '#000000',
      fontSize: 32,
      fontWeight: 600
    },
    about: {
      title: 'About Us',
      text: 'Welcome to The Homely Treasures, your premier destination for unique and carefully curated home products.',
      titleColor: '#000000',
      textColor: '#666666',
      titleSize: 28
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
      fontSize: 14,
      fontWeight: 400
    },
    rightText: {
      text: 'All rights reserved',
      color: '#666666',
      fontSize: 14,
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

// Firebase servislerini ve fonksiyonları export et
export { 
  app, 
  db, 
  storage, 
  auth, 
  analytics,
  initializeDatabase 
}; 