// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { ENV_CONFIG, REQUIRED_ENV_VARS, validateEnvVars } from "./env";

// Validate Firebase environment variables
validateEnvVars(REQUIRED_ENV_VARS.FIREBASE);

/**
 * Initialize Firebase app instance
 * @type {import("@firebase/app").FirebaseApp}
 */
const app = initializeApp(ENV_CONFIG.firebase);

/**
 * Firebase Authentication instance
 * @type {import("@firebase/auth").Auth}
 */
const auth = getAuth(app);

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