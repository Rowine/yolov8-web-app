import { useState, useCallback } from 'react';
import { uploadSimpleClassificationFeedback } from '../utils/export/classificationFeedback';

/**
 * Custom hook to handle classification feedback operations
 * @returns {Object} Feedback submission methods and state
 */
export const useClassificationFeedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitFeedback = useCallback(async (feedbackData) => {
    if (!feedbackData.imageData || !feedbackData.correctLabel) {
      setError('Missing required feedback data');
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Get credentials from environment variables for classification project
      const apiKey = import.meta.env.VITE_ROBOFLOW_CLASSIFICATION_API_KEY;
      const projectId = import.meta.env.VITE_ROBOFLOW_CLASSIFICATION_PROJECT_ID;

      if (!apiKey || !projectId) {
        throw new Error('Roboflow classification project credentials not configured. Please set VITE_ROBOFLOW_CLASSIFICATION_API_KEY and VITE_ROBOFLOW_CLASSIFICATION_PROJECT_ID environment variables.');
      }

      // Upload feedback to Roboflow
      await uploadSimpleClassificationFeedback(feedbackData, apiKey, projectId);

      setIsSuccess(true);
      return true;
    } catch (err) {
      console.error('Feedback submission error:', err);
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