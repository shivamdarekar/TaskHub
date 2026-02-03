"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const redirect = searchParams.get("redirect"); // Preserve redirect from registration
  
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error" | "invalid"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
  if (!token) {
    setVerificationStatus("error");
    setMessage("Invalid verification link. No token provided.");
    return;
  }

  const verifyEmail = async () => {
    try {
      console.log("Verifying email with token:", token);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/users/verify-email?token=${token}`,
        { method: "GET" }
      );

      console.log("Response status:", response.status);
      
      let data = {};
      try {
        data = await response.json();
        console.log("Response data:", data);
      } catch {
        console.log("Response was not JSON");
      }
      
      if (response.ok) {
        setVerificationStatus("success");
      } else {
        setVerificationStatus("error");
        setMessage("Email verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      setMessage("Connection error. Please check your internet connection and try again.");
    }
  };

  const timeoutId = setTimeout(() => {
    if (verificationStatus === "loading") {
      console.log("Verification timed out");
      setVerificationStatus("error");
      setMessage("Verification timed out. Please try again later.");
    }
  }, 15000);

  const delayId = setTimeout(() => {
    verifyEmail();
  }, 1000);

  return () => {
    clearTimeout(timeoutId);
    clearTimeout(delayId);
  };
}, [token, verificationStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
          {verificationStatus === "loading" && (
            <div className="py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying your email...
              </h2>
              <p className="text-gray-600">
                This will only take a moment.
              </p>
            </div>
          )}

          {verificationStatus === "success" && (
            <div className="py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your email has been verified. You can now sign in to your account.
              </p>
              <Link href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
                <Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white h-11 font-semibold shadow-lg hover:shadow-xl transition-all">
                  Sign In{redirect ? ' to Join Workspace' : ''}
                </Button>
              </Link>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className="py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="flex flex-col gap-3">
                <Link href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="w-full">
                  <Button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white h-11 font-semibold shadow-lg hover:shadow-xl transition-all">
                    Register Again
                  </Button>
                </Link>
                <Link href={`/resend-verification${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="w-full">
                  <Button variant="outline" className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 h-11 font-semibold transition-all">
                    Resend Verification
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {verificationStatus === "invalid" && (
            <div className="py-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Verification Link
              </h2>
              <p className="text-gray-600 mb-6">
                The verification link appears to be invalid. Please check your email for the correct link or request a new verification email.
              </p>
              <div className="flex flex-col gap-3">
                <Link href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="w-full">
                  <Button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white h-11 font-semibold shadow-lg hover:shadow-xl transition-all">
                    Back to Login
                  </Button>
                </Link>
                <Link href={`/resend-verification${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="w-full">
                  <Button variant="outline" className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 h-11 font-semibold transition-all">
                    Resend Verification
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
