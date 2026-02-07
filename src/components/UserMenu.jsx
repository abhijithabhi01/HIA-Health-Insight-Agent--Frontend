import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn, LogOut, Trash2, User, X, Briefcase, Upload, CheckCircle, XCircle, Clock } from "lucide-react";
import { confirmToast } from "./ConfirmToast";
import { authAPI } from "../api/auth.api";
import { hcAPI } from "../api/hc.api";

export default function UserMenu({ onDeleteChat }) {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHCApplication, setShowHCApplication] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [hcApplication, setHCApplication] = useState(null);
  const [loadingHC, setLoadingHC] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem("token");

  // Fetch user profile
  const fetchProfile = async () => {
    if (!isAuthenticated) return;
    
    setLoadingProfile(true);
    try {
      const response = await authAPI.getProfile();
      setUserProfile(response.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch HC application status
  const fetchHCApplication = async () => {
    setLoadingHC(true);
    try {
      const response = await hcAPI.getMyApplication();
      setHCApplication(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // No application found
        setHCApplication({ hasApplication: false });
      } else {
        console.error("Failed to fetch HC application:", err);
        toast.error("Failed to load application status");
      }
    } finally {
      setLoadingHC(false);
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

  function openHCApplication() {
    setOpen(false);
    setShowHCApplication(true);
    fetchHCApplication();
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
          <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg overflow-hidden z-50">
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
                  onClick={openHCApplication}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-zinc-800 border-none focus:outline-none focus:ring-0 text-blue-400"
                >
                  <Briefcase size={16} /> HC Application
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
                <p className="text-gray-400 text-sm mb-2">
                  {userProfile.email || 'No email'}
                </p>

                {/* Role Badge */}
                {userProfile.role && (
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
                    userProfile.role === 'ADMIN' ? 'bg-purple-600 text-white' :
                    userProfile.role === 'HC' ? 'bg-green-600 text-white' :
                    'bg-zinc-700 text-gray-300'
                  }`}>
                    {userProfile.role}
                  </div>
                )}

                {/* Account Actions */}
                <div className="w-full mt-6 space-y-3">
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-gray-200"
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
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setShowProfile(false)}
                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-gray-200 font-medium"
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

      {/* HC Application Modal */}
      {showHCApplication && (
        <HCApplicationModal
          onClose={() => setShowHCApplication(false)}
          application={hcApplication}
          loading={loadingHC}
          onRefresh={fetchHCApplication}
        />
      )}
    </>
  );
}

// HC Application Modal Component
function HCApplicationModal({ onClose, application, loading, onRefresh }) {
  const [formData, setFormData] = useState({
    fullName: '',
    qualification: '',
    companyName: '',
  });
  const [files, setFiles] = useState({
    profilePicture: null,
    aadhaarDocument: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.qualification || !formData.companyName) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!files.profilePicture || !files.aadhaarDocument) {
      toast.error('Please upload both profile picture and Aadhaar document');
      return;
    }

    setSubmitting(true);
    
    try {
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('qualification', formData.qualification);
      submitData.append('companyName', formData.companyName);
      submitData.append('profilePicture', files.profilePicture);
      submitData.append('aadhaarDocument', files.aadhaarDocument);

      await hcAPI.submitApplication(submitData);
      toast.success('HC application submitted successfully!');
      onRefresh();
      
      // Reset form
      setFormData({ fullName: '', qualification: '', companyName: '' });
      setFiles({ profilePicture: null, aadhaarDocument: null });
    } catch (err) {
      console.error('Failed to submit application:', err);
      toast.error(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show application status if exists
  if (application?.hasApplication && application?.application) {
    const app = application.application;
    
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <h2 className="text-2xl font-bold text-gray-200 mb-6 flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Health Care Assistant Application Status
          </h2>

          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-800/50">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                app.status === 'PENDING' ? 'bg-yellow-600 text-white' :
                app.status === 'APPROVED' ? 'bg-green-600 text-white' :
                'bg-red-600 text-white'
              }`}>
                {app.status === 'PENDING' && <Clock className="w-4 h-4" />}
                {app.status === 'APPROVED' && <CheckCircle className="w-4 h-4" />}
                {app.status === 'REJECTED' && <XCircle className="w-4 h-4" />}
                {app.status}
              </div>
            </div>

            {/* Application Details */}
            <div className="space-y-3 bg-zinc-800/30 rounded-lg p-4">
              <div>
                <label className="text-sm text-gray-400">Full Name</label>
                <p className="text-gray-200">{app.fullName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-gray-200">{app.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Qualification</label>
                <p className="text-gray-200">{app.qualification}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Company</label>
                <p className="text-gray-200">{app.companyName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Applied On</label>
                <p className="text-gray-200">{new Date(app.appliedAt).toLocaleDateString()}</p>
              </div>
              
              {app.status === 'REJECTED' && app.rejectionReason && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <label className="text-sm text-red-400 font-semibold">Rejection Reason</label>
                  <p className="text-red-300 mt-1">{app.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">

              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-gray-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show application form
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-full transition"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <h2 className="text-2xl font-bold text-gray-200 mb-2 flex items-center gap-2">
          <Briefcase className="w-6 h-6" />
          Apply as Healthcare Assistant
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Fill in the form below to become a verified Healthcare Assistant
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 transition"
              placeholder="Dr. John Doe"
              required
            />
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Qualification *
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 transition"
              placeholder="MBBS, MD (Internal Medicine)"
              required
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company / Organization *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 transition"
              placeholder="City General Hospital"
              required
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profile Picture * (JPG, PNG, WEBP - Max 2MB)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleFileChange(e, 'profilePicture')}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
              required
            />
            {files.profilePicture && (
              <p className="text-sm text-green-400 mt-1">✓ {files.profilePicture.name}</p>
            )}
          </div>

          {/* Aadhaar Document */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Aadhaar Document * (PDF or Image - Max 2MB)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={(e) => handleFileChange(e, 'aadhaarDocument')}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
              required
            />
            {files.aadhaarDocument && (
              <p className="text-sm text-green-400 mt-1">✓ {files.aadhaarDocument.name}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition text-white font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-gray-200 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}