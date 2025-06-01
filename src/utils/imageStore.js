import { db, storage } from '../firebase/index.js';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  query,
  orderBy,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable
} from 'firebase/storage';
import imageCompression from 'browser-image-compression';

// Varsayılan resimler
const defaultImages = [
  { id: 'default_1', path: '/images/ana1.jpg', order: 1 },
  { id: 'default_2', path: '/images/ana2.jpg', order: 2 },
  { id: 'default_3', path: '/images/ana3.jpg', order: 3 },
  { id: 'default_4', path: '/images/ana4.jpg', order: 4 }
];

// Maksimum yüklenebilecek resim sayısı
const MAX_IMAGES = 10;

// Varsayılan ayarlar
export const defaultSettings = {
  autoplay: true,
  autoplaySpeed: 3000,
  effects: {
    kenBurns: {
      enabled: false,
      duration: 15000,
      zoomRange: { min: 1.0, max: 1.1 }
    },
    transition: {
      duration: 500,
      blurAmount: 3,
      darkOverlay: 0.1
    },
    filmGrain: {
      enabled: false,
      opacity: 0.03,
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
    },
    about: {
      title: "About Us",
      text: "Welcome to The Homely Treasures, your premier destination for unique and carefully curated home products.",
      titleColor: "#000000",
      textColor: "#666666",
      titleSize: 28
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
    console.log('Getting images from Firebase...');
    const imagesRef = collection(db, 'images');
    const q = query(imagesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    console.log('Raw Firebase data:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    const images = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    console.log('Processed images:', images);
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
    const batch = writeBatch(db);
    
    // Önce tüm seçili resimleri temizle
    const selectedImagesRef = collection(db, 'selectedImages');
    const selectedImagesSnapshot = await getDocs(selectedImagesRef);
    selectedImagesSnapshot.docs.forEach(doc => {
      // _init belgesini silme
      if (doc.id !== '_init') {
        batch.delete(doc.ref);
      }
    });
    
    // Yeni seçili resimleri ekle
    images.forEach(image => {
      // _init belgesini atlayarak devam et
      if (image.id === '_init') return;
      
      const imageRef = doc(db, 'selectedImages', image.id);
      // Undefined değerleri kontrol et
      const imageData = {
        id: image.id || '',
        path: image.path || '',
        order: image.order || 1
      };
      batch.set(imageRef, imageData);
    });
    
    await batch.commit();
    window.dispatchEvent(new Event('settingsChanged'));
    return true;
  } catch (error) {
    console.error('Error saving selected images:', error);
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
    // Mevcut resimleri kontrol et
    const currentImages = await getAllAvailableImages();
    if (currentImages.length >= MAX_IMAGES) {
      throw new Error('Maksimum resim sayısına ulaşıldı!');
    }

    // Resmi sıkıştır
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    const compressedFile = await imageCompression(file, options);

    // Benzersiz ID oluştur
    const imageId = `img_${Date.now()}`;

    // Storage referansı oluştur
    const storageRef = ref(storage, `images/${imageId}`);
    const uploadTask = uploadBytesResumable(storageRef, compressedFile);

    // Upload progress
    await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          window.dispatchEvent(new CustomEvent('uploadProgress', { detail: progress }));
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error('Resim yüklenirken bir hata oluştu!'));
        },
        async () => {
          try {
            const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (!imageUrl) {
              throw new Error('Resim URL\'i alınamadı!');
            }

            const newImage = {
              id: imageId,
              path: imageUrl,
              order: currentImages.length + 1,
              createdAt: new Date().toISOString(),
              fileName: file.name,
              size: compressedFile.size,
              originalSize: file.size,
              dimensions: await getImageDimensions(file)
            };

            // Resmi images koleksiyonuna ekle
            await setDoc(doc(db, 'images', imageId), newImage);

            // Resmi otomatik olarak seçili resimlere ekle
            const selectedImages = await getSelectedImages();
            await saveSelectedImages([...selectedImages, newImage]);

            window.dispatchEvent(new Event('settingsChanged'));
            resolve(newImage);
          } catch (error) {
            console.error('Error finalizing upload:', error);
            reject(error);
          }
        }
      );
    });

    return true;
  } catch (error) {
    console.error('Error adding image:', error);
    throw error;
  }
};

// Resim boyutlarını al
const getImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.src = URL.createObjectURL(file);
  });
};

