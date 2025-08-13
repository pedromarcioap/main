'use client';

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyBZlz6yRqt4rLUTmiFKWOrMjo1PDpMbBG8",
    authDomain: "izybotanic.firebaseapp.com",
    projectId: "izybotanic",
    storageBucket: "izybotanic.firebasestorage.app",
    messagingSenderId: "648909338628",
    appId: "1:648909338628:web:e5000b690e4b3d37675d51",
    measurementId: "G-ZBQTLG0ERH"
};


// Inicializa o Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializa o Firebase Auth
const auth = getAuth(app);

// Inicializa o Firestore com persistência offline
let db;
if (typeof window !== 'undefined') {
  try {
    db = initializeFirestore(app, {
      localCache: { kind: 'persistent' },
    });
    console.log('Firestore initialized with persistent cache.');
  } catch (error) {
    console.error('Error initializing persistent cache, falling back to in-memory.', error);
    db = getFirestore(app);
  }
} else {
  db = getFirestore(app);
}

export { app, auth, db };
