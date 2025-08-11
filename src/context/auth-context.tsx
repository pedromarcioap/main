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
  logout: () => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUserInFirestore = useCallback(async (updatedUserData: User) => {
    if (updatedUserData) {
      const userRef = doc(db, 'users', updatedUserData.id);
      await setDoc(userRef, updatedUserData, { merge: true });
      setUser(updatedUserData);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as User);
          } else {
            // This case happens with Google sign-in for a new user.
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
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
        } catch (error) {
            console.error("Error fetching user document:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    }
  };
  
  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error: any) {
        console.error('Erro no login com Google:', error);
        return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signup = async (name: string, email: string, pass:string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      // Let onAuthStateChanged handle setting user and loading state
      return { success: true };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, googleLogin, updateUser: updateUserInFirestore }}>
      {children}
    </AuthContext.Provider>
  );
};
