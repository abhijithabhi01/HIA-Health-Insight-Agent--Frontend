import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "./api/auth.api";
import { baseURL } from "./api/BASEURL";

const ADMIN_EMAILS = [
  'admin@healthinsight.com',
  'admin@hia.com',
  'superadmin@healthinsight.com'
];

export default function Auth({ setIsAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Check if email is an admin email
  const isAdminEmail = (email) => {
    return ADMIN_EMAILS.includes(email.toLowerCase().trim());
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    if (!isLogin && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Check if admin email - redirect to backend admin panel
if (isLogin && isAdminEmail(form.email)) {
  // Show toast first
  toast.success("Opening Admin Panel in new tab...", {
    duration: 2000,
  });
  
  // Wait for toast to be visible before opening new tab
  setTimeout(() => {
    window.open(`${baseURL}/admin-panel/login`, '_blank');
    
    // Clear the form after opening
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }, 1500); // 1.5 second delay
  
  return; // Stop execution here - no API calls
}

    try {
      setLoading(true);

      if (isLogin) {
        // LOGIN (only for non-admin users)
        const res = await authAPI.login(form.email, form.password);
        localStorage.setItem("token", res.data.token);
        setIsAuth(true);
        toast.success("Login successful");
        navigate("/", { replace: true });

      } else {
        // REGISTER
        // Prevent admin email registration
        if (isAdminEmail(form.email)) {
          toast.error("This email is reserved for administrators. Please use a different email.");
          return;
        }
        
        await authAPI.register(form.name, form.email, form.password);
        toast.success("Account created! Please login");
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Authentication failed");
      console.log(err);

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl p-8">
        {/* Back */}
        <Link to="/">
          <button className="p-2 rounded-full border border-zinc-700 hover:bg-zinc-800 transition">
            <svg
              className="w-5 h-5 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </Link>

        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            HIA
          </div>
          <h2 className="text-2xl font-semibold">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isLogin
              ? "Login to continue to Health Insight"
              : "Join Health Insight today"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <InputField
              icon={<User size={18} />}
              placeholder="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          )}

          <InputField
            icon={<Mail size={18} />}
            placeholder="Email address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <InputField
            icon={<Lock size={18} />}
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          {!isLogin && (
            <InputField
              icon={<Lock size={18} />}
              placeholder="Confirm Password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition text-white py-2.5 rounded-xl font-medium disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Login"
                : "Sign up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="px-3 text-xs text-gray-500">OR</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-gray-400">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-blue-400 hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ---------------- Input ---------------- */

function InputField({ icon, ...props }) {
  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 focus-within:border-blue-500 transition">
      <span className="text-gray-400">{icon}</span>
      <input
        {...props}
        className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-500"
      />
    </div>
  );
}