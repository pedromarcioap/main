'use client';

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache,
  memoryLocalCache,
  enableIndexedDbPersistence
} from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyBZlz6yRqt4rLUTmiFKWOrMjo1PDpMbBG8",
    authDomain: "izybotanic.firebaseapp.com",
    projectId: "izybotanic",
    storageBucket: "izybotanic.appspot.com",
    messagingSenderId: "648909338628",
    appId: "1:648909-ZBQTLG0ERH"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Firestore with offline persistence
try {
  enableIndexedDbPersistence(db)
    .then(() => console.log('Persistência offline ativada.'))
    .catch((err) => {
        console.warn('Erro ao ativar persistência offline:', err.code);
    });
} catch (error) {
    console.error("Erro ao inicializar persistência do Firestore", error)
}


export { app, auth, db };
