import { auth } from '../config/firebase';
import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';

export const facebookAuth = {
  signIn: async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Erro ao fazer login com Facebook:', error);
      throw error;
    }
  },
}; 