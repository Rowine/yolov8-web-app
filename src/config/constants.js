/**
 * Application-wide constants
 */

/**
 * Routes configuration
 * @type {Object}
 */
export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PROFILE: "/profile",
  HISTORY: "/history",
  NEARBY: "/nearby",
  HELP: "/help",
  LOCATION: "/location",
  RESULT: "/result",
};

/**
 * API endpoints
 * @type {Object}
 */
export const API_ENDPOINTS = {
  GEOCODING: "https://maps.googleapis.com/maps/api/geocode/json",
};

/**
 * Local storage keys
 * @type {Object}
 */
export const STORAGE_KEYS = {
  USER_LOCATION: "user_location",
  THEME: "app_theme",
  LANGUAGE: "app_language",
};

/**
 * Application theme configuration
 * @type {Object}
 */
export const THEME = {
  colors: {
    primary: {
      DEFAULT: "#16a34a", // green-600
      light: "#22c55e", // green-500
      dark: "#15803d", // green-700
    },
    secondary: {
      DEFAULT: "#64748b", // slate-500
      light: "#94a3b8", // slate-400
      dark: "#475569", // slate-600
    },
    error: {
      DEFAULT: "#ef4444", // red-500
      light: "#f87171", // red-400
      dark: "#dc2626", // red-600
    },
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "2.5rem",
  },
};

/**
 * Application settings and defaults
 * @type {Object}
 */
export const APP_CONFIG = {
  defaultLocation: {
    lat: 40.7128,
    lng: -74.006,
  },
  mapDefaults: {
    zoom: 14,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  },
  imageUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
};

/**
 * Model configuration
 * @type {Object}
 */
export const MODEL_CONFIG = {
  confidenceThreshold: 0.30,
  nmsIoUThreshold: 0.80,
  maxDetections: 500,
};