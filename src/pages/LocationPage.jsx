import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix marker icon issue in Leaflet + Webpack
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationMarker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

const OfflineMessage = () => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4 flex flex-col items-center text-center">
    <WifiOff className="w-12 h-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No Internet Connection
    </h3>
    <p className="text-gray-500">
      You need to be online to save your farm location. Please check your
      connection and try again.
    </p>
  </div>
);

const LocationPage = () => {
  const [marker, setMarker] = useState(null);
  const [error, setError] = useState("");
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const saveLocation = async () => {
    const user = auth.currentUser;
    if (!user || !marker) {
      setError("Please select a location for your farm.");
      return;
    }

    if (!isOnline) {
      setError(
        "Cannot save location while offline. Please check your internet connection."
      );
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        farmLocation: {
          lat: marker.lat,
          lng: marker.lng,
        },
      });

      navigate("/");
    } catch (err) {
      setError("Failed to save location. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-green-800 mb-2 text-center">
          Set Farm Location
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Please select your farm's location on the map
        </p>

        {!isOnline && <OfflineMessage />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-800">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <MapContainer
            center={[10.3157, 123.8854]}
            zoom={10}
            style={{ height: "60vh", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            <LocationMarker onSelect={setMarker} />
            {marker && <Marker position={[marker.lat, marker.lng]} />}
          </MapContainer>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={saveLocation}
              disabled={!marker || !isOnline}
              className={`w-full py-2.5 px-4 rounded-lg text-white text-center font-medium transition-colors ${
                !marker || !isOnline
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {!marker ? "Select a Location" : "Save Location"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LocationPage;
