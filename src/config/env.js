/**
 * Environment configuration and validation
 */

/**
 * Required environment variables for the application
 * @type {string[]}
 */
export const REQUIRED_ENV_VARS = {
  // Firebase Config
  FIREBASE: [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ],
  // Roboflow Config (optional)
  ROBOFLOW: [
    "VITE_ROBOFLOW_API_KEY", // For detection project
    "VITE_ROBOFLOW_PROJECT_ID", // For detection project
    "VITE_ROBOFLOW_CLASSIFICATION_API_KEY", // For classification feedback project
    "VITE_ROBOFLOW_CLASSIFICATION_PROJECT_ID", // For classification feedback project
  ],
  // Add other service configs here
};

/**
 * Validates that all required environment variables are present
 * @param {string[]} requiredVars - Array of required environment variable names
 * @throws {Error} If any required environment variables are missing
 */
export const validateEnvVars = (requiredVars) => {
  const missingVars = requiredVars.filter((varName) => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
};

/**
 * Application environment configuration
 * @type {Object}
 */
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
  roboflow: {
    // Detection project (existing)
    apiKey: import.meta.env.VITE_ROBOFLOW_API_KEY,
    projectId: import.meta.env.VITE_ROBOFLOW_PROJECT_ID,
    // Classification feedback project (new)
    classificationApiKey: import.meta.env.VITE_ROBOFLOW_CLASSIFICATION_API_KEY,
    classificationProjectId: import.meta.env.VITE_ROBOFLOW_CLASSIFICATION_PROJECT_ID,
  },
}; 