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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const updateUser = useCallback(async (updatedUserData: User) => {
    if (!updatedUserData?.id) return;
    try {
      const userRef = doc(db, 'users', updatedUserData.id);
      await setDoc(userRef, updatedUserData, { merge: true });
      setUser(updatedUserData);
    } catch (error) {
      console.error('Falha ao atualizar o usuário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro de Sincronização',
        description: 'Não foi possível salvar suas alterações. Verifique sua conexão.',
      });
    }
  }, [toast]);

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
             console.error("Erro ao buscar dados do usuário do Firestore:", error);
             // Create a basic user object to keep the app functional
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
             toast({
                variant: 'destructive',
                title: 'Você está offline',
                description: 'Não foi possível carregar todos os seus dados. Algumas funcionalidades podem estar limitadas.',
             });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = { user, loading, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
