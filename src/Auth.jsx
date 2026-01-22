import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl p-8">
        
            <Link to="/">
            <button
            
                    className="p-2 rounded-full border border-zinc-700 hover:bg-zinc-800 transition"
                    title="Toggle sidebar"
                >
                    <svg
                        className="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d='M15 19l-7-7 7-7'
                        />

                    </svg>
                </button>
            </Link>
        {/* Header */}
        <div className="text-center mb-8">
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
        <form className="space-y-4">
          {!isLogin && (
            <InputField
              icon={<User size={18} />}
              placeholder="Full Name"
              type="text"
            />
          )}

          <InputField
            icon={<Mail size={18} />}
            placeholder="Email address"
            type="email"
          />

          <InputField
            icon={<Lock size={18} />}
            placeholder="Password"
            type="password"
          />

          {!isLogin && (
            <InputField
              icon={<Lock size={18} />}
              placeholder="Confirm Password"
              type="password"
            />
          )}

          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition text-white py-2.5 rounded-xl font-medium"
          >
            {isLogin ? "Login" : "Sign up"}
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

/* ---------------- Reusable Input ---------------- */

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
