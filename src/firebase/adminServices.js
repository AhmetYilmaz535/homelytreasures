import { db, auth } from './index.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  getDocs
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// Admin varlığını kontrol et
export const checkAdminExists = async () => {
  try {
    const adminExistsDoc = await getDoc(doc(db, 'admins', '__admin_exists__'));
    return adminExistsDoc.exists();
  } catch (error) {
    console.error('Error checking admin exists:', error);
    return false;
  }
};

// Admin oluştur
export const createAdmin = async (email, password) => {
  try {
    // Önce admin varlığını kontrol et
    const adminExists = await checkAdminExists();
    if (adminExists) {
      throw new Error('Admin zaten oluşturulmuş!');
    }

    // Yeni admin kullanıcısı oluştur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Admin bilgilerini Firestore'a kaydet
    await setDoc(doc(db, 'admins', user.uid), {
      email: user.email,
      createdAt: new Date().toISOString(),
      role: 'admin'
    });

    // Admin varlık işaretini oluştur
    await setDoc(doc(db, 'admins', '__admin_exists__'), {
      exists: true,
      createdAt: new Date().toISOString()
    });

    return user;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

// Admin girişi
export const adminLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Kullanıcının admin olup olmadığını kontrol et
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (!adminDoc.exists()) {
      await signOut(auth);
      throw new Error('Bu kullanıcı admin değil!');
    }

    return user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Admin çıkışı
export const adminLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}; 