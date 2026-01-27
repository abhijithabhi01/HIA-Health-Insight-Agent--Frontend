import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn, LogOut, Trash2, Share2, User } from "lucide-react";


export default function UserMenu({ onDeleteChat, onShareChat }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem("token");

  function handleLogout() {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/auth");
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
        <div className="absolute right-0 mt-2 w-44 bg-zinc-900 border border-zinc-900 rounded-xl shadow-lg overflow-hidden z-50">
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

              <div className="h-px bg-zinc-800" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-zinc-800 border-none focus:outline-none focus:ring-0"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
