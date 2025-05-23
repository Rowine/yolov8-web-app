import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import useUserStore from "../store/userStore";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import {
  getAuth,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import {
  Eye,
  EyeOff,
  Save,
  Lock,
  MapPin,
  User,
  Mail,
  Phone,
  WifiOff,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";

const OfflineMessage = () => (
  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center text-gray-800">
    <WifiOff className="h-5 w-5 mr-2 text-gray-600" />
    You're currently offline. Some features are disabled until you reconnect.
  </div>
);

const LocationMarker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

const ProfilePage = () => {
  const { user } = useUserStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [marker, setMarker] = useState(user?.farmLocation || null);
  const auth = getAuth();
  const db = getFirestore();
  const isOnline = useOnlineStatus();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!isOnline) return;

    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword) {
      setError("Please fill in all password fields");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      // Reauthenticate user before changing password
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setError(error.message);
    }
  };

  const handleLocationUpdate = async () => {
    if (!isOnline) return;

    if (!marker) {
      setError("Please select a location on the map");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        farmLocation: marker,
      });
      setSuccess("Farm location updated successfully!");
    } catch (error) {
      console.error("Error updating location:", error);
      setError("Failed to update location");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-green-50 flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

          {!isOnline && <OfflineMessage />}

          {/* User Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              User Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-2" />
                  <span className="font-medium">Name:</span>
                  <span className="ml-2">{user.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-2" />
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{user.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-2" />
                  <span className="font-medium">Phone:</span>
                  <span className="ml-2">{user.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div
            className={`bg-white rounded-xl shadow-sm p-6 mb-6 relative ${
              !isOnline ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {!isOnline && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 rounded-xl">
                <div className="flex items-center text-gray-500">
                  <WifiOff className="w-5 h-5 mr-2" />
                  Available when online
                </div>
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={!isOnline}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    disabled={!isOnline}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={!isOnline}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    disabled={!isOnline}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={!isOnline}
                className={`flex items-center justify-center w-full px-4 py-2 rounded-lg transition-colors ${
                  !isOnline
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <Lock className="w-5 h-5 mr-2" />
                Update Password
              </button>
            </form>
          </div>

          {/* Farm Location */}
          <div
            className={`bg-white rounded-xl shadow-sm p-6 relative ${
              !isOnline ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {!isOnline && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 rounded-xl">
                <div className="flex items-center text-gray-500">
                  <WifiOff className="w-5 h-5 mr-2" />
                  Available when online
                </div>
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Farm Location
            </h2>
            <div className="space-y-4">
              <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={
                    marker ? [marker.lat, marker.lng] : [10.3157, 123.8854]
                  }
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                  />
                  {isOnline && <LocationMarker onSelect={setMarker} />}
                  {marker && <Marker position={[marker.lat, marker.lng]} />}
                </MapContainer>
              </div>
              <button
                onClick={handleLocationUpdate}
                disabled={!isOnline}
                className={`flex items-center justify-center w-full px-4 py-2 rounded-lg transition-colors ${
                  !isOnline
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <MapPin className="w-5 h-5 mr-2" />
                Update Farm Location
              </button>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
