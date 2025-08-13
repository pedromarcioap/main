'use client';

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
    projectId: "izybotanic",
    appId: "1:648909338628:web:e5000b690e4b3d37675d51",
    storageBucket: "izybotanic.firebasestorage.app",
    apiKey: "AIzaSyBZlz6yRqt4rLUTmiFKWOrMjo1PDpMbBG8",
    authDomain: "izybotanic.firebaseapp.com",
    messagingSenderId: "648909338628",
};


// Inicializa o Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializa o Firebase Auth
const auth = getAuth(app);

// Inicializa o Firestore
const db = getFirestore(app);

// Tenta habilitar a persistência offline
try {
  enableIndexedDbPersistence(db)
    .then(() => console.log('Persistência offline do Firestore habilitada.'))
    .catch((err) => {
       if (err.code == 'failed-precondition') {
        // Múltiplas abas abertas, o que pode causar problemas. A persistência só pode ser
        // habilitada em uma aba por vez.
        console.warn(
          'A persistência do Firestore falhou devido a múltiplas abas abertas. A experiência offline pode ser degradada.'
        );
      } else if (err.code == 'unimplemented') {
        // O navegador não suporta a persistência do IndexedDB.
        console.warn(
          'Seu navegador não suporta a persistência de dados offline do Firestore. O aplicativo pode não funcionar offline.'
        );
      }
    });
} catch (err) {
    console.error("Erro ao inicializar a persistência do Firestore:", err);
}


export { app, auth, db };
