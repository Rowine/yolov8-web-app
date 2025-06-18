import { useState, useCallback } from 'react';
import { uploadSimpleDetectionFeedback } from '../utils/export/detectionFeedback';

/**
 * Custom hook to handle detection annotation feedback operations
 * @returns {Object} Feedback submission methods and state
 */
export const useDetectionFeedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitFeedback = useCallback(async (feedbackData) => {
    if (!feedbackData.imageData || !feedbackData.userAnnotations || feedbackData.userAnnotations.length === 0) {
      setError('Missing required feedback data or annotations');
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Use the same Roboflow project as the regular detection uploads
      // This allows the feedback to be part of the same dataset
      const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
      const projectId = import.meta.env.VITE_ROBOFLOW_PROJECT_ID;

      if (!apiKey || !projectId) {
        throw new Error('Roboflow detection project credentials not configured. Please set VITE_ROBOFLOW_API_KEY and VITE_ROBOFLOW_PROJECT_ID environment variables.');
      }

      // Upload feedback to Roboflow
      await uploadSimpleDetectionFeedback(feedbackData, apiKey, projectId);

      setIsSuccess(true);
      return true;
    } catch (err) {
      console.error('Detection feedback submission error:', err);
      setError(err.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    setIsSubmitting(false);
  }, []);

  return {
    submitFeedback,
    isSubmitting,
    error,
    isSuccess,
    resetState
  };
}; 