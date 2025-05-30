import { db, storage } from '@firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  setDoc,
  getDoc 
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
    for (const imageFile of product.images) {
      if (imageFile.startsWith('http')) {
        imageUrls.push(imageFile);
        continue;
      }
      const imageRef = ref(storage, `products/${uuidv4()}`);
      await uploadBytes(imageRef, imageFile);
      const url = await getDownloadURL(imageRef);
      imageUrls.push(url);
    }

    // Ürün bilgilerini Firestore'a kaydet
    const productData = {
      ...product,
      images: imageUrls,
      createdAt: new Date()
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
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}; 