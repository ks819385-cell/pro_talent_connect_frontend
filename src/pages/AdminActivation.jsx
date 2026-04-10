import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  KeyIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import FloatingShapes from "../components/common/FloatingShapes";
import { api, fetchCsrfToken } from "../services/api";

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const AdminActivation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const seededValues = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailFromQuery = searchParams.get("email");
    const otpFromQuery = searchParams.get("otp");
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem("pendingActivationEmail");
    return {
      email: (emailFromQuery || emailFromState || emailFromStorage || "").trim().toLowerCase(),
      otp: (otpFromQuery || "").trim(),
    };
  }, [location.search, location.state]);

  const [formData, setFormData] = useState({
    email: seededValues.email,
    name: "",
    otp: seededValues.otp,
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    fetchCsrfToken();

    const session = localStorage.getItem("adminSession");
    if (session) {
      navigate("/admin");
    }
  }, [navigate]);

  useEffect(() => {
    if (!seededValues.email && !seededValues.otp) return;
    setFormData((prev) => ({
      ...prev,
      email: seededValues.email || prev.email,
      otp: prev.otp || seededValues.otp,
    }));
  }, [seededValues]);

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResendOtp = async () => {
    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email first.");
      return;
    }

    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const response = await api.resendActivationOtp(normalizedEmail);
      localStorage.setItem("pendingActivationEmail", normalizedEmail);
      setSuccess(
        response?.data?.message ||
          "A new activation OTP has been sent to your email.",
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const email = formData.email.trim().toLowerCase();
    const name = formData.name.trim();
    const otp = formData.otp.trim();

    if (!email || !name || !otp || !formData.newPassword || !formData.confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    if (!strongPasswordPattern.test(formData.newPassword)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.activateAdmin({
        email,
        name,
        otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (!response.data) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("adminSession", "1");
      localStorage.removeItem("pendingActivationEmail");

      const { token, ...adminData } = response.data;
      localStorage.setItem("adminData", JSON.stringify(adminData));

      setSuccess("Account activated successfully. Redirecting to dashboard...");
      setTimeout(() => navigate("/admin"), 600);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white flex items-center justify-center px-4 py-20">
      <Link
        to="/login"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
      >
        <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Login
      </Link>

      <FloatingShapes />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Activate <span className="text-red-500">Admin Account</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Verify OTP and set your password. Activation OTP is valid for 72 hours.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-lg text-emerald-300 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">OTP Code</label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-60"
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setField("otp", e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="Enter 6-digit OTP"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.newPassword}
                  onChange={(e) => setField("newPassword", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setField("confirmPassword", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Activating..." : "Activate Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminActivation;
