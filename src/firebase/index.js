import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  enableMultiTabIndexedDbPersistence
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

const initializeFirebase = () => {
  try {
    // Firebase'i başlat
    app = initializeApp(firebaseConfig);
    
    // Firestore'u başlat
    db = getFirestore(app);

    // Multi-tab persistence'ı etkinleştir
    if (typeof window !== 'undefined') {
      enableMultiTabIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence enabled in another tab.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser doesn\'t support all of the features required to enable persistence');
        }
      });
    }
    
    // Storage'ı başlat
    storage = getStorage(app);
    
    // Authentication'ı başlat
    auth = getAuth(app);

    // Analytics'i başlat (sadece browser ortamında)
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }

    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
};

// Veritabanını başlat
const initializeDatabase = async () => {
  try {
    // Firebase'i başlat
    const isInitialized = initializeFirebase();
    if (!isInitialized) {
      throw new Error('Firebase initialization failed');
    }

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

// Firebase servislerini ve fonksiyonları export et
export { 
  app, 
  db, 
  storage, 
  auth, 
  analytics,
  initializeDatabase 
}; 