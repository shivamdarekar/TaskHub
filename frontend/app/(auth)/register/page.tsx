"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { CheckCircle, EyeIcon, EyeOffIcon, Loader2, LayoutGrid } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { registerUser,clearError } from "@/redux/slices/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import AuthNavbar from "@/components/AuthNavbar";
import { fetchUserWorkspaces } from "@/redux/slices/workspaceSlice";


export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const redirect = searchParams.get("redirect");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
  if (isAuthenticated && !hasRedirectedRef.current) {
    hasRedirectedRef.current = true;
    
    // If there's a redirect param, go there directly
    if (redirect) {
      router.replace(redirect);
      return;
    }

    // Otherwise, fetch workspaces and redirect
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
}, [isAuthenticated, router, dispatch, redirect]);

  useEffect(() => {
    return () => {
      hasRedirectedRef.current = false; // Reset on unmount
      dispatch(clearError());
    }
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (localErrors[name]) {
      setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (error) dispatch(clearError());
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
    newErrors.password = "Password must include at least one special character";
  }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      // Include redirect parameter if present (for invite flow)
      await dispatch(registerUser({ 
        ...formData, 
        redirect: redirect || undefined 
      })).unwrap();

      setIsSuccess(true);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
    } catch (err) {
      console.log("Registration failed:",err);
    } 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
      <AuthNavbar />

      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create your account
            </h2>
            <p className="text-gray-600 mt-2">
              Already have an account?{" "}
              <Link
                href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center animate-fade-in-up">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
              <p className="text-green-900 text-sm font-medium">
                Account created! Please check your email for verification
              </p>
            </div>
          )}
          
          {/* Error Message */}
          {(error || localErrors.form) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <p className="text-red-800 text-sm">{error || localErrors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 font-medium mb-2 block">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`h-11 transition-all focus:ring-2 focus:ring-purple-500 ${localErrors.name ? "border-red-400" : ""}`}
                placeholder="John Doe"
                disabled={loading}
              />
              {localErrors.name && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{localErrors.name}</p>
              )}
            </div>

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
                className={`h-11 transition-all focus:ring-2 focus:ring-purple-500 ${localErrors.email ? "border-red-400" : ""}`}
                placeholder="you@example.com"
                disabled={loading}
              />
              {localErrors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{localErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`h-11 pr-10 transition-all focus:ring-2 focus:ring-purple-500 ${localErrors.password ? "border-red-400" : ""}`}
                  placeholder="••••••••"
                  disabled={loading}
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
              {localErrors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{localErrors.password}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="text-gray-700 font-medium mb-2 block"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`h-11 transition-all focus:ring-2 focus:ring-purple-500 ${localErrors.confirmPassword ? "border-red-400" : ""}`}
                placeholder="••••••••"
                disabled={loading}
              />
              {localErrors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {localErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-500 mt-6">
            By creating an account, you agree to our{" "}
            <Link href="#" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
              Privacy Policy
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
