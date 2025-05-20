import { useState, useCallback } from 'react';
import { Webcam } from '../utils/camera/webcam';

/**
 * Custom hook to handle webcam operations
 * @param {Object} options - Hook options
 * @param {Function} [options.onStart] - Callback when camera starts
 * @param {Function} [options.onStop] - Callback when camera stops
 * @returns {Object} Webcam controls and state
 */
export const useWebcam = ({ onStart, onStop } = {}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const webcam = new Webcam();

  const startCamera = useCallback((videoRef) => {
    if (!videoRef?.current) return;

    webcam.open(videoRef.current);
    videoRef.current.style.display = "block";
    setIsStreaming(true);
    onStart?.();
  }, [onStart]);

  const stopCamera = useCallback((videoRef) => {
    if (!videoRef?.current) return;

    webcam.close(videoRef.current);
    videoRef.current.style.display = "none";
    setIsStreaming(false);
    onStop?.();
  }, [onStop]);

  return {
    isStreaming,
    startCamera,
    stopCamera
  };
}; 