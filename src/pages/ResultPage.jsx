import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { renderBoxes } from "../utils/renderBox";
import labels from "../utils/labels.json";
import preventionTips from "../utils/prevention.json";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, Check } from "lucide-react";

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
      <Sidebar />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-800">
              Detection Results
            </h2>
            <Link
              to="/"
              className="flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Camera
            </Link>
          </div>

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
                      <div className="mt-4 p-2 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2">
                          Maintenance Tips:
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start">
                            <span className="inline-block w-4 h-4 rounded-full bg-green-200 text-green-800 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">
                              1
                            </span>
                            <span>
                              Regular monitoring for early signs of disease
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-4 h-4 rounded-full bg-green-200 text-green-800 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">
                              2
                            </span>
                            <span>Maintain proper water management</span>
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-4 h-4 rounded-full bg-green-200 text-green-800 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">
                              3
                            </span>
                            <span>Keep the field clean and weed-free</span>
                          </li>
                        </ul>
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

        {/* Additional information section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4">
            What to do next?
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-green-100 rounded-lg p-4 bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">
                Treatment Options
              </h4>
              <p className="text-gray-700 text-sm">
                Based on the detected diseases, consider consulting with your
                local agricultural extension office for specific treatment
                recommendations tailored to your region.
              </p>
            </div>
            <div className="border border-green-100 rounded-lg p-4 bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">
                Save Your Results
              </h4>
              <p className="text-gray-700 text-sm">
                You can save these results for future reference or share them
                with agricultural experts.
              </p>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                  Save Results
                </button>
                <button className="px-3 py-2 bg-white border border-green-600 text-green-600 hover:bg-green-50 rounded-lg text-sm transition-colors">
                  Share Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
