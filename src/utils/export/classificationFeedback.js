/**
 * Utility functions for submitting classification feedback to Roboflow
 */

/**
 * Uploads classification feedback to Roboflow
 * @param {Object} feedbackData - The feedback data
 * @param {string} feedbackData.originalPrediction - Original model prediction
 * @param {string} feedbackData.correctLabel - User-corrected label
 * @param {number} feedbackData.confidence - Model confidence
 * @param {string} feedbackData.imageData - Base64 image data
 * @param {string} apiKey - Roboflow API key for classification project
 * @param {string} projectId - Roboflow project ID for classification project
 * @returns {Promise} Response from the Roboflow API
 */
export const uploadClassificationFeedback = async (feedbackData, apiKey, projectId) => {
  try {
    // Generate a unique filename for the feedback
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const filename = `feedback_${feedbackData.correctLabel}_${timestamp}.jpg`;

    // Remove the data URL prefix to get just the base64 data
    const base64Image = feedbackData.imageData.split(',')[1];

    // Upload the image to Roboflow classification project
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

    // For classification projects, we can add tags to help organize the data
    const tags = [
      `original_prediction_${feedbackData.originalPrediction}`,
      `confidence_${Math.round(feedbackData.confidence * 100)}`,
      'user_feedback',
      'correction_needed'
    ];

    // Add annotation/label to the uploaded image
    const annotationPayload = {
      class: feedbackData.correctLabel,
      tags: tags,
      metadata: {
        feedback_type: 'classification_correction',
        original_prediction: feedbackData.originalPrediction,
        correct_label: feedbackData.correctLabel,
        model_confidence: feedbackData.confidence,
        submission_time: now.toISOString()
      }
    };

    // Submit the annotation
    const annotationResponse = await fetch(
      `https://api.roboflow.com/dataset/${projectId}/annotate/${imageData.id}?api_key=${apiKey}`,
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

    console.log('Classification feedback uploaded successfully:', {
      imageId: imageData.id,
      filename,
      correctLabel: feedbackData.correctLabel,
      originalPrediction: feedbackData.originalPrediction
    });

    return annotationData;

  } catch (error) {
    console.error('Error uploading classification feedback:', error);
    throw error;
  }
};

/**
 * Creates a simplified upload for classification feedback
 * This is a simpler version that just uploads the image with the correct class label
 * @param {Object} feedbackData - The feedback data
 * @param {string} apiKey - Roboflow API key
 * @param {string} projectId - Roboflow project ID
 * @returns {Promise} Response from the Roboflow API
 */
export const uploadSimpleClassificationFeedback = async (feedbackData, apiKey, projectId) => {
  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const filename = `${feedbackData.correctLabel}_feedback_${timestamp}.jpg`;

    // Remove the data URL prefix to get just the base64 data
    const base64Image = feedbackData.imageData.split(',')[1];

    // For classification datasets, we can use the upload endpoint with the split parameter
    // to specify which split (train/valid/test) this should go to
    const uploadUrl = new URL(`https://api.roboflow.com/dataset/${projectId}/upload`);
    uploadUrl.searchParams.append('api_key', apiKey);
    uploadUrl.searchParams.append('name', filename);
    uploadUrl.searchParams.append('split', 'train'); // Add to training set

    // Add the correct class as a tag
    uploadUrl.searchParams.append('tag', feedbackData.correctLabel);
    uploadUrl.searchParams.append('tag', 'user_feedback');

    const response = await fetch(uploadUrl.toString(), {
      method: 'POST',
      body: base64Image,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload feedback');
    }

    const result = await response.json();

    console.log('Simple classification feedback uploaded:', {
      filename,
      correctLabel: feedbackData.correctLabel,
      originalPrediction: feedbackData.originalPrediction
    });

    return result;

  } catch (error) {
    console.error('Error uploading simple classification feedback:', error);
    throw error;
  }
}; 