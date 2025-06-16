import { useState, useCallback } from 'react';
import { detect } from '../utils/ml/detect';
import { classifyRiceLeaf } from '../utils/ml/classify';
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
      // Step 1: Classify if the image contains a rice leaf
      console.log('Classifying image...');
      let classificationResult;

      try {
        classificationResult = await classifyRiceLeaf(imageElement);
        console.log('Classification result:', classificationResult);
      } catch (classificationError) {
        console.warn('Classification failed, proceeding with detection anyway:', classificationError);
        // If classification fails, assume it's a rice leaf and proceed
        classificationResult = {
          isRiceLeaf: true,
          confidence: 0,
          prediction: 'rice_leaf',
          probabilities: { not_rice_leaf: 0, rice_leaf: 1 }
        };
      }

      // If it's not a rice leaf, return early with classification info
      if (!classificationResult.isRiceLeaf) {
        console.log('Not a rice leaf detected, skipping disease/pest detection');
        return {
          isRiceLeaf: false,
          classification: classificationResult,
          detections: [],
          message: 'This image does not appear to contain a rice leaf. Please capture an image of a rice leaf for disease and pest detection.'
        };
      }

      // Step 2: If it's a rice leaf, proceed with disease/pest detection
      console.log('Rice leaf detected, proceeding with disease/pest detection...');
      const rawDetections = await detect(imageElement, model);

      // Calculate the padding ratios
      const maxSize = Math.max(imageElement.width, imageElement.height);
      const xPadding = (maxSize - imageElement.width) / 2;
      const yPadding = (maxSize - imageElement.height) / 2;
      const xScale = maxSize / imageElement.width;
      const yScale = maxSize / imageElement.height;

      // Process detections to normalize coordinates and ensure correct class mapping
      const processedDetections = rawDetections.map((det) => {
        // Get the correct class label
        const classLabel = getClassLabel(det.classIndex);

        // Unpad and unnormalize the coordinates
        const [y1, x1, y2, x2] = det.bbox;
        const unpadded = [
          (y1 - yPadding) / yScale,
          (x1 - xPadding) / xScale,
          (y2 - yPadding) / yScale,
          (x2 - xPadding) / xScale
        ];

        // Normalize to 0-1 range
        const normalized = [
          unpadded[0] / imageElement.height,
          unpadded[1] / imageElement.width,
          unpadded[2] / imageElement.height,
          unpadded[3] / imageElement.width
        ];

        return {
          class: classLabel,
          classIndex: det.classIndex,
          confidence: det.confidence,
          bbox: normalized
        };
      });

      // Log detections for debugging
      console.log('Processed detections:', processedDetections);

      return {
        isRiceLeaf: true,
        classification: classificationResult,
        detections: processedDetections,
        message: processedDetections.length > 0
          ? `Detected ${processedDetections.length} disease(s)/pest(s) on the rice leaf.`
          : 'Rice leaf detected, but no diseases or pests found.'
      };
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