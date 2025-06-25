// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { ENV_CONFIG } from "./env";

// Firebase configuration object
const firebaseConfig = {
  apiKey: ENV_CONFIG.FIREBASE_API_KEY,
  authDomain: ENV_CONFIG.FIREBASE_AUTH_DOMAIN,
  projectId: ENV_CONFIG.FIREBASE_PROJECT_ID,
  storageBucket: ENV_CONFIG.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV_CONFIG.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV_CONFIG.FIREBASE_APP_ID,
  measurementId: ENV_CONFIG.FIREBASE_MEASUREMENT_ID,
};

// Validate required Firebase environment variables
const requiredFirebaseVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

const missingVars = requiredFirebaseVars.filter(varName => !ENV_CONFIG[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
}

/**
 * Initialize Firebase app instance
 * @type {import("@firebase/app").FirebaseApp}
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Authentication instance
 * @type {import("@firebase/auth").Auth}
 */
const auth = getAuth(app);

// Set persistence to LOCAL to keep user logged in after page refresh
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

/**
 * Firebase Firestore instance
 * @type {import("@firebase/firestore").Firestore}
 */
const db = getFirestore(app);

/**
 * Firebase Storage instance
 * @type {import("@firebase/storage").Storage}
 */
const storage = getStorage(app);

// Export the Firebase services
export { auth, db, storage }; 