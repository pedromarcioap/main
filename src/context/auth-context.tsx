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
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Define the shape of the authentication error
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
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const mapFirebaseError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email ou senha inválidos.';
    case 'auth/email-already-in-use':
      return 'Este email já está em uso.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Tente uma mais forte.';
    case 'auth/popup-closed-by-user':
      return 'O processo de login com o Google foi cancelado.';
    default:
      return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
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
  }, []);

  const authStateChanged = useCallback(
    async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userData = await fetchUser(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data, logging out.', error);
          await signOut(auth); // Log out on failure to fetch data
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    },
    [fetchUser]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, authStateChanged);
    return () => unsubscribe();
  }, [authStateChanged]);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      throw new Error(mapFirebaseError(error as AuthError));
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
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
      // The onAuthStateChanged listener will handle creating the user document in Firestore
    } catch (error) {
      throw new Error(mapFirebaseError(error as AuthError));
    }
  };

  const updateUser = useCallback(async (updatedUserData: User) => {
    if (!updatedUserData?.id) return;
    try {
      const userRef = doc(db, 'users', updatedUserData.id);
      await setDoc(userRef, updatedUserData, { merge: true });
      setUser(updatedUserData); // Optimistic update
    } catch (error) {
      console.error('Falha ao atualizar o usuário:', error);
      // Optional: Re-fetch or show error
      throw new Error('Não foi possível salvar suas alterações.');
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Falha ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    loginWithEmail,
    loginWithGoogle,
    signupWithEmail,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
