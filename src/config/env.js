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
  // Firebase
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,

  // Roboflow
  ROBOFLOW_API_KEY: import.meta.env.VITE_ROBOFLOW_API_KEY,
  ROBOFLOW_PROJECT_ID: import.meta.env.VITE_ROBOFLOW_PROJECT_ID, // Legacy project ID
  ROBOFLOW_CLASSIFICATION_PROJECT_ID: import.meta.env.VITE_ROBOFLOW_CLASSIFICATION_PROJECT_ID, // For rice leaf classification
  ROBOFLOW_DETECTION_PROJECT_ID: import.meta.env.VITE_ROBOFLOW_DETECTION_PROJECT_ID, // For disease/pest detection

  // SMS Service
  SMS_API_KEY: import.meta.env.VITE_SMS_API_KEY,
  SMS_API_SECRET: import.meta.env.VITE_SMS_API_SECRET,
  SMS_FROM_NUMBER: import.meta.env.VITE_SMS_FROM_NUMBER,
}; 