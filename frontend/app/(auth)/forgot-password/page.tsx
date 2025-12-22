"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  forgotPassword,
  verifyOTP,
  resetPassword,
  clearError,
} from "@/redux/slices/authSlice";

// Flow stages
type ResetStage = "email" | "otp" | "password" | "success";

export default function ForgotPasswordPage() {
  const [stage, setStage] = useState<ResetStage>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle email submission and OTP request
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address");
      return;
    }

    try {
      await dispatch(forgotPassword(trimmedEmail)).unwrap();
      setStage("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      await dispatch(verifyOTP({ email, otp: trimmedOtp })).unwrap();
      setStage("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter a new password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Password must contain at least one special character");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      await dispatch(
        resetPassword({ email, password, confirmPassword })
      ).unwrap();
      setStage("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case "email":
        return <Mail className="h-7 w-7 text-white" />;
      case "otp":
        return <ShieldCheck className="h-7 w-7 text-white" />;
      case "password":
        return <Lock className="h-7 w-7 text-white" />;
      case "success":
        return <CheckCircle className="h-7 w-7 text-white" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Back button */}
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 mb-8 hover:text-gray-900 transition-all hover:gap-2 gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to login</span>
          </Link>

          {/* Icon & Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              {getStageIcon()}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {stage === "email" && "Forgot Password"}
              {stage === "otp" && "Enter Verification Code"}
              {stage === "password" && "Create New Password"}
              {stage === "success" && "Password Reset Successful"}
            </h1>
            <p className="text-gray-600 mt-2">
              {stage === "email" &&
                "Enter your email to receive a password reset code"}
              {stage === "otp" && (
                <>
                  Verification code sent to <span className="font-semibold text-gray-900">{email}</span>
                </>
              )}
              {stage === "password" && "Choose a new secure password"}
              {stage === "success" && "You can now log in with your new password"}
            </p>
          </div>

          {/* Error message */}
          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start animate-shake">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error || localError}</p>
            </div>
          )}

          {/* Email Stage */}
          {stage === "email" && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="h-11 transition-all focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          )}

          {/* OTP Stage */}
          {stage === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <Label htmlFor="otp" className="text-gray-700 font-medium mb-2 block text-center">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  disabled={loading}
                  className="h-14 text-center text-2xl tracking-widest font-semibold transition-all focus:ring-2 focus:ring-blue-500"
                  inputMode="numeric"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                  onClick={() => {
                    setStage("email");
                    setOtp("");
                  }}
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}

          {/* Password Reset Stage */}
          {stage === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium mb-2 block">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="h-11 pr-10 transition-all focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Password must be at least 6 characters and include at least one
                  special character
                </p>
              </div>

              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-700 font-medium mb-2 block"
                >
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="h-11 transition-all focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          {/* Success Stage */}
          {stage === "success" && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white h-11 font-semibold shadow-lg hover:shadow-xl transition-all">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
