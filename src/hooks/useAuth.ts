import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { FacebookAuthService } from '../services/auth/FacebookAuthService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const facebookAuth = new FacebookAuthService(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithFacebook = async () => {
    try {
      const result = await facebookAuth.signInWithFacebook();
      return result;
    } catch (error) {
      console.error('Erro no login com Facebook:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithFacebook,
    signOut,
  };
} 