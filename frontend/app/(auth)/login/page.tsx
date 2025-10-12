"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginUser, verify2FA, clearError } from "@/redux/slices/authSlice";

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

  useEffect(() => {
    if (isAuthenticated && !requires2FA) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router, requires2FA]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
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
  try {
    const result = await dispatch(loginUser(formData)).unwrap();
    const payload = result as LoginResponse;

    if (payload.requiresTwoFA) {
      setRequires2FA(true);
      setTwoFAData({
        twoFAToken: payload.twoFAToken,
        email: payload.email,
        otp: "",
      });
      return;
    }

    router.push("/dashboard");
  } catch (err) {
    // error is already set in redux slice via rejectWithValue
    // You can also show toast here if needed
    console.error("Login failed:", err);
  }
};

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(verify2FA(twoFAData));

    if (verify2FA.fulfilled.match(result)) {
      router.push("/dashboard");
    }
    // If rejected, Redux error state updates, and the <p>{error}</p> block will show
  };

  if (requires2FA) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                Two-Factor Authentication
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handle2FASubmit} className="space-y-5">
              <div>
                <Label htmlFor="otp" className="text-gray-700 mb-1.5 block">
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
                  className="text-center text-2xl tracking-widest"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
                disabled={loading || twoFAData.otp.length !== 6}
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

              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setTwoFAData({ twoFAToken: "", email: "", otp: "" });
                  dispatch(clearError());
                }}
                className="text-sm text-blue-600 hover:underline w-full text-center"
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
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              New to TaskHub?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Create an account
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-700 mb-1.5 block">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:underline"
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
                  disabled={loading}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
