/**
 * Converts detection results to YOLO format
 * YOLO format: <class_id> <x_center> <y_center> <width> <height>
 * All bbox coordinates are normalized (0-1)
 * @param {Array} detections Array of detection objects
 * @param {Object} labelMap Object mapping class names to class IDs
 * @returns {Object} YOLO format annotations and labelmap
 */
export const detectionsToYOLO = (detections) => {
  // Create a map of class names to indices
  const labelMap = {};
  const labels = detections.map(det => det.class);
  const uniqueLabels = [...new Set(labels)];
  uniqueLabels.forEach((label, index) => {
    labelMap[index] = label; // Changed to map index -> label for Roboflow format
  });

  // Convert each detection to YOLO format
  const annotations = detections.map(detection => {
    const [y1, x1, y2, x2] = detection.bbox;

    // Calculate center points and dimensions
    const x_center = (x1 + x2) / 2;
    const y_center = (y1 + y2) / 2;
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    // Get class ID from label map
    const class_id = Object.entries(labelMap).find(([_, label]) => label === detection.class)[0];

    // Return YOLO format string
    return `${class_id} ${x_center.toFixed(6)} ${y_center.toFixed(6)} ${width.toFixed(6)} ${height.toFixed(6)}`;
  }).join('\n');

  return { annotations, labelMap };
};

/**
 * Creates a Roboflow compatible dataset structure
 * @param {String} imageData Base64 image data
 * @param {Array} detections Array of detection objects
 * @returns {Object} Dataset object ready for Roboflow API
 */
export const createRoboflowDataset = (imageData, detections) => {
  // Remove the data URL prefix to get just the base64 data
  const base64Image = imageData.split(',')[1];

  // Convert detections to YOLO format and get labelmap
  const { annotations, labelMap } = detectionsToYOLO(detections);

  return {
    image: base64Image,
    annotations: annotations,
    labelmap: labelMap,
    format: 'yolov8'  // Specify the format for Roboflow
  };
}; 