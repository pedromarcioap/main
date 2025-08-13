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

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Falha ao fazer logout:', error);
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback(async (updatedUserData: User) => {
    if (!updatedUserData?.id) return;
    try {
      const userRef = doc(db, 'users', updatedUserData.id);
      await setDoc(userRef, updatedUserData, { merge: true });
      setUser(updatedUserData); // Atualiza o estado local após o sucesso
    } catch (error) {
      console.error('Falha ao atualizar o usuário:', error);
      // Aqui você pode querer mostrar um toast de erro para o usuário
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        setLoading(true);
        if (firebaseUser) {
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
             // Cria um usuário básico para evitar que a UI quebre
            const basicUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email!,
              plants: [],
              journal: [],
              achievements: [],
              chatHistory: [],
            };
            setUser(basicUser);
          } finally {
            setLoading(false);
          }
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const value = { user, loading, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
