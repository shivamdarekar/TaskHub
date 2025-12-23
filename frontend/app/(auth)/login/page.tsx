"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { EyeIcon, EyeOffIcon, Loader2, CheckCircle2, LayoutGrid } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginUser, verify2FA, clearError } from "@/redux/slices/authSlice";
import {fetchUserWorkspaces} from "@/redux/slices/workspaceSlice";
import AuthNavbar from "@/components/AuthNavbar";

interface LoginResponse {
  requiresTwoFA: boolean;
  twoFAToken: string;
  email: string;
  id?: string;
  name?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFAData, setTwoFAData] = useState({
    twoFAToken: "",
    email: "",
    otp: "",
  });
  const [isCheckingWorkspaces,setIsCheckingWorkspaces] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [twoFaSubmitting, setTwoFaSubmitting] = useState(false);
  const isMountedRef = useRef(true);
  const hasRedirectedRef = useRef(false);

  //handle navigation after authentication
  const handlePostLoginNavigation = async () => {
    if (!isMountedRef.current) return;
    setIsCheckingWorkspaces(true);
    try{
      const result = await dispatch(fetchUserWorkspaces()).unwrap();
      if (!isMountedRef.current) return;
      if (result.length == 0) {
        router.replace("/workspace/create")
      } else {
        router.replace(`/workspace/${result[0].id}`);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error("Failed to fetch workspaces",err);
        setSubmitting(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsCheckingWorkspaces(false);
      }
    }
  };

  // Redirect if already authenticated (only once)
  useEffect(() => {
    if (isAuthenticated && !loading && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      dispatch(fetchUserWorkspaces()).unwrap().then((workspaces) => {
        if (workspaces.length > 0) {
          router.replace(`/workspace/${workspaces[0].id}`);
        } else {
          router.replace("/workspace/create");
        }
      }).catch((err) => {
        console.error("Failed to fetch workspaces:", err);
        hasRedirectedRef.current = false; // Allow retry on error
      });
    }
  }, [isAuthenticated, loading, router, dispatch]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      hasRedirectedRef.current = false; // Reset on unmount
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isMountedRef.current) return;
  setSubmitting(true);
  try {
    const result = await dispatch(loginUser(formData)).unwrap();
    const payload = result as LoginResponse;
    if (!isMountedRef.current) return;

    if (payload && payload.requiresTwoFA) {
      setRequires2FA(true);
      setTwoFAData({
        twoFAToken: payload.twoFAToken,
        email: payload.email,
        otp: "",
      });
      setSubmitting(false);
      return;
    }
    
    await handlePostLoginNavigation();
  } catch (err) {
    if (isMountedRef.current) {
      console.error("Login failed:", err);
      setSubmitting(false);
    }
  }
};

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaSubmitting || !isMountedRef.current) return;
    setTwoFaSubmitting(true);

    try {
      const result = await dispatch(verify2FA(twoFAData)).unwrap();
      if (!isMountedRef.current) return;
      
      setRequires2FA(false);
      setTwoFAData({ twoFAToken: "", email: "", otp: "" });
      await handlePostLoginNavigation();
    } catch (err) {
      if (isMountedRef.current) {
        console.error("2FA verification failed:", err);
        setTwoFaSubmitting(false);
      }
    }
  };

  // show loading if checking workspaces
  if (isCheckingWorkspaces) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
            <LayoutGrid className="h-8 w-8 text-white" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold text-lg">Setting up your workspace...</p>
          <p className="text-gray-500 text-sm mt-2">This will only take a moment</p>
        </div>
      </div>
    );
  }

  if (requires2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Two-Factor Authentication
              </h2>
              <p className="text-gray-600 mt-2 text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handle2FASubmit} className="space-y-5">
              <div>
                <Label htmlFor="otp" className="text-gray-700 font-medium mb-2 block text-center">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={twoFAData.otp}
                  onChange={(e) => {
                    setTwoFAData({ ...twoFAData, otp: e.target.value });
                    if (error) dispatch(clearError());
                  }}
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                  className="text-center text-2xl tracking-widest h-14 font-semibold transition-all focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={loading || twoFaSubmitting || twoFAData.otp.length !== 6}
              >
                {loading || twoFaSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setTwoFAData({ twoFAToken: "", email: "", otp: "" });
                  dispatch(clearError());
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center transition-colors"
              >
                Back to login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      <AuthNavbar />

      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="text-gray-600 mt-2">
              New to TaskHub?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading || isCheckingWorkspaces}
                className="h-11 transition-all focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading || isCheckingWorkspaces}
                  className="pr-10 h-11 transition-all focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={submitting || loading || isCheckingWorkspaces}
            >
              {submitting || loading || isCheckingWorkspaces ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isCheckingWorkspaces ? "Loading workspace..." : "Signing in..."}
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
