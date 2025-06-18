import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  Check,
  X,
  Upload,
  Loader,
  Edit3,
  Square,
} from "lucide-react";
import labels from "../utils/data/labels.json";

/**
 * Component for collecting user feedback on detection results with annotation capabilities
 * @param {Object} props
 * @param {Array} props.detections - Original detection results
 * @param {string} props.imageData - Base64 image data
 * @param {Function} props.onFeedbackSubmit - Callback when feedback is submitted
 * @param {boolean} props.isVisible - Whether the feedback component is visible
 * @param {Function} props.onClose - Callback to close the feedback component
 */
const AnnotationFeedback = ({
  detections,
  imageData,
  onFeedbackSubmit,
  isVisible,
  onClose,
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState(null);
  const [userAnnotations, setUserAnnotations] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(labels[0] || "");
  const [startPoint, setStartPoint] = useState(null);
  const [mode, setMode] = useState("view"); // 'view' or 'annotate'

  useEffect(() => {
    if (isVisible && imageRef.current) {
      drawCanvas();
    }
  }, [isVisible, userAnnotations, detections]);

  if (!isVisible) return null;

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (event) => {
    if (mode !== "annotate") return;

    const coords = getCanvasCoordinates(event);
    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentBox({
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0,
    });
  };

  const handleMouseMove = (event) => {
    if (!isDrawing || mode !== "annotate") return;

    const coords = getCanvasCoordinates(event);
    setCurrentBox({
      x: Math.min(startPoint.x, coords.x),
      y: Math.min(startPoint.y, coords.y),
      width: Math.abs(coords.x - startPoint.x),
      height: Math.abs(coords.y - startPoint.y),
    });

    drawCanvas();
  };

  const handleMouseUp = () => {
    if (!isDrawing || mode !== "annotate") return;

    if (currentBox && currentBox.width > 10 && currentBox.height > 10) {
      // Convert canvas coordinates to normalized coordinates
      const canvas = canvasRef.current;
      const normalizedBox = {
        class: selectedLabel,
        confidence: 1.0, // User annotation
        bbox: [
          currentBox.y / canvas.height, // y1
          currentBox.x / canvas.width, // x1
          (currentBox.y + currentBox.height) / canvas.height, // y2
          (currentBox.x + currentBox.width) / canvas.width, // x2
        ],
        isUserAnnotation: true,
      };

      setUserAnnotations((prev) => [...prev, normalizedBox]);
    }

    setIsDrawing(false);
    setCurrentBox(null);
    setStartPoint(null);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");

    // Set canvas size to match image
    canvas.width = image.width;
    canvas.height = image.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw original detections (in semi-transparent red)
    detections.forEach((detection) => {
      const [y1, x1, y2, x2] = detection.bbox;
      const x = x1 * canvas.width;
      const y = y1 * canvas.height;
      const width = (x2 - x1) * canvas.width;
      const height = (y2 - y1) * canvas.height;

      // Draw original detection box
      ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);

      // Draw original label
      ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
      ctx.font = "12px Arial";
      const labelText = `${detection.class} (${(
        detection.confidence * 100
      ).toFixed(0)}%)`;
      ctx.fillText(labelText, x, y - 5);
    });

    // Draw user annotations (in solid green)
    userAnnotations.forEach((annotation) => {
      const [y1, x1, y2, x2] = annotation.bbox;
      const x = x1 * canvas.width;
      const y = y1 * canvas.height;
      const width = (x2 - x1) * canvas.width;
      const height = (y2 - y1) * canvas.height;

      // Draw user annotation box
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, width, height);

      // Draw user label
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 12px Arial";
      ctx.fillText(`${annotation.class} (corrected)`, x, y - 5);
    });

    // Draw current drawing box
    if (currentBox && isDrawing) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(
        currentBox.x,
        currentBox.y,
        currentBox.width,
        currentBox.height
      );

      // Draw current label
      ctx.fillStyle = "#3b82f6";
      ctx.font = "12px Arial";
      ctx.fillText(selectedLabel, currentBox.x, currentBox.y - 5);
    }
  };

  const removeAnnotation = (index) => {
    setUserAnnotations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFeedbackSubmit = async () => {
    if (userAnnotations.length === 0) {
      setError("Please add at least one correction annotation");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onFeedbackSubmit({
        originalDetections: detections,
        userAnnotations: userAnnotations,
        imageData,
      });

      setFeedbackSubmitted(true);
      setTimeout(() => {
        onClose();
        setFeedbackSubmitted(false);
        setUserAnnotations([]);
        setMode("view");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUserAnnotations([]);
    setError(null);
    setFeedbackSubmitted(false);
    setMode("view");
    setIsDrawing(false);
    setCurrentBox(null);
    onClose();
  };

  if (feedbackSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Annotations Submitted!
            </h3>
            <p className="text-sm text-gray-500">
              Thank you for providing detailed feedback. Your annotations have
              been sent to Roboflow.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Edit3 className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Detection Annotation Feedback
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Help improve our detection model by correcting missed or incorrect
            detections.
            <span className="text-red-600"> Red dashed boxes</span> show
            original detections,
            <span className="text-green-600"> green solid boxes</span> show your
            corrections.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode("view")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                mode === "view"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              View Mode
            </button>
            <button
              onClick={() => setMode("annotate")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                mode === "annotate"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Square className="h-4 w-4 mr-1 inline" />
              Annotate Mode
            </button>
          </div>

          {mode === "annotate" && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Label:
              </label>
              <select
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                {labels.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Image and Canvas */}
        <div className="mb-4">
          <div
            ref={containerRef}
            className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
            style={{ maxHeight: "400px" }}
          >
            <img
              ref={imageRef}
              src={imageData}
              alt="Detection feedback"
              className="max-w-full max-h-full object-contain"
              onLoad={drawCanvas}
            />
            <canvas
              ref={canvasRef}
              className={`absolute top-0 left-0 ${
                mode === "annotate" ? "cursor-crosshair" : "pointer-events-none"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{
                width: imageRef.current?.width || "auto",
                height: imageRef.current?.height || "auto",
              }}
            />
          </div>
          {mode === "annotate" && (
            <p className="text-xs text-gray-500 mt-1">
              Click and drag to draw bounding boxes around diseases/pests that
              were missed or incorrectly detected.
            </p>
          )}
        </div>

        {/* User Annotations List */}
        {userAnnotations.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Your Corrections:
            </h4>
            <div className="space-y-2">
              {userAnnotations.map((annotation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
                >
                  <span className="text-sm text-green-800">
                    {annotation.class} (corrected annotation)
                  </span>
                  <button
                    onClick={() => removeAnnotation(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleFeedbackSubmit}
            disabled={userAnnotations.length === 0 || isSubmitting}
            className={`flex-1 px-4 py-2 text-white rounded-lg flex items-center justify-center ${
              userAnnotations.length === 0 || isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Annotations ({userAnnotations.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnotationFeedback;
