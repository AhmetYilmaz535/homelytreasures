import { auth, db } from './index.js';
import { 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const ADMIN_UID = 'jYisFTdTDeNFVpLwSESS7rt6KPa2';

// Admin kullanıcısını oluştur veya güncelle
export const createAdminUser = async (email, password) => {
  try {
    let user;
    
    // Önce email'in kayıtlı olup olmadığını kontrol et
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    
    if (signInMethods.length > 0) {
      // Kullanıcı zaten var, giriş yap
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
    } else {
      // Yeni kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
    }

    // Sadece ADMIN_UID'ye sahip kullanıcı için admin rolünü ver
    if (user.uid === ADMIN_UID) {
      await setDoc(doc(db, 'users', user.uid), {
        username: email.split('@')[0],
        role: 'admin',
        email: email,
        createdAt: new Date()
      }, { merge: true });
      return true;
    } else {
      // Admin olmayan kullanıcıyı çıkış yaptır
      await signOut(auth);
      return false;
    }
  } catch (error) {
    console.error('Error creating/updating admin:', error);
    return false;
  }
};

// Giriş yap
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Sadece ADMIN_UID'ye sahip kullanıcıya izin ver
    if (user.uid === ADMIN_UID) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return { success: true, user: userDoc.data() };
      } else {
        // Kullanıcı dokümanı yoksa oluştur
        await setDoc(doc(db, 'users', user.uid), {
          username: email.split('@')[0],
          role: 'admin',
          email: email,
          createdAt: new Date()
        });
        return { success: true, user: { email, role: 'admin' } };
      }
    } else {
      // Admin olmayan kullanıcıyı çıkış yaptır
      await signOut(auth);
      return { success: false, error: 'Unauthorized access' };
    }
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, error: error.message };
  }
};

// Çıkış yap
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
}; 