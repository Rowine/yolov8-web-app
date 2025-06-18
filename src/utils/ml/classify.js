import * as tf from "@tensorflow/tfjs";

let classificationModel = null;

/**
 * Load the rice leaf classification model
 * @returns {Promise<tf.GraphModel>} The loaded classification model
 */
export const loadClassificationModel = async () => {
  if (classificationModel) {
    return classificationModel;
  }

  try {
    console.log('Loading rice leaf classification model...');
    classificationModel = await tf.loadGraphModel('/classify/model.json');
    console.log('Classification model loaded successfully');
    return classificationModel;
  } catch (error) {
    console.error('Error loading classification model:', error);
    throw error;
  }
};

/**
 * Preprocess image for classification
 * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} source
 * @param {number} modelSize - Expected input size (640x640 for YOLOv8)
 * @returns {tf.Tensor} Preprocessed tensor
 */
const preprocessForClassification = (source, modelSize = 640) => {
  return tf.tidy(() => {
    // Convert source to tensor
    const img = tf.browser.fromPixels(source);

    // Resize to model input size while maintaining aspect ratio
    const resized = tf.image.resizeBilinear(img, [modelSize, modelSize]);

    // Normalize to [0, 1] range
    const normalized = resized.div(255.0);

    // Add batch dimension
    return normalized.expandDims(0);
  });
};

/**
 * Classify if the image contains a rice leaf
 * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} source
 * @returns {Promise<{isRiceLeaf: boolean, confidence: number, prediction: string}>}
 */
export const classifyRiceLeaf = async (source) => {
  if (!classificationModel) {
    await loadClassificationModel();
  }

  tf.engine().startScope();

  try {
    // Preprocess the image
    const input = preprocessForClassification(source);

    // Run inference
    const predictions = classificationModel.predict(input);

    // Get probabilities
    const probabilities = await predictions.data();

    // The model has 2 classes: [not_rice_leaf, rice_leaf]
    const notRiceLeafProb = probabilities[0];
    const riceLeafProb = probabilities[1];

    // Determine the prediction
    const isRiceLeaf = riceLeafProb > notRiceLeafProb;
    const confidence = Math.max(notRiceLeafProb, riceLeafProb);
    const prediction = isRiceLeaf ? 'rice_leaf' : 'not_rice_leaf';

    // Clean up tensors
    tf.dispose([input, predictions]);

    console.log(`Classification result: ${prediction} (confidence: ${confidence.toFixed(3)})`);

    return {
      isRiceLeaf,
      confidence,
      prediction,
      probabilities: {
        not_rice_leaf: notRiceLeafProb,
        rice_leaf: riceLeafProb
      }
    };
  } catch (error) {
    console.error('Error during classification:', error);
    throw error;
  } finally {
    tf.engine().endScope();
  }
};

/**
 * Check if classification model is loaded
 * @returns {boolean}
 */
export const isClassificationModelLoaded = () => {
  return classificationModel !== null;
}; 