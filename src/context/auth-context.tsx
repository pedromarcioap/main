'use client';

import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';


export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() } as User);
      } else {
        // This case can happen with Google sign-in if the user is new
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email!,
          passwordHash: '', // Not needed for Google auth
          plants: [],
          journal: [],
          achievements: [],
          chatHistory: [],
        };
        await setDoc(userRef, newUser);
        setUser(newUser);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUser);
    return () => unsubscribe();
  }, [handleUser]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    } finally {
      // Loading state will be set to false by onAuthStateChanged listener
    }
  };
  
  const googleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
        console.error('Erro no login com Google:', error);
        setLoading(false);
        return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  const signup = async (name: string, email: string, pass:string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      const newUser: Omit<User, 'id' | 'passwordHash'> = {
        name,
        email,
        plants: [],
        journal: [],
        achievements: [],
        chatHistory: [],
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      // Let onAuthStateChanged handle setting user and loading state
      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      setLoading(false); // Only set loading false on error, on success onAuthStateChanged handles it
      return { success: false, error: error.message };
    }
  };
  
  const updateUser = async (updatedUserData: User) => {
    if (user) {
      const userRef = doc(db, 'users', updatedUserData.id);
      await setDoc(userRef, updatedUserData, { merge: true });
      setUser(updatedUserData);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, googleLogin, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
