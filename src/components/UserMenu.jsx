import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn, LogOut, Trash2, Share2, User, X } from "lucide-react";
import { confirmToast } from "./ConfirmToast";
import { authAPI } from "../api/auth.api";
import axios from "axios";

export default function UserMenu({ onDeleteChat, onShareChat }) {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem("token");

  // Fetch user profile
  const fetchProfile = async () => {
    if (!isAuthenticated) return;
    
    setLoadingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(response.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle account deletion
  function handleDeleteAccount() {
    confirmToast(
      "This will permanently delete your account. This action cannot be undone.",
      async () => {
        try {
          await authAPI.deleteAccount();
          localStorage.removeItem("token");
          toast.success("Account deleted successfully");
          navigate("/auth", { replace: true });
          window.location.reload();
        } catch (err) {
          toast.error("Failed to delete account");
        }
      }
    );
  }

  function handleLogout() {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/auth");
  }

  function openProfile() {
    setOpen(false);
    setShowProfile(true);
    fetchProfile();
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* User Icon */}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-full hover:bg-zinc-800 transition"
        >
          <User className="w-5 h-5 text-gray-300" />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg overflow-hidden z-50">
            {!isAuthenticated ? (
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-zinc-800 border-none focus:outline-none focus:ring-0"
              >
                <LogIn size={16} /> Login
              </button>
            ) : (
              <>
                <button
                  onClick={openProfile}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-zinc-800 border-none focus:outline-none focus:ring-0"
                >
                  <User size={16} /> Profile
                </button>

                <button
                  onClick={onShareChat}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-zinc-800 border-none focus:outline-none focus:ring-0"
                >
                  <Share2 size={16} /> Share Chat
                </button>

                <button
                  onClick={onDeleteChat}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-zinc-800 border-none focus:outline-none focus:ring-0 text-red-400"
                >
                  <Trash2 size={16} /> Delete Chat
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {loadingProfile ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : userProfile ? (
              <div className="flex flex-col items-center">
                {/* User Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <span className="text-white text-3xl font-bold">
                    {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>

                {/* User Name */}
                <h2 className="text-2xl font-semibold text-gray-200 mb-2">
                  {userProfile.name || 'User'}
                </h2>

                {/* User Email */}
                <p className="text-gray-400 text-sm mb-6">
                  {userProfile.email || 'No email'}
                </p>

                {/* Additional Info */}
                <div className="w-full space-y-3 bg-zinc-800/50 rounded-xl p-4">
                  {/* Account Actions */}
<div className="w-full mt-6 space-y-3">
  {/* Logout */}
  <button
    onClick={handleLogout}
    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-gray-200 hover:text-red-400"
  >
    <LogOut size={18} />
    Logout
  </button>

  {/* Delete Account */}
  <button
    onClick={handleDeleteAccount}
    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-800 hover:bg-red-600 transition text-white"
  >
    <Trash2 size={18} />
    Delete Account
  </button>
</div>
                {/* Close Button */}
                <button
                  onClick={() => setShowProfile(false)}
                  className="mt-6 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 hover:text-red-400 rounded-lg transition text-gray-200 font-medium"
                >
                  Close
                </button>
                </div>


              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                Failed to load profile
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}