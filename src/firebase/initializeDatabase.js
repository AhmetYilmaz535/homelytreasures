import { db } from './config';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

export const initializeDatabase = async () => {
  try {
    // Check if settings document exists
    const settingsRef = doc(db, 'settings', 'general');
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      // Initialize default settings
      await setDoc(settingsRef, {
        siteName: 'Homely Treasures',
        description: 'Discover unique home decor and accessories',
        aboutText: 'Welcome to our store',
        contactEmail: 'contact@example.com',
        phoneNumber: '+1234567890',
        address: '123 Main Street',
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: ''
        },
        heroImages: [],
        featuredProducts: []
      });
    }

    // Check if admin user exists
    const adminRef = doc(db, 'users', 'admin');
    const adminDoc = await getDoc(adminRef);

    if (!adminDoc.exists()) {
      // Initialize admin user
      await setDoc(adminRef, {
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date()
      });
    }

    // Initialize other collections if needed
    const usersRef = collection(db, 'users');
    const productsRef = collection(db, 'products');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}; 