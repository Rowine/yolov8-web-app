import { useState, useCallback } from 'react';
import { createRoboflowDataset } from '../utils/export/annotationExport';
import { uploadToRoboflow, uploadClassificationToRoboflow } from '../utils/export/roboflowAPI';
import { useOnlineStatus } from './useOnlineStatus';
import { saveOfflineRoboflowUpload } from '../store/offlineStore';

/**
 * Custom hook to handle automatic Roboflow uploads to two different projects
 * @returns {Object} Roboflow upload methods and state
 */
export const useRoboflow = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const isOnline = useOnlineStatus();

  /**
   * Automatically uploads to both classification and detection projects
   * @param {string} imageData - Base64 image data
   * @param {Array} detections - Array of detection objects
   * @param {boolean} isRiceLeaf - Whether the image is classified as rice leaf
   * @param {Object} classification - Classification result object
   */
  const autoUploadToProjects = useCallback(async (imageData, detections, isRiceLeaf, classification) => {
    if (!imageData) {
      setError('No image data available for upload');
      return false;
    }

    setIsUploading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Get credentials from environment variables
      const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
      const classificationProjectId = import.meta.env.VITE_ROBOFLOW_CLASSIFICATION_PROJECT_ID;
      const detectionProjectId = import.meta.env.VITE_ROBOFLOW_PROJECT_ID;

      if (!apiKey) {
        throw new Error('Roboflow API key not configured');
      }

      // If offline, save uploads for later sync
      if (!isOnline) {
        console.log('Offline detected - saving Roboflow uploads for later sync');

        const uploadData = {
          imageData,
          detections,
          isRiceLeaf,
          classification,
          // Don't store API keys or project IDs for security
          uploadType: 'auto-upload'
        };

        await saveOfflineRoboflowUpload(uploadData);
        setIsSuccess(true);
        console.log('Roboflow uploads saved offline successfully');
        return true;
      }

      // If online, proceed with uploads
      const uploadPromises = [];

      // 1. Upload to Classification Project (always upload for rice leaf classification)
      if (classificationProjectId && classification) {
        try {
          const classificationDataset = createClassificationDataset(imageData, classification, isRiceLeaf);
          uploadPromises.push(
            uploadClassificationToRoboflow(classificationDataset, apiKey, classificationProjectId)
              .catch(err => console.error('Classification upload failed:', err))
          );
        } catch (err) {
          console.error('Error creating classification dataset:', err);
        }
      }

      // 2. Upload to Detection Project (only if it's a rice leaf)
      if (detectionProjectId && isRiceLeaf) {
        try {
          let detectionDataset;

          if (detections && detections.length > 0) {
            // Has detections - upload with annotations
            detectionDataset = createRoboflowDataset(imageData, detections);
          } else {
            // Healthy rice leaf - upload unlabeled
            detectionDataset = createUnlabeledDataset(imageData);
          }

          uploadPromises.push(
            uploadToRoboflow(detectionDataset, apiKey, detectionProjectId)
              .catch(err => console.error('Detection upload failed:', err))
          );
        } catch (err) {
          console.error('Error creating detection dataset:', err);
        }
      }

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.allSettled(uploadPromises);
        setIsSuccess(true);
        console.log('Online Roboflow uploads completed successfully');
      }

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [isOnline]);

  // Legacy method for manual uploads (kept for backward compatibility)
  const uploadToDataset = useCallback(async (imageData, detections) => {
    if (!imageData || !detections?.length) {
      setError('No image or detections available');
      return false;
    }

    setIsUploading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
      const projectId = import.meta.env.VITE_ROBOFLOW_PROJECT_ID;

      if (!apiKey || !projectId) {
        throw new Error('Roboflow API key or Project ID not configured');
      }

      // If offline, save for later sync
      if (!isOnline) {
        const uploadData = {
          imageData,
          detections,
          // Don't store API keys or project IDs for security  
          uploadType: 'manual-upload'
        };

        await saveOfflineRoboflowUpload(uploadData);
        setIsSuccess(true);
        console.log('Manual Roboflow upload saved offline successfully');
        return true;
      }

      // If online, proceed with upload
      const dataset = createRoboflowDataset(imageData, detections);
      await uploadToRoboflow(dataset, apiKey, projectId);
      setIsSuccess(true);
      console.log('Manual Roboflow upload completed successfully');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [isOnline]);

  return {
    uploadToDataset, // Legacy method
    autoUploadToProjects, // New automatic upload method
    isUploading,
    error,
    isSuccess
  };
};

/**
 * Creates a dataset for classification project (rice leaf vs not rice leaf)
 * @param {string} imageData - Base64 image data
 * @param {Object} classification - Classification result
 * @param {boolean} isRiceLeaf - Whether image is rice leaf
 * @returns {Object} Classification dataset
 */
const createClassificationDataset = (imageData, classification, isRiceLeaf) => {
  const base64Image = imageData.split(',')[1];

  // For classification, we just need the image and class label
  const className = isRiceLeaf ? 'rice_leaf' : 'not_rice_leaf';

  return {
    image: base64Image,
    annotations: '', // No bounding box annotations for classification
    labelmap: { 0: className },
    format: 'classification',
    metadata: {
      confidence: classification.confidence,
      originalPrediction: classification.prediction,
      isRiceLeaf: isRiceLeaf,
      finalClassName: className
    }
  };
};

/**
 * Creates an unlabeled dataset for healthy rice leaves
 * @param {string} imageData - Base64 image data
 * @returns {Object} Unlabeled dataset
 */
const createUnlabeledDataset = (imageData) => {
  const base64Image = imageData.split(',')[1];

  return {
    image: base64Image,
    annotations: '', // No annotations for unlabeled data
    labelmap: {}, // Empty labelmap for unlabeled
    format: 'unlabeled',
    metadata: {
      type: 'healthy_rice_leaf',
      unlabeled: true
    }
  };
}; 