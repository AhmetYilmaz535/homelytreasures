import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxjlhbXp98gSe73aO5e3elzUmi1XShLmw",
  authDomain: "thehomelytreasures-85664.firebaseapp.com",
  projectId: "thehomelytreasures-85664",
  storageBucket: "thehomelytreasures-85664.firebasestorage.app",
  messagingSenderId: "997659851769",
  appId: "1:997659851769:web:4250797c86846921981b28",
  measurementId: "G-S57L0YME6M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('The current browser doesn\'t support all of the features required to enable persistence');
    }
  });

// Configure Auth persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

export { app, auth, db, analytics }; 