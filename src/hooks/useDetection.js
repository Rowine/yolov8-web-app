import { useState, useCallback } from 'react';
import { detect } from '../utils/ml/detect';
import labels from '../utils/data/labels.json';

/**
 * Custom hook to handle object detection operations
 * @param {Object} model - The loaded YOLOv8 model
 * @returns {Object} Detection methods and state
 */
export const useDetection = (model) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Maps class index to correct label, with validation
   * @param {number} classIndex - The predicted class index
   * @returns {string} The correct class label
   */
  const getClassLabel = (classIndex) => {
    // Ensure valid index and return corresponding label
    if (classIndex >= 0 && classIndex < labels.length) {
      return labels[classIndex];
    }
    console.warn(`Invalid class index: ${classIndex}`);
    return 'Unknown';
  };

  const processImage = useCallback(async (imageElement) => {
    if (!model || !imageElement) {
      setError('Model or image not available');
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const rawDetections = await detect(imageElement, model);

      // Process detections to normalize coordinates and ensure correct class mapping
      const processedDetections = rawDetections.map((det) => {
        // Get the correct class label
        const classLabel = getClassLabel(det.classIndex);

        return {
          class: classLabel,
          classIndex: det.classIndex,
          confidence: det.confidence,
          bbox: det.bbox.map((coord, idx) =>
            idx % 2 === 0
              ? coord / imageElement.height
              : coord / imageElement.width
          ),
        };
      });

      // Log detections for debugging
      console.log('Processed detections:', processedDetections);

      return processedDetections;
    } catch (err) {
      console.error('Detection error:', err);
      setError(err.message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [model]);

  return {
    processImage,
    isProcessing,
    error
  };
}; 