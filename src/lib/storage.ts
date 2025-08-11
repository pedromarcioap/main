'use client';

import type { User, Plant, JournalEntry, ChatMessage } from '@/types';

const USERS_KEY = 'izybotanic_users';
const SESSION_KEY = 'izybotanic_session';

// Helper to safely access localStorage
const safeLocalStorageGet = (key: string) => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

const safeLocalStorageSet = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

const safeLocalStorageRemove = (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
}

// User Management
export const getUsers = (): User[] => {
  const usersJson = safeLocalStorageGet(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

export const saveUsers = (users: User[]) => {
  safeLocalStorageSet(USERS_KEY, JSON.stringify(users));
};

export const findUserByEmail = (email: string): User | undefined => {
  return getUsers().find((user) => user.email === email);
};

export const addUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
};

export const updateUser = (updatedUser: User) => {
  let users = getUsers();
  users = users.map(user => user.id === updatedUser.id ? updatedUser : user);
  saveUsers(users);
  if (getCurrentUser()?.id === updatedUser.id) {
    setCurrentUser(updatedUser);
  }
};


// Session Management
export const getCurrentUser = (): User | null => {
  const sessionJson = safeLocalStorageGet(SESSION_KEY);
  return sessionJson ? JSON.parse(sessionJson) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    safeLocalStorageSet(SESSION_KEY, JSON.stringify(user));
  } else {
    safeLocalStorageRemove(SESSION_KEY);
  }
};

export const logout = () => {
  safeLocalStorageRemove(SESSION_KEY);
};

// Data Management for current user
export const addPlantToCurrentUser = (plant: Plant) => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        currentUser.plants.push(plant);
        updateUser(currentUser);
    }
}

export const addChatMessageToCurrentUser = (message: ChatMessage) => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        currentUser.chatHistory.push(message);
        updateUser(currentUser);
    }
}

export const grantAchievementToCurrentUser = (achievementId: string) => {
    const currentUser = getCurrentUser();
    if (currentUser && !currentUser.achievements.includes(achievementId)) {
        currentUser.achievements.push(achievementId);
        updateUser(currentUser);
    }
}
