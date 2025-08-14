'use client';

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, memoryLocalCache, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyBZlz6yRqt4rLUTmiFKWOrMjo1PDpMbBG8",
    authDomain: "izybotanic.firebaseapp.com",
    projectId: "izybotanic",
    storageBucket: "izybotanic.appspot.com",
    messagingSenderId: "648909338628",
    appId: "1:648909338628:web:e5000b690e4b3d37675d51",
    measurementId: "G-ZBQTLG0ERH"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore with persistent storage
let db;
try {
   db = initializeFirestore(app, {
    localCache: persistentLocalCache({}),
  });
  console.log('Firestore initialized with persistent cache.');
} catch(e) {
  console.error("Failed to initialize persistent cache, falling back to memory cache.", e);
  db = initializeFirestore(app, {
    localCache: memoryLocalCache({})
  })
}


export { app, auth, db };