// Firebase verilerini güncelle
const updateFirebaseData = async () => {
  try {
    console.log('Updating Firebase data...');
    
    // Settings koleksiyonunu güncelle
    await setDoc(doc(db, 'settings', 'sliderSettings'), defaultSettings);
    
    // SelectedImages koleksiyonunu güncelle
    const batch = writeBatch(db);
    
    // Önce tüm seçili resimleri temizle
    const selectedImagesSnapshot = await getDocs(collection(db, 'selectedImages'));
    selectedImagesSnapshot.docs.forEach(doc => {
      if (doc.id !== '_init') {
        batch.delete(doc.ref);
      }
    });
    
    // Yeni resimleri ekle
    defaultImages.forEach(image => {
      const imageRef = doc(db, 'selectedImages', image.id);
      batch.set(imageRef, image);
    });
    
    await batch.commit();
    console.log('Firebase data updated successfully');
    window.dispatchEvent(new Event('settingsChanged'));
    return true;
  } catch (error) {
    console.error('Error updating Firebase data:', error);
    throw error;
  }
};

// Slider ayarlarını al
export const getSliderSettings = async () => {
  try {
    console.log('Getting slider settings...');
    
    // Ayarları al
    const settingsDoc = await getDoc(doc(db, 'settings', 'sliderSettings'));
    let currentSettings = settingsDoc.exists() ? settingsDoc.data() : defaultSettings;
    
    // Eksik ayarları varsayılan değerlerle doldur
    currentSettings = {
      ...defaultSettings,
      ...currentSettings,
      texts: {
        ...defaultSettings.texts,
        ...currentSettings.texts,
        heading: {
          ...defaultSettings.texts.heading,
          ...currentSettings.texts?.heading
        },
        subheading: {
          ...defaultSettings.texts.subheading,
          ...currentSettings.texts?.subheading
        },
        header: {
          ...defaultSettings.texts.header,
          ...currentSettings.texts?.header
        },
        about: {
          ...defaultSettings.texts.about,
          ...currentSettings.texts?.about
        }
      }
    };
    
    // Seçili resimleri al
    const selectedImagesRef = collection(db, 'selectedImages');
    const selectedImagesSnapshot = await getDocs(selectedImagesRef);
    const selectedImages = selectedImagesSnapshot.docs
      .filter(doc => doc.id !== '_init')
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    
    // Eğer hiç ayar yoksa varsayılan ayarları kullan
    if (!settingsDoc.exists()) {
      console.log('No settings found, using defaults...');
      await setDoc(doc(db, 'settings', 'sliderSettings'), currentSettings);
    }
    
    // Ayarları döndür
    return {
      ...currentSettings,
      images: selectedImages
    };
  } catch (error) {
    console.error('Error getting slider settings:', error);
    return {
      ...defaultSettings,
      images: []
    };
  }
};

// Slider ayarlarını güncelle
export const updateSliderSettings = async (newSettings) => {
  try {
    console.log('Updating slider settings with:', newSettings);
    
    // Mevcut ayarları al
    const settingsDoc = await getDoc(doc(db, 'settings', 'sliderSettings'));
    const currentSettings = settingsDoc.exists() ? settingsDoc.data() : defaultSettings;
    
    // Sadece değişen ayarları güncelle
    const mergedSettings = {
      ...currentSettings,
      ...newSettings,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Merged settings:', mergedSettings);
    
    // Ayarları kaydet
    await setDoc(doc(db, 'settings', 'sliderSettings'), mergedSettings);
    
    window.dispatchEvent(new Event('settingsChanged'));
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error('Ayarlar güncellenirken bir hata oluştu: ' + error.message);
  }
};

// Resim sırasını güncelle
export const updateImageOrder = async (images) => {
  try {
    const batch = writeBatch(db);
    
    // Her resmin sırasını güncelle
    images.forEach((image, index) => {
      const imageRef = doc(db, 'images', image.id);
      batch.update(imageRef, { order: index + 1 });
      
      // Eğer resim seçiliyse selectedImages'da da güncelle
      const selectedImageRef = doc(db, 'selectedImages', image.id);
      batch.update(selectedImageRef, { order: index + 1 });
    });
    
    await batch.commit();
    
    window.dispatchEvent(new Event('settingsChanged'));
    return images;
  } catch (error) {
    console.error('Error updating image order:', error);
    throw error;
  }
};

const handleResetEffects = async () => {
  try {
    setLoading(true);
    const newSettings = {
      ...settings,
      autoplay: settings.autoplay ?? defaultSettings.autoplay,
      autoplaySpeed: settings.autoplaySpeed ?? defaultSettings.autoplaySpeed,
      effects: defaultSettings.effects
    };
    
    // Firebase'e kaydet
    const result = await updateSliderSettings(newSettings);
    
    if (result) {
      setSettings(newSettings);
      setUnsavedChanges(false);
      showMessage('Efekt ayarları varsayılan değerlere döndürüldü ve kaydedildi.');
    } else {
      throw new Error('Ayarlar kaydedilemedi.');
    }
  } catch (error) {
    console.error('Error resetting effects:', error);
    showMessage('Efekt ayarları sıfırlanırken bir hata oluştu: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
}; 