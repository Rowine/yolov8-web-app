/**
 * Utility functions for submitting detection annotation feedback to Roboflow
 */

/**
 * Converts user annotations to YOLO format
 * @param {Array} annotations - Array of user annotation objects
 * @param {number} imageWidth - Image width in pixels
 * @param {number} imageHeight - Image height in pixels
 * @returns {Object} YOLO format annotations and label map
 */
const annotationsToYOLO = (annotations, imageWidth, imageHeight) => {
  const labelMap = {};
  const yoloAnnotations = [];

  annotations.forEach((annotation, index) => {
    // Create label mapping
    const classIndex = Object.values(labelMap).length;
    if (!Object.values(labelMap).includes(annotation.class)) {
      labelMap[classIndex] = annotation.class;
    }

    // Get the class index for this annotation
    const finalClassIndex = Object.keys(labelMap).find(
      key => labelMap[key] === annotation.class
    );

    // Convert normalized bbox to YOLO format
    const [y1, x1, y2, x2] = annotation.bbox;

    // YOLO format: class_id center_x center_y width height (all normalized)
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const width = x2 - x1;
    const height = y2 - y1;

    yoloAnnotations.push(
      `${finalClassIndex} ${centerX.toFixed(6)} ${centerY.toFixed(6)} ${width.toFixed(6)} ${height.toFixed(6)}`
    );
  });

  return {
    annotations: yoloAnnotations.join('\n'),
    labelMap
  };
};

/**
 * Creates a dataset object for Roboflow upload with detection feedback
 * @param {string} imageData - Base64 image data
 * @param {Array} originalDetections - Original model detections
 * @param {Array} userAnnotations - User correction annotations
 * @returns {Object} Dataset object ready for Roboflow API
 */
export const createDetectionFeedbackDataset = (imageData, originalDetections, userAnnotations) => {
  // Remove the data URL prefix to get just the base64 data
  const base64Image = imageData.split(',')[1];

  // For feedback, we primarily want to upload the user annotations
  // as these represent the "correct" annotations
  const { annotations, labelMap } = annotationsToYOLO(userAnnotations);

  return {
    image: base64Image,
    annotations: annotations,
    labelmap: labelMap,
    format: 'yolov8',
    metadata: {
      feedback_type: 'detection_correction',
      original_detections_count: originalDetections.length,
      user_annotations_count: userAnnotations.length,
      submission_time: new Date().toISOString()
    }
  };
};

/**
 * Uploads detection feedback to Roboflow
 * @param {Object} feedbackData - The feedback data
 * @param {Array} feedbackData.originalDetections - Original model detections
 * @param {Array} feedbackData.userAnnotations - User correction annotations
 * @param {string} feedbackData.imageData - Base64 image data
 * @param {string} apiKey - Roboflow API key for detection project
 * @param {string} projectId - Roboflow project ID for detection project
 * @returns {Promise} Response from the Roboflow API
 */
export const uploadDetectionFeedback = async (feedbackData, apiKey, projectId) => {
  try {
    // Generate a unique filename for the feedback
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const filename = `detection_feedback_${timestamp}.jpg`;

    // Remove the data URL prefix to get just the base64 data
    const base64Image = feedbackData.imageData.split(',')[1];

    // Upload the image to Roboflow detection project
    const imageUploadResponse = await fetch(
      `https://api.roboflow.com/dataset/${projectId}/upload?api_key=${apiKey}&name=${filename}`,
      {
        method: 'POST',
        body: base64Image,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const imageData = await imageUploadResponse.json();

    if (!imageData.id) {
      throw new Error('Failed to upload image to Roboflow');
    }

    // Create the dataset with user annotations
    const dataset = createDetectionFeedbackDataset(
      feedbackData.imageData,
      feedbackData.originalDetections,
      feedbackData.userAnnotations
    );

    // Create the payload with annotations and labelmap
    const annotationPayload = {
      annotationFile: dataset.annotations,
      labelmap: dataset.labelmap,
      metadata: {
        ...dataset.metadata,
        tags: [
          'user_feedback',
          'detection_correction',
          `original_count_${feedbackData.originalDetections.length}`,
          `corrected_count_${feedbackData.userAnnotations.length}`
        ]
      }
    };

    // Submit the annotation
    const annotationResponse = await fetch(
      `https://api.roboflow.com/dataset/${projectId}/annotate/${imageData.id}?api_key=${apiKey}&name=${filename.replace('.jpg', '.txt')}`,
      {
        method: 'POST',
        body: JSON.stringify(annotationPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!annotationResponse.ok) {
      const errorData = await annotationResponse.json();
      throw new Error(errorData.message || 'Failed to submit annotation');
    }

    const annotationData = await annotationResponse.json();

    console.log('Detection feedback uploaded successfully:', {
      imageId: imageData.id,
      filename,
      originalDetections: feedbackData.originalDetections.length,
      userAnnotations: feedbackData.userAnnotations.length
    });

    return annotationData;

  } catch (error) {
    console.error('Error uploading detection feedback:', error);
    throw error;
  }
};

/**
 * Creates a simplified upload for detection feedback
 * This version uploads both original and corrected annotations for comparison
 * @param {Object} feedbackData - The feedback data
 * @param {string} apiKey - Roboflow API key
 * @param {string} projectId - Roboflow project ID
 * @returns {Promise} Response from the Roboflow API
 */
export const uploadSimpleDetectionFeedback = async (feedbackData, apiKey, projectId) => {
  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const filename = `detection_feedback_${timestamp}.jpg`;

    // Remove the data URL prefix to get just the base64 data
    const base64Image = feedbackData.imageData.split(',')[1];

    // For detection datasets, we use the upload endpoint with annotations
    const uploadUrl = new URL(`https://api.roboflow.com/dataset/${projectId}/upload`);
    uploadUrl.searchParams.append('api_key', apiKey);
    uploadUrl.searchParams.append('name', filename);
    uploadUrl.searchParams.append('split', 'train'); // Add to training set

    // Add tags for filtering
    uploadUrl.searchParams.append('tag', 'user_feedback');
    uploadUrl.searchParams.append('tag', 'detection_correction');
    uploadUrl.searchParams.append('tag', `corrections_${feedbackData.userAnnotations.length}`);

    // First upload the image
    const imageResponse = await fetch(uploadUrl.toString(), {
      method: 'POST',
      body: base64Image,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!imageResponse.ok) {
      const errorData = await imageResponse.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    const imageResult = await imageResponse.json();

    // If we have user annotations, upload them as well
    if (feedbackData.userAnnotations.length > 0) {
      const dataset = createDetectionFeedbackDataset(
        feedbackData.imageData,
        feedbackData.originalDetections,
        feedbackData.userAnnotations
      );

      // Upload annotations
      const annotationUrl = `https://api.roboflow.com/dataset/${projectId}/annotate/${imageResult.id}?api_key=${apiKey}&name=${filename.replace('.jpg', '.txt')}`;

      const annotationResponse = await fetch(annotationUrl, {
        method: 'POST',
        body: JSON.stringify({
          annotationFile: dataset.annotations,
          labelmap: dataset.labelmap
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!annotationResponse.ok) {
        console.warn('Failed to upload annotations, but image was uploaded successfully');
      }
    }

    console.log('Simple detection feedback uploaded:', {
      filename,
      originalDetections: feedbackData.originalDetections.length,
      userAnnotations: feedbackData.userAnnotations.length
    });

    return imageResult;

  } catch (error) {
    console.error('Error uploading simple detection feedback:', error);
    throw error;
  }
}; 