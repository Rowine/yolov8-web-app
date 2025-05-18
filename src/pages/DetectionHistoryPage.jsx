import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import useUserStore from "../store/userStore";
import Sidebar from "../components/Sidebar";
import { Calendar, Clock } from "lucide-react";

const DetectionHistoryPage = () => {
  const { user } = useUserStore();
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetections = async () => {
      if (!user) return;

      try {
        const detectionsRef = collection(db, "detections");
        const q = query(
          detectionsRef,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const detectionData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDetections(detectionData);
      } catch (error) {
        console.error("Error fetching detections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetections();
  }, [user]);

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getTimeCategory = (timestamp) => {
    const now = new Date();
    const date = timestamp.toDate();

    // Reset hours to compare just the dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const detectionDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (detectionDate.getTime() === today.getTime()) {
      return "Today";
    } else if (detectionDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      // Group by week if within last 7 days
      const daysAgo = Math.floor(
        (today - detectionDate) / (1000 * 60 * 60 * 24)
      );
      if (daysAgo < 7) {
        return "This Week";
      } else if (daysAgo < 30) {
        return "This Month";
      } else {
        // Format the year properly
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
        }).format(date);
      }
    }
  };

  // Group detections by time category
  const groupedDetections = detections.reduce((groups, detection) => {
    const category = getTimeCategory(detection.timestamp);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(detection);
    return groups;
  }, {});

  // Sort categories in chronological order
  const sortedCategories = Object.keys(groupedDetections).sort((a, b) => {
    const order = ["Today", "Yesterday", "This Week", "This Month"];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return b.localeCompare(a); // For years, sort in descending order
  });

  const DetectionCard = ({ detection }) => (
    <div className="border border-green-100 rounded-lg p-4 hover:bg-green-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {detection.detectedClass}
          </h3>
          <div className="mt-1 space-y-1">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(detection.timestamp)}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(detection.timestamp)}
            </div>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            detection.confidence > 0.9
              ? "bg-red-100 text-red-800"
              : detection.confidence > 0.7
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {(detection.confidence * 100).toFixed(1)}% confidence
        </span>
      </div>
    </div>
  );

  const CategoryHeader = ({ category }) => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex-grow border-t border-gray-300"></div>
      <h2 className="mx-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
        {category}
      </h2>
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Sidebar />
      <div className="flex-1 px-4 py-8 flex flex-col max-w-5xl mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Detection History
          </h1>
          <p className="text-base text-gray-600">
            View your past rice plant disease detections
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : detections.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Detections Yet
              </h3>
              <p className="text-gray-500">
                Start detecting diseases in your rice plants to build your
                history.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedCategories.map((category) => (
                <div key={category}>
                  <CategoryHeader category={category} />
                  <div className="space-y-4">
                    {groupedDetections[category].map((detection) => (
                      <DetectionCard key={detection.id} detection={detection} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectionHistoryPage;
