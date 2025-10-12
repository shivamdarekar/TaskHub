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

      // Move to OTP verification stage
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

      // Move to password reset stage
      setStage("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      // setLoading(false);
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

    // setLoading(true);

    try {
      await dispatch(
        resetPassword({ email, password, confirmPassword })
      ).unwrap();

      // Move to success stage
      setStage("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      // setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        {/* Back button */}
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-600 mb-6 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </Link>

        {/* Title based on current stage */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {stage === "email" && "Forgot Password"}
            {stage === "otp" && "Enter Verification Code"}
            {stage === "password" && "Create New Password"}
            {stage === "success" && "Password Reset Successful"}
          </h1>
          <p className="text-gray-600 mt-2">
            {stage === "email" &&
              "Enter your email to receive a password reset code"}
            {stage === "otp" && `We've sent a verification code to ${email}`}
            {stage === "password" && "Choose a new secure password"}
            {stage === "success" && "You can now log in with your new password"}
          </p>
        </div>

        {/* Error message */}
        {(error || localError) && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error || localError}</p>
          </div>
        )}

        {/* Email Stage */}
        {stage === "email" && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-700 mb-1.5 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              <Label htmlFor="otp" className="text-gray-700 mb-1.5 block">
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
                className="w-full text-center text-lg tracking-widest"
                inputMode="numeric"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
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
              <Label htmlFor="password" className="text-gray-700 mb-1.5 block">
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
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters and include at least one
                special character
              </p>
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="text-gray-700 mb-1.5 block"
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
                className="w-full"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset.
            </p>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Back to Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
