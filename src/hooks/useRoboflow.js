import { useState, useCallback } from 'react';
import { createRoboflowDataset } from '../utils/export/annotationExport';
import { uploadToRoboflow } from '../utils/export/roboflowAPI';

/**
 * Custom hook to handle Roboflow upload operations
 * @returns {Object} Roboflow upload methods and state
 */
export const useRoboflow = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const uploadToDataset = useCallback(async (imageData, detections) => {
    if (!imageData || !detections?.length) {
      setError('No image or detections available');
      return false;
    }

    setIsUploading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Get credentials from environment variables
      const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
      const projectId = import.meta.env.VITE_ROBOFLOW_PROJECT_ID;

      if (!apiKey || !projectId) {
        throw new Error('Roboflow API key or Project ID not configured');
      }

      // Create the dataset object
      const dataset = createRoboflowDataset(imageData, detections);

      // Upload to Roboflow
      await uploadToRoboflow(dataset, apiKey, projectId);
      setIsSuccess(true);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadToDataset,
    isUploading,
    error,
    isSuccess
  };
}; 