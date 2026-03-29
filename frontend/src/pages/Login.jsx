import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import FloatingShapes from "../components/common/FloatingShapes";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync login state across tabs: if another tab logs in, redirect to admin
  useEffect(() => {
    // Check if already logged in on mount
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin");
      return;
    }

    const handleStorageChange = (e) => {
      if (e.key === "adminToken" && e.newValue) {
        navigate("/admin");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.login(formData);

      // Validate response data
      if (!response.data || !response.data.token) {
        throw new Error("Invalid response from server");
      }

      // Store token in localStorage (TODO: Move to httpOnly cookies in future)
      localStorage.setItem("adminToken", response.data.token);

      // Store admin data (excluding token)
      const { ...adminData } = response.data;
      localStorage.setItem("adminData", JSON.stringify(adminData));

      // Redirect to admin dashboard
      navigate("/admin");
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors
          .map(e => e.message)
          .join(', ');
        setError(errorMessages);
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Login failed. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white flex items-center justify-center px-4 py-20">
      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
      >
        <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Home
      </Link>
      <FloatingShapes />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Admin <span className="text-red-500">Login</span>
          </h1>
          <p className="text-gray-400">Sign in to access the admin dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-red-500 focus:ring-red-500 focus:ring-offset-0"
                />
                <span className="text-gray-400">Remember me</span>
              </label>
              <span className="text-gray-500 cursor-not-allowed">
                Forgot password?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Need help?{" "}
          <Link
            to="/contact"
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
