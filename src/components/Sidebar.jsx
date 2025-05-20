import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  FileText,
  User,
  HelpCircle,
  LogOut,
  MapPin,
  Camera,
} from "lucide-react";
import useUserStore from "../store/userStore";

const SidebarHeader = ({ onClose }) => (
  <div className="p-4 border-b border-green-100 flex justify-between items-center bg-green-50">
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
        <img
          src="/icon-192x192.png"
          alt="Rice Plant Logo"
          className="h-6 w-6"
        />
      </div>
      <h2 className="ml-3 font-semibold text-green-800">
        Rice Pest & Disease Detection
      </h2>
    </div>
    <button
      onClick={onClose}
      className="p-2 hover:bg-green-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
      aria-label="Close menu"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
);

const UserInfo = ({ user }) => (
  <div className="p-4 border-b border-green-100 bg-green-50">
    <div className="flex items-center">
      <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
      </div>
      <div className="ml-3">
        <div className="font-medium text-gray-800">{user.name || "Farmer"}</div>
        <div className="text-sm text-gray-500">{user.email}</div>
      </div>
    </div>
  </div>
);

const NavItem = ({ icon: Icon, label, onClick }) => (
  <button
    className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
    onClick={onClick}
  >
    <Icon className="w-5 h-5 mr-3 text-green-600" />
    <span>{label}</span>
  </button>
);

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
    toggleSidebar();
  };

  const handleNavigation = (path) => {
    navigate(path);
    toggleSidebar();
  };

  if (!user) return null;

  const navigationItems = [
    { icon: Camera, label: "Detect Disease", path: "/" },
    { icon: FileText, label: "Detection History", path: "/history" },
    { icon: MapPin, label: "Detection Nearby", path: "/nearby" },
    { icon: User, label: "My Profile", path: "/profile" },
    { icon: HelpCircle, label: "Help & Support", path: "/help" },
  ];

  return (
    <div className="relative">
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader onClose={toggleSidebar} />
          <UserInfo user={user} />

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-1">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => handleNavigation(item.path)}
                />
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-green-100">
            <button
              className="w-full flex items-center justify-center px-4 py-3 bg-white border border-green-600 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Sidebar };
