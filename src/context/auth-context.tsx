
'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '@/types';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthError extends Error {
  code?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  developerLogin: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const googleProvider = new GoogleAuthProvider();

const mapFirebaseError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/unauthorized-domain':
      return 'Este domínio não está autorizado para operações de autenticação. Por favor, adicione "localhost" aos domínios autorizados no seu console do Firebase.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email ou senha inválidos.';
    case 'auth/email-already-in-use':
      return 'Este email já está em uso.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Tente uma mais forte.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'O processo de login com o Google foi cancelado.';
    case 'auth/network-request-failed':
      return 'Falha de rede. Verifique sua conexão com a internet.';
    default:
      console.error('Firebase Auth Error:', error.code, error.message);
      return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);

  const getOrCreateUser = useCallback(async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    try {
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() } as User;
        } else {
            const newUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Usuário',
                email: firebaseUser.email!,
                nickname: '',
                phone: '',
                photoURL: firebaseUser.photoURL || '',
                plants: [],
                journal: [],
                achievements: [],
                chatHistory: [],
            };
            await setDoc(userRef, newUser);
            return newUser;
        }
    } catch (error) {
        console.warn("Firestore is offline or unreachable. Using fallback user data.", error);
        // Fallback: create a user object without Firestore data.
        // This allows the user to log in even if the database is temporarily unavailable.
        return {
            id: firebaseUser.uid, // Manter o ID do usuário autenticado
            name: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email!,
            nickname: '',
            phone: '',
            photoURL: firebaseUser.photoURL || '',
            plants: [],
            journal: [],
            achievements: [],
            chatHistory: [],
        };
    }
}, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isDevMode) return; // Do not interfere with developer login

      setLoading(true);
      if (firebaseUser) {
        try {
          const userData = await getOrCreateUser(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data, logging out.', error);
          if (auth.currentUser) {
            await signOut(auth);
          }
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [getOrCreateUser, isDevMode]);

  // Efeito de Diagnóstico para Conexão com o Firestore
  useEffect(() => {
    if (user?.id) {
      console.log(`[Diagnóstico] Tentando ouvir o documento do usuário: users/${user.id}`);
      const userRef = doc(db, 'users', user.id);
      const unsubscribe = onSnapshot(userRef,
        (doc) => {
          console.log('[Diagnóstico] Conexão com Firestore bem-sucedida. Dados recebidos:', doc.data());
        },
        (error) => {
          console.error('[Diagnóstico] Erro na conexão com o Firestore:', error);
        }
      );
      return () => unsubscribe();
    }
  }, [user?.id]);


  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      throw new Error(mapFirebaseError(error as AuthError));
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      throw new Error(mapFirebaseError(error as AuthError));
    }
  };

  const signupWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        pass
      );
      await updateProfile(userCredential.user, { displayName: name });
      // onAuthStateChanged will handle creating the user doc.
    } catch (error) {
      throw new Error(mapFirebaseError(error as AuthError));
    }
  };

  const updateUser = useCallback(async (updatedUserData: User) => {
    if (!updatedUserData?.id) {
        throw new Error("User ID is missing.");
    }

    if (isDevMode) {
      // In dev mode, just update local state and resolve immediately
      setUser(updatedUserData);
      return Promise.resolve();
    }

    try {
      const userRef = doc(db, 'users', updatedUserData.id);
      // Write to Firestore first
      await setDoc(userRef, updatedUserData, { merge: true });
      // Then update local state to reflect the persisted data
      setUser(updatedUserData);
    } catch (error) {
      console.error('Falha ao atualizar o usuário no Firestore:', error);
      throw new Error('Não foi possível salvar suas alterações no servidor.');
    }
  }, [isDevMode]);


  const logout = useCallback(async () => {
    setLoading(true);
    if (isDevMode) {
      setIsDevMode(false);
    }
    if (auth.currentUser) {
      await signOut(auth);
    }
    setUser(null);
    setLoading(false);
  }, [isDevMode]);
  
  const developerLogin = useCallback(async () => {
    setLoading(true);
    setIsDevMode(true);
    const devUser: User = {
      id: 'dev-user-id',
      name: 'Desenvolvedor',
      email: 'dev@izybotanic.com',
      nickname: 'Dev',
      phone: '123456789',
      photoURL: '',
      plants: [],
      journal: [],
      achievements: ['first-sprout', 'chatty-gardener'],
      chatHistory: [
        {role: 'bot', content: 'Bem-vindo, Desenvolvedor! Como posso ajudar hoje?'}
      ]
    };
    setUser(devUser);
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    loginWithEmail,
    loginWithGoogle,
    signupWithEmail,
    logout,
    updateUser,
    developerLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
