'use client';

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

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
const db = getFirestore(app);

try {
    enableIndexedDbPersistence(db)
    .then(() => console.log('Persistência do Firestore ativada.'))
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('A persistência do Firestore falhou, múltiplas abas abertas?');
        } else if (err.code == 'unimplemented') {
            console.warn('O navegador não suporta persistência do Firestore.');
        }
    });
} catch (error) {
    console.error("Erro ao inicializar a persistência do Firestore:", error)
}


export { app, auth, db };
