"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
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
      
      // Removed credentials: "include" to fix CORS issue
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/users/verify-email?token=${token}`,
        { method: "GET" }
      );

      console.log("Response status:", response.status);
      
      // Handle non-JSON responses gracefully
      let data = {};
      try {
        data = await response.json();
        console.log("Response data:", data);
      } catch (e) {
        console.log("Response was not JSON");
      }
      
      // Just check for successful status code
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

  // Add a timeout to prevent endless spinner
  const timeoutId = setTimeout(() => {
    if (verificationStatus === "loading") {
      console.log("Verification timed out");
      setVerificationStatus("error");
      setMessage("Verification timed out. Please try again later.");
    }
  }, 15000); // 15 seconds timeout

  // Delay the verification slightly to show the loading state
  const delayId = setTimeout(() => {
    verifyEmail();
  }, 1000);

  // Clean up timeout on component unmount
  return () => {
    clearTimeout(timeoutId);
    clearTimeout(delayId);
  };
}, [token, verificationStatus]); // Add verificationStatus to dependency array to monitor changes

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
        {verificationStatus === "loading" && (
          <div className="py-8">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
            <h2 className="text-xl font-semibold mt-6 mb-2">
              Verifying your email...
            </h2>
            <p className="text-gray-600">
              This will only take a moment.
            </p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h2 className="text-xl font-semibold mt-6 mb-2">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your email has been verified. You can now sign in to your account.
            </p>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="py-8">
            <XCircle className="w-16 h-16 text-red-600 mx-auto" />
            <h2 className="text-xl font-semibold mt-6 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Register Again
                </Button>
              </Link>
              <Link href="/resend-verification">
                <Button variant="outline" className="border-blue-600 text-blue-600">
                  Resend Verification
                </Button>
              </Link>
            </div>
          </div>
        )}

        {verificationStatus === "invalid" && (
          <div className="py-8">
            <XCircle className="w-16 h-16 text-yellow-600 mx-auto" />
            <h2 className="text-xl font-semibold mt-6 mb-2">
              Invalid Verification Link
            </h2>
            <p className="text-gray-600 mb-6">
              The verification link appears to be invalid. Please check your email for the correct link or request a new verification email.
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Back to Login
                </Button>
              </Link>
              <Link href="/resend-verification">
                <Button variant="outline" className="border-blue-600 text-blue-600">
                  Resend Verification
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}