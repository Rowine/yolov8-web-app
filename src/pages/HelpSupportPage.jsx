import React, { useState } from "react";
import {
  Mail,
  MessageCircle,
  AlertTriangle,
  Camera,
  Wifi,
  Smartphone,
  HelpCircle,
  Book,
  Bug,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Info,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";

const HelpSupportPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [expandedTrouble, setExpandedTrouble] = useState(null);

  const faqs = [
    {
      question: "How accurate is the rice disease detection?",
      answer:
        "Our AI model has been trained on thousands of rice leaf images and achieves high accuracy rates. However, results may vary depending on image quality, lighting conditions, and the specific disease or pest present. Always consult with agricultural experts for critical decisions.",
    },
    {
      question: "What types of rice diseases and pests can be detected?",
      answer:
        "The system can detect common rice diseases including blast, bacterial blight, brown spot, and various pest infestations. The model is continuously being improved with new data to detect additional conditions.",
    },
    {
      question: "Do I need an internet connection to use the app?",
      answer:
        "The app works offline for basic detection functionality. However, features like uploading feedback, syncing detection history, and receiving notifications require an internet connection. Your offline detections will sync when you're back online.",
    },
    {
      question: "How should I take photos for best results?",
      answer:
        "For optimal detection: 1) Ensure good lighting (natural daylight preferred), 2) Keep the camera steady, 3) Fill the frame with the rice leaf, 4) Avoid shadows and reflections, 5) Capture clear, focused images without blur.",
    },
    {
      question: "Can I use this app for other crops besides rice?",
      answer:
        "Currently, the app is specifically designed and trained for rice plants only. Using it on other crops may produce inaccurate results. We're working on expanding to other crops in future updates.",
    },
    {
      question: "What happens to my detection data?",
      answer:
        "Your detection data is securely stored and used to improve our models. Personal information is kept private according to our privacy policy. You can contribute to model improvement by providing feedback on detection results.",
    },
  ];

  const troubleshootingItems = [
    {
      issue: "Camera not working or showing black screen",
      solutions: [
        "Check if camera permissions are granted in your browser settings",
        "Try refreshing the page or restarting your browser",
        "Ensure no other applications are using the camera",
        "Check if your device has a working camera",
        "Try using a different browser (Chrome or Safari recommended)",
      ],
    },
    {
      issue: "Detection results seem inaccurate",
      solutions: [
        "Ensure you're photographing actual rice leaves, not other plants",
        "Check image quality - avoid blurry, dark, or overexposed photos",
        "Take photos in good lighting conditions (natural daylight preferred)",
        "Make sure the leaf fills most of the frame",
        "Clean your camera lens if images appear cloudy",
        "Report incorrect results to help improve the model",
      ],
    },
    {
      issue: "App is slow or not responding",
      solutions: [
        "Check your internet connection",
        "Close other browser tabs to free up memory",
        "Clear your browser cache and cookies",
        "Try using the app in an incognito/private browsing window",
        "Restart your browser or device",
        "Ensure your device meets minimum system requirements",
      ],
    },
    {
      issue: "Cannot upload feedback or save detections",
      solutions: [
        "Check your internet connection",
        "Ensure you're logged in to your account",
        "Try again after a few minutes (server might be busy)",
        "Check if you have sufficient storage space",
        "Clear browser cache and try again",
      ],
    },
    {
      issue: "Location services not working",
      solutions: [
        "Enable location permissions in your browser settings",
        "Check if location services are enabled on your device",
        "Try refreshing the page and allowing location access",
        "If using mobile, ensure GPS is turned on",
        "Try setting your farm location manually in the app",
      ],
    },
  ];

  const handleEmailSupport = () => {
    const subject = encodeURIComponent(
      "Rice Disease Detection App - Support Request"
    );
    const body = encodeURIComponent(`Hello Support Team,

I need assistance with the Rice Disease Detection App.

Issue Description:
[Please describe your issue here]

Device Information:
- Browser: ${navigator.userAgent}
- Screen Resolution: ${window.screen.width}x${window.screen.height}
- Timestamp: ${new Date().toISOString()}

Thank you for your help!`);

    window.open(
      `mailto:support@ricediseasedetection.com?subject=${subject}&body=${body}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center mb-2">
              <HelpCircle className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Help & Support
              </h1>
            </div>
            <p className="text-gray-600">
              Get help with using the Rice Disease Detection app, find answers
              to common questions, and troubleshoot issues.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleEmailSupport}
                className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <Mail className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Email Support</h3>
                  <p className="text-sm text-gray-600">Get personalized help</p>
                </div>
              </button>

              <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Book className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">User Guide</h3>
                  <p className="text-sm text-gray-600">
                    Learn how to use the app
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  window.open(
                    "https://github.com/Rowine/yolov8-web-app/issues",
                    "_blank"
                  )
                }
                className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
              >
                <Bug className="h-6 w-6 text-orange-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Report Bug</h3>
                  <p className="text-sm text-gray-600">Found an issue?</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
              </button>
            </div>
          </div>

          {/* Getting Started */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Getting Started
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    1. Set up your profile
                  </h3>
                  <p className="text-sm text-gray-600">
                    Create an account and set your farm location for better
                    features.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    2. Allow camera access
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enable camera permissions to capture rice leaf images.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    3. Capture clear images
                  </h3>
                  <p className="text-sm text-gray-600">
                    Take well-lit, focused photos of rice leaves for best
                    results.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    4. Review results
                  </h3>
                  <p className="text-sm text-gray-600">
                    Check detection results and follow prevention
                    recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() =>
                      setExpandedFaq(expandedFaq === index ? null : index)
                    }
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    {expandedFaq === index ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Troubleshooting Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              Troubleshooting
            </h2>
            <div className="space-y-3">
              {troubleshootingItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() =>
                      setExpandedTrouble(
                        expandedTrouble === index ? null : index
                      )
                    }
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">
                      {item.issue}
                    </span>
                    {expandedTrouble === index ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedTrouble === index && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600 text-sm mb-3">
                        Try these solutions:
                      </p>
                      <ul className="space-y-2">
                        {item.solutions.map((solution, solutionIndex) => (
                          <li
                            key={solutionIndex}
                            className="flex items-start text-sm text-gray-600"
                          >
                            <span className="inline-block w-4 h-4 rounded-full bg-orange-100 text-orange-600 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">
                              {solutionIndex + 1}
                            </span>
                            {solution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* System Requirements & Tips */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 text-purple-600 mr-2" />
              System Requirements & Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Smartphone className="h-4 w-4 text-gray-600 mr-2" />
                  System Requirements
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Modern web browser (Chrome, Safari, Firefox, Edge)</li>
                  <li>• Device with camera support</li>
                  <li>• Minimum 2GB RAM recommended</li>
                  <li>• Internet connection for full features</li>
                  <li>• JavaScript enabled</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Camera className="h-4 w-4 text-gray-600 mr-2" />
                  Photography Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Use natural daylight when possible</li>
                  <li>• Keep camera steady to avoid blur</li>
                  <li>• Fill frame with the rice leaf</li>
                  <li>• Avoid shadows and reflections</li>
                  <li>• Clean camera lens regularly</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    Email Support
                  </p>
                  <p className="text-gray-600">
                    support@ricediseasedetection.com
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    Response Time
                  </p>
                  <p className="text-gray-600">Usually within 24 hours</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  App Version: 1.0.0 | Last Updated:{" "}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
