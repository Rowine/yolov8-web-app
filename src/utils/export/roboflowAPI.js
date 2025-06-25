/**
 * Utility functions for interacting with the Roboflow API
 */

/**
 * Generates a unique filename for the image upload
 * @param {Object} dataset The dataset containing detections and other info
 * @returns {String} A unique filename
 */
const generateFilename = (dataset) => {
  // Get current date and time
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');

  // Get the classes detected in the image
  const classes = Object.values(dataset.labelmap);
  const mainClass = classes[0] || 'unclassified';

  // Create a filename: timestamp_mainClass_count.jpg
  const filename = `rice_${mainClass.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.jpg`;

  return filename;
};

/**
 * Uploads a classification dataset to Roboflow
 * @param {Object} dataset The classification dataset object
 * @param {String} apiKey Your Roboflow API key
 * @param {String} projectId Your Roboflow project ID
 * @returns {Promise} Response from the Roboflow API
 */
export const uploadClassificationToRoboflow = async (dataset, apiKey, projectId) => {
  try {
    // Generate a unique filename
    const filename = generateFilename(dataset);

    // Get the class label from the labelmap
    const className = Object.values(dataset.labelmap)[0];

    if (!className) {
      throw new Error('No class label found in dataset');
    }

    // For classification projects, upload image with class label as a parameter
    const uploadUrl = new URL(`https://api.roboflow.com/dataset/${projectId}/upload`);
    uploadUrl.searchParams.append('api_key', apiKey);
    uploadUrl.searchParams.append('name', filename);
    uploadUrl.searchParams.append('split', 'train'); // Add to training set

    // Add the class label as a tag for classification
    uploadUrl.searchParams.append('tag', className);

    const response = await fetch(uploadUrl.toString(), {
      method: 'POST',
      body: dataset.image,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload classification dataset');
    }

    const result = await response.json();

    // Now set the class label using the annotation API
    if (result.id) {
      const annotationResponse = await fetch(
        `https://api.roboflow.com/dataset/${projectId}/annotate/${result.id}?api_key=${apiKey}`,
        {
          method: 'POST',
          body: className,
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      );

      if (!annotationResponse.ok) {
        console.warn('Failed to set class label, but image was uploaded successfully');
      }
    }

    console.log('Classification dataset uploaded successfully:', {
      filename,
      className,
      imageId: result.id
    });

    return result;

  } catch (error) {
    console.error('Error uploading classification dataset to Roboflow:', error);
    throw error;
  }
};

/**
 * Uploads an image and its annotations to Roboflow (for detection datasets)
 * @param {Object} dataset The dataset object containing image and annotations
 * @param {String} apiKey Your Roboflow API key
 * @param {String} projectId Your Roboflow project ID
 * @returns {Promise} Response from the Roboflow API
 */
export const uploadToRoboflow = async (dataset, apiKey, projectId) => {
  try {
    // Generate a unique filename
    const filename = generateFilename(dataset);

    // First, upload the image to get its ID
    const imageUploadResponse = await fetch(
      `https://api.roboflow.com/dataset/${projectId}/upload?api_key=${apiKey}&name=${filename}`,
      {
        method: 'POST',
        body: dataset.image,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const imageData = await imageUploadResponse.json();

    if (!imageData.id) {
      throw new Error('Failed to upload image');
    }

    // Create the payload with annotations and labelmap
    const annotationPayload = {
      annotationFile: dataset.annotations,
      labelmap: dataset.labelmap
    };

    // Then, upload the annotation for that image
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

    const annotationData = await annotationResponse.json();
    return annotationData;

  } catch (error) {
    console.error('Error uploading to Roboflow:', error);
    throw error;
  }
}; 