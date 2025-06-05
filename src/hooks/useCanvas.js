import { useEffect, useCallback } from 'react';
import { renderBoxes } from '../utils/rendering/boxRenderer';
import labels from '../utils/data/labels.json';

/**
 * Custom hook to handle canvas operations for detection visualization
 * @param {Object} options - Hook options
 * @param {React.RefObject} options.canvasRef - Reference to canvas element
 * @param {React.RefObject} options.imageRef - Reference to image element
 * @param {Array} options.detections - Array of detection objects
 * @returns {Object} Canvas utility functions
 */
export const useCanvas = ({ canvasRef, imageRef, detections }) => {
  /**
   * Gets the class index from the class name
   * @param {string} className - The class name to look up
   * @returns {number} The index of the class in the labels array
   */
  const getClassIndex = useCallback((className) => {
    const index = labels.indexOf(className);
    if (index === -1) {
      console.warn(`Class name not found in labels: ${className}`);
      return 0; // Return default index if not found
    }
    return index;
  }, []);

  const drawDetections = useCallback(() => {
    if (!canvasRef?.current || !imageRef?.current || !detections?.length) return;

    const canvas = canvasRef.current;
    const image = imageRef.current;
    const rect = image.getBoundingClientRect();

    // Set canvas size to match the displayed image size
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Calculate the actual displayed image dimensions within the container
    const imageAspectRatio = image.naturalWidth / image.naturalHeight;
    const containerAspectRatio = rect.width / rect.height;

    let displayedWidth = rect.width;
    let displayedHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (containerAspectRatio > imageAspectRatio) {
      // Container is wider than image
      displayedWidth = rect.height * imageAspectRatio;
      offsetX = (rect.width - displayedWidth) / 2;
    } else {
      // Container is taller than image
      displayedHeight = rect.width / imageAspectRatio;
      offsetY = (rect.height - displayedHeight) / 2;
    }

    // Extract detection data
    const boxes_data = [];
    const scores_data = [];
    const classes_data = [];

    detections.forEach((det) => {
      const [y1, x1, y2, x2] = det.bbox;
      const scaledBox = [
        y1 * displayedHeight + offsetY,
        x1 * displayedWidth + offsetX,
        y2 * displayedHeight + offsetY,
        x2 * displayedWidth + offsetX,
      ];
      boxes_data.push(...scaledBox);
      scores_data.push(det.confidence);

      // Use the provided classIndex or look it up from the class name
      const classIndex = det.classIndex ?? getClassIndex(det.class);
      classes_data.push(classIndex);
    });

    // Log for debugging
    console.log('Drawing detections:', {
      boxes: boxes_data,
      scores: scores_data,
      classes: classes_data,
      detections,
      displayDimensions: {
        width: displayedWidth,
        height: displayedHeight,
        offsetX,
        offsetY
      }
    });

    // Draw boxes
    renderBoxes(canvas, boxes_data, scores_data, classes_data, [1, 1]);
  }, [canvasRef, imageRef, detections, getClassIndex]);

  // Redraw on window resize
  useEffect(() => {
    window.addEventListener('resize', drawDetections);
    return () => window.removeEventListener('resize', drawDetections);
  }, [drawDetections]);

  return {
    drawDetections
  };
}; 