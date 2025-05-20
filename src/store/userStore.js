import { create } from 'zustand';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

/**
 * @typedef {Object} User
 * @property {string} uid - User's unique identifier
 * @property {string} email - User's email address
 * @property {string} [name] - User's display name
 * @property {string} [phone] - User's phone number
 * @property {Object} [farmLocation] - User's farm location
 * @property {number} farmLocation.lat - Farm location latitude
 * @property {number} farmLocation.lng - Farm location longitude
 * @property {Date} [createdAt] - Account creation timestamp
 */

/**
 * @typedef {Object} UserState
 * @property {User|null} user - Current user data
 * @property {boolean} isLoading - Loading state flag
 * @property {boolean} isAuthenticated - Authentication state flag
 * @property {Function} setUser - Function to update user data
 * @property {Function} logout - Function to sign out user
 * @property {Function} initialize - Function to initialize auth listener
 */

/**
 * Zustand store for managing user authentication and data
 * @type {import('zustand').UseBoundStore<UserState>}
 */
const useUserStore = create((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  /**
   * Updates user data in the store
   * @param {import('firebase/auth').User|null} authUser - Firebase auth user
   */
  setUser: async (authUser) => {
    if (!authUser) {
      set({
        user: null,
        isLoading: false,
        isAuthenticated: false
      });
      return;
    }

    try {
      // Fetch additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', authUser.uid));

      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();

      // Combine auth user and Firestore data
      const user = {
        ...userData,
        email: authUser.email,
        uid: authUser.uid,
      };

      set({
        user,
        isLoading: false,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to basic user data if Firestore fetch fails
      set({
        user: {
          email: authUser.email,
          uid: authUser.uid
        },
        isLoading: false,
        isAuthenticated: true
      });
    }
  },

  /**
   * Signs out the current user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await signOut(auth);
      set({
        user: null,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  },

  /**
   * Initializes the authentication listener
   * @returns {Function} Unsubscribe function
   */
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        get().setUser(authUser);
      } else {
        set({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    });
    return unsubscribe;
  },
}));

export default useUserStore; 