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
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          // New user (likely via Google Sign-In) - create one in Firestore.
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
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle the user state update
      return { success: true };
    } catch (error: any) {
      console.error('Login Error:', error);
      return { success: false, error: error.code };
    }
  };
  
  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the user state update
      return { success: true };
    } catch (error: any) {
      console.error('Google Login Error:', error);
      return { success: false, error: error.code };
    }
  };

  const signup = async (name: string, email: string, pass:string) => {
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
      // onAuthStateChanged will handle the user state update
      return { success: true };
    } catch (error: any) {
      console.error('Signup Error:', error);
      return { success: false, error: error.code };
    }
  };
  
  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will handle setting user to null
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, googleLogin, updateUser: updateUserInFirestore }}>
      {children}
    </AuthContext.Provider>
  );
};
