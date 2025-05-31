import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
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
    
    // Firestore veritabanını başlat
    db = getFirestore(app);
    
    // Storage'ı başlat
    storage = getStorage(app);
    
    // Authentication'ı başlat
    auth = getAuth(app);

    // Analytics'i başlat (sadece browser ortamında)
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }

    // Geliştirme ortamında emülatörleri kullan
    if (import.meta.env.DEV) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
      connectAuthEmulator(auth, 'http://localhost:9099');
    }

    // Offline persistence'ı etkinleştir
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser doesn\'t support all of the features required to enable persistence');
        }
      });
    }

    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
};

// Firebase bağlantı durumunu kontrol et
const checkFirebaseConnection = async () => {
  if (!db) {
    const isInitialized = initializeFirebase();
    if (!isInitialized) {
      throw new Error('Firebase initialization failed');
    }
  }
  
  try {
    // Test dokümanı oluştur
    const testDoc = doc(db, '_connection_test', 'test');
    await setDoc(testDoc, { timestamp: new Date() });
    
    // Test dokümanını oku
    const docSnap = await getDoc(testDoc);
    if (!docSnap.exists()) {
      throw new Error('Test document not found');
    }

    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    throw new Error('Firebase connection failed: ' + error.message);
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

    // Firebase bağlantısını kontrol et
    await checkFirebaseConnection();

    // Settings collection'ı kontrol et
    const settingsDoc = await getDoc(doc(db, 'settings', 'sliderSettings'));
    if (!settingsDoc.exists()) {
      // Settings yoksa oluştur
      await setDoc(doc(db, 'settings', 'sliderSettings'), defaultSettings);
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
  initializeDatabase,
  checkFirebaseConnection,
  initializeFirebase
}; 