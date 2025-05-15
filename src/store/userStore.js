import { create } from 'zustand';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

const useUserStore = create((set) => ({
  user: null,
  loading: true,
  setUser: async (authUser) => {
    if (!authUser) {
      set({ user: null, loading: false });
      return;
    }

    try {
      // Fetch additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', authUser.uid));
      const userData = userDoc.data();

      // Combine auth user and Firestore data
      const user = {
        ...userData,
        email: authUser.email,
        uid: authUser.uid,
      };

      set({ user, loading: false });
    } catch (error) {
      console.error('Error fetching user data:', error);
      set({ user: { email: authUser.email, uid: authUser.uid }, loading: false });
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        useUserStore.getState().setUser(authUser);
      } else {
        set({ user: null, loading: false });
      }
    });
    return unsubscribe;
  },
}));

export default useUserStore; 