"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail, Send, CheckCircle2 } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateEmail } from "@/lib/validation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearError,
  resendVerificationEmail,
} from "@/redux/slices/authSlice";

function ResendVerificationForm() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const initialEmail = searchParams.get("email") ?? "";
  const { error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const validationError = validateEmail(trimmedEmail);

    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setEmailError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const message = await dispatch(
        resendVerificationEmail({ email: trimmedEmail })
      ).unwrap();
      setSuccessMessage(message);
    } catch {
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      <AuthNavbar />

      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100 mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-100 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="mb-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Resend Verification Email</h1>
              <p className="mt-2 text-sm text-gray-600">
                Use the same email you registered with. We&apos;ll send a fresh verification link.
              </p>
            </div>

            {successMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <p>{successMessage}</p>
              </div>
            )}

            {(error || emailError) && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {error || emailError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="mb-2 block font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setEmailError("");
                    if (error) dispatch(clearError());
                  }}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="h-11 transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Verification Link
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-center text-sm text-gray-600">
              <Link
                href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                className="font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                Back to sign in
              </Link>
              <Link
                href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                className="font-medium text-gray-500 transition-colors hover:text-gray-700"
              >
                Need to create a different account?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResendVerificationPage() {
  return (
    <Suspense>
      <ResendVerificationForm />
    </Suspense>
  );
}