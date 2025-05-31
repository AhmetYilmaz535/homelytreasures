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

    // Resim dosyası kontrolü
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Geçersiz resim dosyası!');
    }

    // Dosya boyutu kontrolü (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Resim boyutu 5MB\'dan büyük olamaz!');
    }

    const imageId = Date.now().toString();
    
    // Storage'a resmi yükle
    const storageRef = ref(storage, `images/${imageId}`);
    
    // Resim sıkıştırma işlemi
    let compressedFile = file;
    if (file.size > 1024 * 1024) { // 1MB'dan büyükse sıkıştır
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      try {
        compressedFile = await imageCompression(file, options);
      } catch (error) {
        console.error('Error compressing image:', error);
        compressedFile = file; // Sıkıştırma başarısız olursa orijinal dosyayı kullan
      }
    }

    // Upload işlemi
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
              url: imageUrl,
              order: currentImages.length + 1,
              createdAt: new Date().toISOString(),
              fileName: file.name,
              size: compressedFile.size,
              originalSize: file.size,
              dimensions: await getImageDimensions(file)
            };

            // Sadece images koleksiyonuna ekle
            await setDoc(doc(db, 'images', imageId), newImage);

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

// Slider ayarlarını al
export const getSliderSettings = async () => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'sliderSettings'));
    const settings = settingsDoc.exists() ? settingsDoc.data() : defaultSettings;
    
    // Seçili resimleri al
    const selectedImagesSnapshot = await getDocs(collection(db, 'selectedImages'));
    const selectedImages = selectedImagesSnapshot.docs
      .filter(doc => doc.id !== '_init')
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => a.order - b.order);

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
    // Mevcut ayarları al
    const currentSettings = await getSliderSettings();
    
    // Yeni ayarları mevcut ayarlarla birleştir
    const mergedSettings = {
      ...currentSettings,
      ...newSettings,
      updatedAt: new Date().toISOString()
    };
    
    // Images özelliğini ayır
    const { images, ...settingsToSave } = mergedSettings;
    
    // Ayarları kaydet
    await setDoc(doc(db, 'settings', 'sliderSettings'), settingsToSave);
    
    window.dispatchEvent(new Event('settingsChanged'));
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
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