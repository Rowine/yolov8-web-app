import { useState, useEffect, useCallback } from 'react';
import {
  requestFullscreen,
  exitFullscreen,
  isFullscreen,
  isFullscreenAvailable,
  toggleFullscreen,
  isPWA,
  addFullscreenListeners
} from '../utils/fullscreenUtils';

/**
 * Custom hook for managing fullscreen functionality
 * @returns {Object} Fullscreen state and controls
 */
export const useFullscreen = () => {
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isPWAMode, setIsPWAMode] = useState(false);

  // Initialize fullscreen state
  useEffect(() => {
    setIsFullscreenMode(isFullscreen());
    setIsSupported(isFullscreenAvailable());
    setIsPWAMode(isPWA());

    // Add fullscreen change listeners
    const cleanup = addFullscreenListeners((fullscreenState) => {
      setIsFullscreenMode(fullscreenState);
    });

    return cleanup;
  }, []);

  // Request fullscreen
  const enterFullscreen = useCallback(async () => {
    if (isSupported && !isFullscreenMode) {
      const success = await requestFullscreen();
      if (success) {
        setIsFullscreenMode(true);
      }
      return success;
    }
    return false;
  }, [isSupported, isFullscreenMode]);

  // Exit fullscreen
  const leaveFullscreen = useCallback(async () => {
    if (isSupported && isFullscreenMode) {
      const success = await exitFullscreen();
      if (success) {
        setIsFullscreenMode(false);
      }
      return success;
    }
    return false;
  }, [isSupported, isFullscreenMode]);

  // Toggle fullscreen
  const toggle = useCallback(async () => {
    if (isSupported) {
      const success = await toggleFullscreen();
      setIsFullscreenMode(isFullscreen());
      return success;
    }
    return false;
  }, [isSupported]);

  return {
    isFullscreen: isFullscreenMode,
    isSupported,
    isPWA: isPWAMode,
    enterFullscreen,
    exitFullscreen: leaveFullscreen,
    toggleFullscreen: toggle
  };
}; 