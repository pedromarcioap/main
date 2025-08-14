'use client';

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache
} from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyBZlz6yRqt4rLUTmiFKWOrMjo1PDpMbBG8",
    authDomain: "izybotanic.firebaseapp.com",
    projectId: "izybotanic",
    storageBucket: "izybotanic.firebasestorage.app",
    messagingSenderId: "648909338628",
    appId: "1:648909338628:web:e5000b690e4b3d37675d51",
    measurementId: "G-ZBQTLG0ERH"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
let db;

if (typeof window !== 'undefined') {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({})
    });
    console.log('Firestore initialized with persistent cache.');
  } catch (error) {
    console.error("Error initializing persistent cache, falling back to in-memory.", error);
    db = getFirestore(app);
  }
} else {
  db = getFirestore(app);
}

const auth = getAuth(app);

export { app, auth, db };
