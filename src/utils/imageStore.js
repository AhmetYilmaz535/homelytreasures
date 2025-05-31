import { db, storage } from '../firebase/index.js';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

// Varsayılan resimler
const defaultImages = [
  { id: 1, path: '/images/ana1.jpg', order: 1 },
  { id: 2, path: '/images/ana2.jpg', order: 2 },
  { id: 3, path: '/images/ana3.jpg', order: 3 },
  { id: 4, path: '/images/ana4.jpg', order: 4 }
];

// Maksimum yüklenebilecek resim sayısı
const MAX_IMAGES = 10;

const defaultSettings = {
  autoplay: true,
  autoplaySpeed: 5000,
  effects: {
    kenBurns: {
      enabled: true,
      duration: 20,
      zoomRange: { min: 1.0, max: 1.2 }
    },
    transition: {
      duration: 1.5,
      blurAmount: 10,
      darkOverlay: 0.2
    },
    filmGrain: {
      enabled: true,
      opacity: 0.05,
      animationSpeed: 8
    }
  },
  texts: {
    heading: {
      text: "Welcome Dashboard",
      color: "#000000",
      fontSize: 32,
      fontWeight: 600
    },
    subheading: {
      text: "Manage your content and settings",
      color: "#666666",
      fontSize: 16,
      fontWeight: 400
    },
    header: {
      text: "Image Slider Dashboard",
      color: "#A67C52",
      fontSize: 20,
      fontWeight: 700
    }
  },
  footer: {
    leftText: {
      text: "© 2024 Image Slider. Tüm hakları saklıdır.",
      color: "#666666",
      fontSize: 14,
      fontWeight: 400
    },
    rightText: {
      text: "İletişim: info@imageslider.com",
      color: "#666666",
      fontSize: 14,
      fontWeight: 400
    },
    socialMedia: {
      color: "#666666",
      facebook: { 
        enabled: false, 
        url: "https://facebook.com" 
      },
      twitter: { 
        enabled: false, 
        url: "https://twitter.com" 
      },
      instagram: { 
        enabled: false, 
        url: "https://instagram.com" 
      },
      linkedin: { 
        enabled: false, 
        url: "https://linkedin.com" 
      },
      youtube: { 
        enabled: false, 
        url: "https://youtube.com" 
      },
      amazon: {
        enabled: false,
        url: "https://amazon.com"
      }
    }
  }
};

// Tüm resimleri al
export const getAllAvailableImages = async () => {
  try {
    const imagesRef = collection(db, 'images');
    const q = query(imagesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return images;
  } catch (error) {
    console.error('Error getting available images:', error);
    return [];
  }
};

// Seçili resimleri al
export const getSelectedImages = async () => {
  try {
    const imagesRef = collection(db, 'selectedImages');
    const snapshot = await getDocs(imagesRef);
    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return images;
  } catch (error) {
    console.error('Error getting selected images:', error);
    return [];
  }
};

// Seçili resimleri kaydet
export const saveSelectedImages = async (images) => {
  try {
    // Önce mevcut seçili resimleri temizle
    const snapshot = await getDocs(collection(db, 'selectedImages'));
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Yeni seçili resimleri kaydet
    const savePromises = images.map(image => 
      setDoc(doc(db, 'selectedImages', image.id), image)
    );
    await Promise.all(savePromises);

    window.dispatchEvent(new Event('settingsChanged'));
  } catch (error) {
    console.error('Error saving images:', error);
    throw error;
  }
};

// Resim sil
export const deleteImage = async (imageId) => {
  try {
    // Firestore'dan resmi sil
    await deleteDoc(doc(db, 'images', imageId));
    
    // Storage'dan resmi sil
    const imageRef = ref(storage, `images/${imageId}`);
    await deleteObject(imageRef);
    
    // Seçili resimlerden de kaldır
    await deleteDoc(doc(db, 'selectedImages', imageId));
    
    window.dispatchEvent(new Event('settingsChanged'));
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

// Yeni resim ekle
export const addCustomImage = async (file) => {
  try {
    const currentImages = await getAllAvailableImages();
    
    // Maksimum resim sayısı kontrolü
    if (currentImages.length >= MAX_IMAGES) {
      throw new Error(`Maksimum ${MAX_IMAGES} resim yükleyebilirsiniz!`);
    }

    const imageId = Date.now().toString();
    
    // Storage'a resmi yükle
    const storageRef = ref(storage, `images/${imageId}`);
    await uploadBytes(storageRef, file);
    
    // Yüklenen resmin URL'ini al
    const imageUrl = await getDownloadURL(storageRef);
    
    const newImage = {
      id: imageId,
      path: imageUrl,
      url: imageUrl,
      order: currentImages.length + 1
    };
    
    // Firestore'a resim bilgilerini kaydet
    await setDoc(doc(db, 'images', imageId), newImage);
    
    // Seçili resimlere ekle
    await setDoc(doc(db, 'selectedImages', imageId), newImage);
    
    window.dispatchEvent(new Event('settingsChanged'));
    return newImage;
  } catch (error) {
    console.error('Error adding image:', error);
    throw error;
  }
};

// Slider ayarlarını al
export const getSliderSettings = async () => {
  try {
    const settingsDoc = await getDocs(collection(db, 'settings'));
    const settings = settingsDoc.docs[0]?.data() || defaultSettings;
    
    // Seçili resimleri ayarlara ekle
    const selectedImages = await getSelectedImages();
    return {
      ...settings,
      images: selectedImages
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      ...defaultSettings,
      images: []
    };
  }
};

// Slider ayarlarını güncelle
export const updateSliderSettings = async (newSettings) => {
  try {
    await setDoc(doc(db, 'settings', 'sliderSettings'), newSettings);
    window.dispatchEvent(new Event('settingsChanged'));
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// Resim sırasını güncelle
export const updateImageOrder = async (images) => {
  try {
    const updatePromises = images.map((image, index) => {
      const updatedImage = { ...image, order: index + 1 };
      return setDoc(doc(db, 'images', image.id), updatedImage);
    });
    await Promise.all(updatePromises);
    return images;
  } catch (error) {
    console.error('Error updating image order:', error);
    return images;
  }
}; 