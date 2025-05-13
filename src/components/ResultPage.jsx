import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { renderBoxes } from "../utils/renderBox";
import labels from "../utils/labels.json";
import preventionTips from "../utils/prevention.json";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [expandedDetection, setExpandedDetection] = useState(null);
  const { imageData, detections } = location.state || {};

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

    // Redraw on window resize
    window.addEventListener("resize", drawDetections);
    return () => window.removeEventListener("resize", drawDetections);
  }, [imageData, detections, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Detection Results
            </h2>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Back to Camera
            </button>
          </div>

          {/* Main content - Image and Detections side by side */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image container - Takes 2/3 of the space on large screens */}
            <div className="lg:w-2/3">
              <div
                ref={containerRef}
                className="relative w-full"
                style={{ height: "480px" }}
              >
                <img
                  ref={imageRef}
                  src={imageData}
                  alt="Captured"
                  className="absolute top-0 left-0 w-full h-full object-contain bg-gray-50 rounded-lg"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
              </div>
            </div>

            {/* Detections container - Takes 1/3 of the space on large screens */}
            <div className="lg:w-1/3">
              <div className="bg-gray-50 rounded-lg p-4 h-full">
                <h3 className="text-lg font-semibold mb-3">
                  Detected Objects:
                </h3>
                <div className="space-y-2 max-h-[432px] overflow-y-auto">
                  {detections?.map((detection, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow overflow-hidden"
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          setExpandedDetection(
                            expandedDetection === index ? null : index
                          )
                        }
                      >
                        <span className="font-medium">{detection.class}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">
                            {(detection.confidence * 100).toFixed(1)}%
                          </span>
                          <svg
                            className={`w-5 h-5 transition-transform ${
                              expandedDetection === index
                                ? "transform rotate-180"
                                : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {expandedDetection === index && (
                        <div className="p-4 bg-gray-50 border-t">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">
                            Prevention Tips:
                          </h4>
                          <ul className="list-disc list-inside space-y-1">
                            {preventionTips[detection.class]?.map(
                              (tip, tipIndex) => (
                                <li
                                  key={tipIndex}
                                  className="text-sm text-gray-600 ml-2"
                                >
                                  {tip}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
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
