import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
  };
}

export const userService = {
  create: async (user: Omit<User, 'createdAt' | 'updatedAt'>) => {
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        ...user,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  get: async (userId: string): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as User;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  },

  update: async (userId: string, data: Partial<User>) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  updateSettings: async (
    userId: string,
    settings: User['settings']
  ) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        settings,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  },
}; 