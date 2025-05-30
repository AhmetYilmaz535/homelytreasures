import { db } from '@/firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}; 