'use client';

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

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

// Inicializa o Firestore com persistência offline
let db: ReturnType<typeof getFirestore>;

try {
  // Tenta inicializar com cache persistente
  db = initializeFirestore(app, {
    localCache: { kind: 'persistent' }
  });
  console.log('Firestore initialized with persistent cache.');
} catch (error: any) {
  // Se a inicialização persistente falhar (ex: múltiplas abas abertas),
  // recorre ao cache em memória.
  if (error.code === 'failed-precondition') {
     console.warn(
        'A persistência do Firestore falhou devido a múltiplas abas abertas. Recorrendo ao cache em memória.'
      );
  } else {
    console.error("Could not initialize Firestore with persistent cache, falling back to in-memory cache.", error);
  }
  // Inicializa o Firestore sem persistência se a primeira tentativa falhar.
  db = getFirestore(app);
}


export { app, auth, db };
