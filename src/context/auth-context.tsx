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

  const fetchUser = useCallback(async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() } as User);
      } else {
        // This handles the case for a new user, especially after a social login
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
        setUser(newUser);
      }
    } catch (error) {
      console.error(
        'Erro ao buscar dados do usuário do Firestore:',
        error
      );
      const basicUser: User = {
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
      setUser(basicUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(
    async (updatedUserData: User) => {
      if (!updatedUserData?.id) return;
      try {
        const userRef = doc(db, 'users', updatedUserData.id);
        await setDoc(userRef, updatedUserData, { merge: true });
        // After updating, fetch the latest user data to ensure UI consistency
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await fetchUser(firebaseUser);
        }
      } catch (error) {
        console.error('Falha ao atualizar o usuário:', error);
        throw error; // Propagate error for handling in components
      }
    },
    [fetchUser]
  );

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Falha ao fazer logout:', error);
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          await fetchUser(firebaseUser);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [fetchUser]);

  const value = { user, loading, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
