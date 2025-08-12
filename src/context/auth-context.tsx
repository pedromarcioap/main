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
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUserInFirestore = useCallback(async (updatedUserData: User) => {
    if (!updatedUserData?.id) return;
    try {
      const userRef = doc(db, 'users', updatedUserData.id);
      await setDoc(userRef, updatedUserData, { merge: true });
      setUser(updatedUserData);
    } catch (error) {
      console.error('Falha ao atualizar o usuário:', error);
      // Opcional: reverter o estado local em caso de falha
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        setLoading(true);
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as User);
          } else {
            // Este caso lida com novos usuários, inclusive via Google
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email!,
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
      }
    );

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = { user, loading, logout, updateUser: updateUserInFirestore };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
