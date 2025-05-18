import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { renderBoxes } from "../utils/renderBox";
import labels from "../utils/labels.json";
import preventionTips from "../utils/prevention.json";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Check,
  Download,
  Upload,
  AlertCircle,
} from "lucide-react";
import { createRoboflowDataset } from "../utils/annotationExport";
import { uploadToRoboflow } from "../utils/roboflowAPI";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import useUserStore from "../store/userStore";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [expandedDetection, setExpandedDetection] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { imageData, detections } = location.state || {};
  const { user } = useUserStore();

  useEffect(() => {
    if (!imageData || !detections) {
      navigate("/");
      return;
    }

    const image = imageRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const drawDetections = () => {
      // Get the actual rendered dimensions of the image
      const rect = image.getBoundingClientRect();

      // Set canvas size to match the displayed image size
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Extract detection data
      const boxes_data = [];
      const scores_data = [];
      const classes_data = [];

      detections.forEach((det) => {
        // Scale bounding box to match the displayed image size
        const [y1, x1, y2, x2] = det.bbox;
        const scaledBox = [
          y1 * rect.height,
          x1 * rect.width,
          y2 * rect.height,
          x2 * rect.width,
        ];
        boxes_data.push(...scaledBox);
        scores_data.push(det.confidence);
        const classIndex = labels.indexOf(det.class);
        classes_data.push(classIndex);
      });

      // Draw boxes
      renderBoxes(canvas, boxes_data, scores_data, classes_data, [1, 1]);
    };

    // Draw boxes when image loads
    image.onload = drawDetections;

    // Also draw boxes immediately if image is already loaded
    if (image.complete) {
      drawDetections();
    }

    // Save detections to Firestore
    const saveDetections = async () => {
      try {
        for (const detection of detections) {
          await addDoc(collection(db, "detections"), {
            userId: user.uid,
            detectedClass: detection.class,
            confidence: detection.confidence,
            timestamp: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Error saving detections:", error);
      }
    };

    saveDetections();

    // Redraw on window resize
    window.addEventListener("resize", drawDetections);
    return () => window.removeEventListener("resize", drawDetections);
  }, [imageData, detections, navigate, user]);

  // Function to handle saving annotations to Roboflow
  const handleSaveAnnotations = async () => {
    if (!imageData || !detections) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Create the dataset object
      const dataset = createRoboflowDataset(imageData, detections);

      // Get credentials from environment variables
      const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
      const projectId = import.meta.env.VITE_ROBOFLOW_PROJECT_ID;

      if (!apiKey || !projectId) {
        throw new Error("Roboflow API key or Project ID not configured");
      }

      // Upload to Roboflow
      await uploadToRoboflow(dataset, apiKey, projectId);
      setUploadSuccess(true);
    } catch (error) {
      console.error("Failed to upload to Roboflow:", error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Sidebar />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-800">
              Detection Results
            </h2>
            <div className="flex gap-3">
              <button
                onClick={handleSaveAnnotations}
                className={`flex items-center px-5 py-2.5 text-white rounded-lg transition-colors ${
                  isUploading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={!detections || detections.length === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload to Roboflow
                  </>
                )}
              </button>
              <Link
                to="/"
                className="flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Camera
              </Link>
            </div>
          </div>

          {/* Upload Status Messages */}
          {uploadSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
              <Check className="h-5 w-5 mr-2" />
              Successfully uploaded to Roboflow!
            </div>
          )}
          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              {uploadError}
            </div>
          )}

          {/* Main content - Image and Detections side by side */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image container - Takes 2/3 of the space on large screens */}
            <div className="lg:w-2/3">
              <div
                ref={containerRef}
                className="relative w-full border-2 border-dashed border-green-200 rounded-lg overflow-hidden"
                style={{ height: "480px" }}
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
            </div>

            {/* Detections container - Takes 1/3 of the space on large screens */}
            <div className="lg:w-1/3">
              <div className="bg-green-50 rounded-lg p-4 h-full border border-green-100">
                <h3 className="text-lg font-semibold mb-3 text-green-800">
                  Detected Diseases:
                </h3>
                <div className="space-y-3 max-h-[432px] overflow-y-auto pr-1">
                  {!detections || detections.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center border border-green-100">
                      <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="text-lg font-medium text-green-800 mb-2">
                        No Diseases Detected
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Your rice plant appears to be healthy. Continue with
                        regular maintenance and monitoring.
                      </p>
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
                                  : detection.confidence > 0.7
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
