import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import useUserStore from "../store/userStore";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { Sidebar } from "../components/Sidebar";
import {
  Calendar,
  Clock,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { MODEL_CONFIG } from "../config/constants";

const DetectionSessionCard = ({ session, formatDate, formatTime }) => {
  const [expanded, setExpanded] = useState(false);

  const getSessionStatus = () => {
    if (session.isRiceLeaf === false) {
      return {
        icon: <XCircle className="w-5 h-5 text-orange-600" />,
        text: "Not Rice Leaf",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-100",
        textColor: "text-orange-800",
      };
    } else if (!session.hasDetections) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        text: "Healthy",
        bgColor: "bg-green-50",
        borderColor: "border-green-100",
        textColor: "text-green-800",
      };
    } else {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        text: `${session.detectionCount} Issue${
          session.detectionCount > 1 ? "s" : ""
        } Found`,
        bgColor: "bg-red-50",
        borderColor: "border-red-100",
        textColor: "text-red-800",
      };
    }
  };

  const status = getSessionStatus();

  return (
    <div
      className={`border rounded-lg p-4 transition-colors ${status.borderColor} ${status.bgColor}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          {status.icon}
          <div>
            <h3 className={`text-lg font-medium ${status.textColor}`}>
              {status.text}
            </h3>
            <div className="mt-1 space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(session.timestamp)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(session.timestamp)}
              </div>
              {session.classification && (
                <div className="text-xs text-gray-400">
                  Classification:{" "}
                  {session.classification.prediction
                    ?.replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown"}
                  ({(session.classification.confidence * 100).toFixed(1)}%)
                </div>
              )}
            </div>
          </div>
        </div>

        {session.hasDetections && session.detections && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {expanded && session.detections && session.detections.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Detected Issues:
          </h4>
          <div className="space-y-2">
            {session.detections.map((detection, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white rounded-lg p-3 border border-gray-100"
              >
                <span className="font-medium text-gray-800">
                  {detection.class
                    ?.replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                    "Unknown Issue"}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    detection.confidence > 0.9
                      ? "bg-red-100 text-red-800"
                      : detection.confidence > MODEL_CONFIG.confidenceThreshold
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {(detection.confidence * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryHeader = ({ category }) => (
  <div className="flex items-center justify-center mb-6">
    <div className="flex-grow border-t border-gray-300"></div>
    <h2 className="mx-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
      {category}
    </h2>
    <div className="flex-grow border-t border-gray-300"></div>
  </div>
);

const OfflineMessage = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
    <WifiOff className="w-12 h-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">You're Offline</h3>
    <p className="text-gray-500 text-center">
      Detection history requires an internet connection. Please check your
      connection and try again.
    </p>
  </div>
);

const StatsCard = ({ sessions }) => {
  const totalSessions = sessions.length;
  const healthySessions = sessions.filter(
    (s) => s.isRiceLeaf !== false && !s.hasDetections
  ).length;
  const diseaseSessions = sessions.filter((s) => s.hasDetections).length;
  const nonRiceSessions = sessions.filter((s) => s.isRiceLeaf === false).length;
  const totalIssues = sessions.reduce(
    (sum, s) => sum + (s.detectionCount || 0),
    0
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
        <div className="text-sm text-blue-800">Total Scans</div>
      </div>
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600">
          {healthySessions}
        </div>
        <div className="text-sm text-green-800">Healthy</div>
      </div>
      <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-red-600">{diseaseSessions}</div>
        <div className="text-sm text-red-800">Issues Found</div>
      </div>
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-orange-600">{totalIssues}</div>
        <div className="text-sm text-orange-800">Total Issues</div>
      </div>
    </div>
  );
};

const DetectionHistoryPage = () => {
  const { user } = useUserStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user || !isOnline) return;

      try {
        const detectionsRef = collection(db, "detections");
        const q = query(
          detectionsRef,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const sessionData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSessions(sessionData);
      } catch (error) {
        console.error("Error fetching detection sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, isOnline]);

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

  // Group sessions by time category
  const groupedSessions = sessions.reduce((groups, session) => {
    const category = getTimeCategory(session.timestamp);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(session);
    return groups;
  }, {});

  // Sort categories in chronological order
  const sortedCategories = Object.keys(groupedSessions).sort((a, b) => {
    const order = ["Today", "Yesterday", "This Week", "This Month"];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return b.localeCompare(a); // For years, sort in descending order
  });

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Sidebar />
      <div className="flex-1 px-4 py-8 flex flex-col max-w-5xl mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Detection History
          </h1>
          <p className="text-base text-gray-600">
            View your rice plant monitoring sessions and results
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {!isOnline ? (
            <OfflineMessage />
          ) : loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Monitoring Sessions Yet
              </h3>
              <p className="text-gray-500">
                Start monitoring your rice plants to build your history.
              </p>
            </div>
          ) : (
            <>
              <StatsCard sessions={sessions} />
              <div className="space-y-6">
                {sortedCategories.map((category) => (
                  <div key={category}>
                    <CategoryHeader category={category} />
                    <div className="space-y-4">
                      {groupedSessions[category].map((session) => (
                        <DetectionSessionCard
                          key={session.id}
                          session={session}
                          formatDate={formatDate}
                          formatTime={formatTime}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectionHistoryPage;
