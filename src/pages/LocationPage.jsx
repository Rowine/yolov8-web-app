import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

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

const LocationPage = () => {
  const [marker, setMarker] = useState(null);
  const [error, setError] = useState("");
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  const saveLocation = async () => {
    const user = auth.currentUser;
    if (!user || !marker) {
      setError("Please select a location for your farm.");
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
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Select Your Farm Location
          </h1>
          <p className="text-gray-600 mt-2">
            Click on the map to mark your farm's location
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="rounded-lg overflow-hidden border border-gray-300">
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
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={saveLocation}
            className="py-3 px-8 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-medium transition-colors"
          >
            Save Farm Location
          </button>
        </div>
      </div>
    </main>
  );
};

export default LocationPage;
