import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Check,
  AlertCircle,
  WifiOff,
  Flag,
} from "lucide-react";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import useUserStore from "../store/userStore";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useCanvas } from "../hooks/useCanvas";
import { useRoboflow } from "../hooks/useRoboflow";
import { useClassificationFeedback } from "../hooks/useClassificationFeedback";
import { useDetectionFeedback } from "../hooks/useDetectionFeedback";
import preventionTips from "../utils/data/prevention.json";
import { Sidebar } from "../components/Sidebar";
import { DetectionNotifier } from "../components/DetectionNotifier";
import { RoboflowUploadStatus } from "../components/RoboflowUploadStatus";
import ClassificationFeedback from "../components/ClassificationFeedback";
import AnnotationFeedback from "../components/AnnotationFeedback";
import { saveOfflineDetection } from "../store/offlineStore";
import { MODEL_CONFIG } from "../config/constants";

const OfflineMessage = ({ message }) => (
  <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center text-gray-800 text-sm">
    <WifiOff className="h-4 w-4 mr-2 text-gray-600" />
    {message}
  </div>
);

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [expandedDetection, setExpandedDetection] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const { user } = useUserStore();
  const { imageData, detections: detectionResult } = location.state || {};
  const isOnline = useOnlineStatus();
  const [savingError, setSavingError] = useState(null);

  // Extract detections from the new structure
  const detections = detectionResult?.detections || [];
  const isRiceLeaf = detectionResult?.isRiceLeaf;
  const classification = detectionResult?.classification;
  const message = detectionResult?.message;

  // Initialize custom hooks
  const { drawDetections } = useCanvas({
    canvasRef,
    imageRef,
    detections,
  });

  const {
    autoUploadToProjects,
    isUploading,
    error: uploadError,
    isSuccess: uploadSuccess,
  } = useRoboflow();

  const {
    submitFeedback,
    isSubmitting: isFeedbackSubmitting,
    error: feedbackError,
    isSuccess: feedbackSuccess,
  } = useClassificationFeedback();

  const {
    submitFeedback: submitDetectionFeedback,
    isSubmitting: isDetectionFeedbackSubmitting,
    error: detectionFeedbackError,
    isSuccess: detectionFeedbackSuccess,
  } = useDetectionFeedback();

  useEffect(() => {
    if (!imageData || !detectionResult) {
      navigate("/");
      return;
    }

    const image = imageRef.current;

    // Draw boxes when image loads
    image.onload = drawDetections;

    // Also draw boxes immediately if image is already loaded
    if (image.complete) {
      drawDetections();
    }

    // Save detections and automatically upload to Roboflow projects
    const saveDetectionsAndUpload = async () => {
      try {
        // Create a comprehensive detection record
        const detectionData = {
          userId: user.uid,
          timestamp: new Date().toISOString(),
          isRiceLeaf: isRiceLeaf,
          classification: classification,
          hasDetections: detections && detections.length > 0,
          detectionCount: detections ? detections.length : 0,
          detections: detections || [],
          // Add metadata for analytics
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
        };

        // Save to Firestore/IndexedDB
        if (isOnline) {
          await addDoc(collection(db, "detections"), {
            ...detectionData,
            timestamp: serverTimestamp(),
          });
        } else {
          await saveOfflineDetection(detectionData);
          setSavingError(
            "Detection results saved offline. They will sync when you're back online."
          );
        }

        // Automatically upload to Roboflow projects (works both online and offline)
        try {
          await autoUploadToProjects(
            imageData,
            detections,
            isRiceLeaf,
            classification
          );
          console.log("Roboflow upload process completed");
        } catch (uploadError) {
          console.error("Failed to process Roboflow uploads:", uploadError);
          // Error handling is now managed by the upload hook and status component
        }

        setSavingError(null);
      } catch (error) {
        console.error("Error saving detections:", error);
        setSavingError(
          "Failed to save detection results. Please try again later."
        );
      }
    };

    saveDetectionsAndUpload();
  }, [
    imageData,
    detections,
    navigate,
    user,
    drawDetections,
    isOnline,
    autoUploadToProjects,
    isRiceLeaf,
    classification,
  ]);

  const handleFeedbackSubmit = async (feedbackData) => {
    const success = await submitFeedback(feedbackData);
    if (success) {
      setShowFeedbackModal(false);
    }
    return success;
  };

  const handleDetectionFeedbackSubmit = async (feedbackData) => {
    const success = await submitDetectionFeedback(feedbackData);
    if (success) {
      setShowAnnotationModal(false);
    }
    return success;
  };

  return (
    <div className="h-screen bg-gray-100 p-2">
      <Sidebar />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-3">
          {/* Header */}
          <div className="mb-2">
            <h2 className="text-lg font-bold text-green-800">
              Detection Results
            </h2>
          </div>

          {/* Status Messages */}
          {!isOnline && (
            <OfflineMessage message="You're currently offline. Some features may be limited." />
          )}
          {savingError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              {savingError}
            </div>
          )}
          {feedbackSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
              <Check className="h-5 w-5 mr-2" />
              Classification feedback submitted successfully! Thank you for
              helping improve our model.
            </div>
          )}
          {feedbackError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              {feedbackError}
            </div>
          )}
          {detectionFeedbackSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
              <Check className="h-5 w-5 mr-2" />
              Detection annotations submitted successfully! Thank you for
              helping improve our model.
            </div>
          )}
          {detectionFeedbackError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              {detectionFeedbackError}
            </div>
          )}

          {/* Main content */}
          <div className="flex flex-col lg:flex-row gap-2">
            {/* Image container */}
            <div className="lg:w-2/3 flex flex-col gap-2">
              <div
                ref={containerRef}
                className="relative w-full border border-dashed border-green-200 rounded-lg overflow-hidden"
                style={{ height: "360px" }}
              >
                <img
                  ref={imageRef}
                  src={imageData}
                  alt="Captured Rice Plant"
                  className="absolute top-0 left-0 w-full h-full object-contain bg-white rounded-lg"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
              </div>
              <div className="flex justify-center gap-2">
                {isRiceLeaf && (
                  <button
                    onClick={() => setShowAnnotationModal(true)}
                    className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
                    disabled={!isOnline}
                    title={
                      !isOnline
                        ? "This feature requires internet connection"
                        : "Correct detection results by annotating missed or incorrect detections"
                    }
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Correct Detections
                  </button>
                )}
              </div>
            </div>

            {/* Detections container */}
            <div className="lg:w-1/3">
              <div className="bg-green-50 rounded-lg p-2 h-full border border-green-100 flex flex-col">
                <h3 className="text-base font-semibold mb-2 text-green-800">
                  {isRiceLeaf === false
                    ? "Analysis Result:"
                    : "Detected Issues:"}
                </h3>
                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                  {isRiceLeaf === false ? (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center border border-yellow-100">
                      <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h4 className="text-lg font-medium text-yellow-800 mb-2">
                        {classification?.prediction
                          ? classification.prediction
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())
                          : "Not a Rice Leaf"}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {message ||
                          "This image does not appear to contain a rice leaf. Please capture an image of a rice leaf for disease and pest detection."}
                      </p>
                      <div className="mt-4 text-xs text-gray-500">
                        <p>
                          Classification confidence:{" "}
                          {classification
                            ? (classification.confidence * 100).toFixed(1)
                            : "N/A"}
                          %
                        </p>
                      </div>
                      {isOnline && classification && (
                        <div className="mt-4">
                          <button
                            onClick={() => setShowFeedbackModal(true)}
                            className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Report incorrect classification"
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Report Incorrect Classification
                          </button>
                        </div>
                      )}
                    </div>
                  ) : !detections || detections.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center border border-green-100">
                      <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="text-lg font-medium text-green-800 mb-2">
                        No Issues Detected
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Your rice plant appears to be healthy with no diseases
                        or pests detected. Continue with regular maintenance and
                        monitoring.
                      </p>
                      <div className="mt-4 text-xs text-gray-500">
                        <p>
                          Classification confidence:{" "}
                          {classification
                            ? (classification.confidence * 100).toFixed(1)
                            : "N/A"}
                          %
                        </p>
                      </div>
                    </div>
                  ) : (
                    detections.map((detection, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm overflow-hidden border border-green-100"
                      >
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-green-50"
                          onClick={() =>
                            setExpandedDetection(
                              expandedDetection === index ? null : index
                            )
                          }
                        >
                          <span className="font-medium text-gray-800">
                            {detection.class}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                detection.confidence > 0.9
                                  ? "bg-red-100 text-red-800"
                                  : detection.confidence >
                                    MODEL_CONFIG.confidenceThreshold
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {(detection.confidence * 100).toFixed(1)}%
                            </span>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-500 transition-transform ${
                                expandedDetection === index
                                  ? "transform rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                        </div>
                        {expandedDetection === index && (
                          <div className="p-4 bg-green-50 border-t border-green-100">
                            <h4 className="font-medium text-green-800 mb-2">
                              Prevention Tips:
                            </h4>
                            <ul className="space-y-2">
                              {preventionTips[detection.class]?.map(
                                (tip, tipIndex) => (
                                  <li
                                    key={tipIndex}
                                    className="flex items-start text-sm text-gray-700"
                                  >
                                    <span className="inline-block w-4 h-4 rounded-full bg-green-200 text-green-800 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">
                                      {tipIndex + 1}
                                    </span>
                                    <span>{tip}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <Link
                  to="/"
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm mt-2 justify-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Camera
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roboflow Upload Status */}
      <RoboflowUploadStatus
        isUploading={isUploading}
        isSuccess={uploadSuccess}
        error={uploadError}
      />

      {/* Only show DetectionNotifier if there are detections and user has farmLocation */}
      {detections && detections.length > 0 && user?.farmLocation && (
        <DetectionNotifier
          detectedIssues={detections.map((d) => ({ name: d.class }))}
          currentLocation={user.farmLocation}
        />
      )}

      {/* Classification Feedback Modal */}
      {classification && (
        <ClassificationFeedback
          classification={classification}
          imageData={imageData}
          onFeedbackSubmit={handleFeedbackSubmit}
          isVisible={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      {/* Detection Annotation Feedback Modal */}
      {isRiceLeaf && (
        <AnnotationFeedback
          detections={detections}
          imageData={imageData}
          onFeedbackSubmit={handleDetectionFeedbackSubmit}
          isVisible={showAnnotationModal}
          onClose={() => setShowAnnotationModal(false)}
        />
      )}
    </div>
  );
};

export default ResultPage;
