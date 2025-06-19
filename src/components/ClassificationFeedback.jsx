import { useState } from "react";
import { AlertTriangle, Check, X, Upload, Loader } from "lucide-react";

/**
 * Component for collecting user feedback on classification results
 * @param {Object} props
 * @param {Object} props.classification - Classification result from the model
 * @param {string} props.imageData - Base64 image data
 * @param {Function} props.onFeedbackSubmit - Callback when feedback is submitted
 * @param {boolean} props.isVisible - Whether the feedback component is visible
 * @param {Function} props.onClose - Callback to close the feedback component
 */
const ClassificationFeedback = ({
  classification,
  imageData,
  onFeedbackSubmit,
  isVisible,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCorrection, setSelectedCorrection] = useState(null);

  if (!isVisible) return null;

  const handleFeedbackSubmit = async () => {
    if (!selectedCorrection) {
      setError("Please select the correct classification");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onFeedbackSubmit({
        originalPrediction: classification.prediction,
        correctLabel: selectedCorrection,
        confidence: classification.confidence,
        imageData,
      });

      setFeedbackSubmitted(true);
      setTimeout(() => {
        onClose();
        setFeedbackSubmitted(false);
        setSelectedCorrection(null);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCorrection(null);
    setError(null);
    setFeedbackSubmitted(false);
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
              Feedback Submitted!
            </h3>
            <p className="text-sm text-gray-500">
              Thank you for helping improve our model. Your feedback has been
              sent to Roboflow.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Classification Feedback
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
          <p className="text-sm text-gray-600 mb-3">
            Our model predicted:{" "}
            <span className="font-medium">{classification.prediction}</span>{" "}
            with {(classification.confidence * 100).toFixed(1)}% confidence.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            If this is incorrect, please select the correct classification
            below:
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="correction"
              value="rice_leaf"
              checked={selectedCorrection === "rice_leaf"}
              onChange={(e) => setSelectedCorrection(e.target.value)}
              className="mr-3"
            />
            <span className="text-sm">This is a rice leaf</span>
          </label>

          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="correction"
              value="not_rice_leaf"
              checked={selectedCorrection === "not_rice_leaf"}
              onChange={(e) => setSelectedCorrection(e.target.value)}
              className="mr-3"
            />
            <span className="text-sm">This is not a rice leaf</span>
          </label>
        </div>

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
            disabled={!selectedCorrection || isSubmitting}
            className={`flex-1 px-4 py-2 text-white rounded-lg flex items-center justify-center ${
              !selectedCorrection || isSubmitting
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
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassificationFeedback;
