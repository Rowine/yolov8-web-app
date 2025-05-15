import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/userStore";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
    toggleSidebar();
  };

  const handleProfile = () => {
    // Navigate to profile page when implemented
    console.log("Profile clicked");
    toggleSidebar();
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-4">
          <button
            onClick={toggleSidebar}
            className="self-end p-2 hover:bg-gray-100 rounded-full"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="mt-8 space-y-4">
            <div className="px-4 py-2 text-sm text-gray-600">
              Signed in as: {user.email}
            </div>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleProfile}
            >
              Profile
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
