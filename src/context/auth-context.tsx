'use client';

import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import * as Auth from '@/lib/auth';
import * as Storage from '@/lib/storage';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const currentUser = Storage.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to load user from storage', error);
      Storage.setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    const foundUser = Storage.findUserByEmail(email);
    if (foundUser && await Auth.verifyPassword(pass, foundUser.passwordHash)) {
      Storage.setCurrentUser(foundUser);
      setUser(foundUser);
      router.push('/dashboard');
      return true;
    }
    return false;
  }, [router]);
  
  const logout = useCallback(() => {
    Storage.logout();
    setUser(null);
    router.push('/login');
  }, [router]);

  const signup = useCallback(async (name: string, email: string, pass:string): Promise<boolean> => {
    if (Storage.findUserByEmail(email)) {
      return false; // User already exists
    }
    const passwordHash = await Auth.hashPassword(pass);
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
      plants: [],
      journal: [],
      achievements: [],
      chatHistory: [],
    };
    Storage.addUser(newUser);
    Storage.setCurrentUser(newUser);
    setUser(newUser);
    router.push('/dashboard');
    return true;
  }, [router]);
  
  const updateUser = useCallback((updatedUserData: User) => {
    setUser(updatedUserData);
    Storage.updateUser(updatedUserData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
