'use client';

import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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
    if (!updatedUserData?.id) return;
    const userRef = doc(db, 'users', updatedUserData.id);
    await setDoc(userRef, updatedUserData, { merge: true });
    setUser(updatedUserData);
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
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email!,
              passwordHash: '',
              plants: [],
              journal: [],
              achievements: [],
              chatHistory: [],
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (error: any) {
      console.error('Login Error:', error);
      setLoading(false);
      return { success: false, error: error.code };
    }
  };
  
  const googleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error: any) {
      console.error('Google Login Error:', error);
      setLoading(false);
      return { success: false, error: error.code };
    }
  };

  const signup = async (name: string, email: string, pass:string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser: User = {
        id: userCredential.user.uid,
        name,
        email,
        passwordHash: '', 
        plants: [],
        journal: [],
        achievements: [],
        chatHistory: [],
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      return { success: true };
    } catch (error: any) {
      console.error('Signup Error:', error);
      setLoading(false);
      return { success: false, error: error.code };
    }
  };
  
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, googleLogin, updateUser: updateUserInFirestore }}>
      {children}
    </AuthContext.Provider>
  );
};
