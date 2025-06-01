import { db, storage } from './index';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  setDoc,
  getDoc,
  query,
  where
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Ürün işlemleri
export const saveProduct = async (product) => {
  try {
    const imageUrls = [];
    // Resimleri Storage'a yükle
    for (const image of product.images) {
      // Eğer resim zaten bir URL ise (mevcut resim)
      if (typeof image === 'string' && image.startsWith('http')) {
        imageUrls.push(image);
        continue;
      }

      // Yeni yüklenen resim dosyası
      if (image instanceof File) {
        const imageRef = ref(storage, `products/${uuidv4()}.${image.name.split('.').pop()}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }
    }

    // Ürün bilgilerini Firestore'a kaydet
    const productData = {
      name: product.name,
      description: product.description || '',
      amazonLink: product.amazonLink || '',
      images: imageUrls,
      isActive: product.isActive,
      createdAt: product.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (product.id) {
      await updateDoc(doc(db, 'products', product.id), productData);
    } else {
      await addDoc(collection(db, 'products'), productData);
    }
    return true;
  } catch (error) {
    console.error('Error saving product:', error);
    return false;
  }
};

// Ürün silme
export const deleteProduct = async (productId, imageUrls) => {
  try {
    // Resimleri Storage'dan sil
    for (const imageUrl of imageUrls) {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    }

    // Ürünü Firestore'dan sil
    await deleteDoc(doc(db, 'products', productId));
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

// Ayarları kaydet
export const saveSettings = async (settings) => {
  try {
    await setDoc(doc(db, 'settings', 'main'), {
      ...settings,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// Ayarları getir
export const getSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'main');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};

// Ürünleri getir
export const getProducts = async () => {
  try {
    const q = query(
      collection(db, 'products'),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      images: doc.data().images
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}; 