import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
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

let app;
let db;
let storage;
let auth;
let analytics;

try {
  // Firebase'i başlat
  app = initializeApp(firebaseConfig);
  
  // Firestore veritabanını başlat
  db = getFirestore(app);
  
  // Storage'ı başlat
  storage = getStorage(app);
  
  // Authentication'ı başlat
  auth = getAuth(app);
  
  // Analytics'i başlat
  analytics = getAnalytics(app);

  // Offline persistence'ı etkinleştir
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.error('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.error('The current browser doesn\'t support all of the features required to enable persistence');
    }
  });

  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Firebase initialization failed');
}

// Firebase bağlantı durumunu kontrol et
const checkFirebaseConnection = async () => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  
  try {
    const testDoc = doc(db, '_connection_test', 'test');
    await setDoc(testDoc, { timestamp: new Date() });
    await getDoc(testDoc);
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
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

// Veritabanını başlat
const initializeDatabase = async () => {
  try {
    // Firebase bağlantısını kontrol et
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      throw new Error('Firebase connection failed');
    }

    // Settings collection'ı kontrol et
    const settingsDoc = await getDoc(doc(db, 'settings', 'main'));
    if (!settingsDoc.exists()) {
      // Settings yoksa oluştur
      await setDoc(doc(db, 'settings', 'main'), defaultSettings);
      console.log('Default settings created');
    }

    // Images collection'ını oluştur
    const imagesCollectionRef = doc(db, 'images', '_init');
    await setDoc(imagesCollectionRef, { initialized: true }, { merge: true });

    // SelectedImages collection'ını oluştur
    const selectedImagesCollectionRef = doc(db, 'selectedImages', '_init');
    await setDoc(selectedImagesCollectionRef, { initialized: true }, { merge: true });

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

export { 
  app, 
  db, 
  storage, 
  auth, 
  analytics, 
  initializeDatabase,
  checkFirebaseConnection 
}; 