"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}`;
}

function getCookie(name: string) {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function ValidateContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error" | "info">("loading");
  const [message, setMessage] = useState<string>("Validating your link…");

  useEffect(() => {
    const email = params.get("email");
    const token = params.get("token");
    const messageParam = params.get("message");

    // If there's a message from middleware (user tried to access quiz directly)
    if (messageParam) {
      setStatus("info");
      setMessage(messageParam);
      return;
    }

    // If already verified, go straight to quiz
    const verified = getCookie("quiz_verified");
    const cookieEmail = getCookie("quiz_email");
    const cookieUserId = getCookie("quiz_user_id");
    if (!email && verified === "1" && cookieEmail && cookieUserId) {
      window.location.href = "/quiz";
      return;
    }

    if (!email || !token) {
      setStatus("error");
      setMessage("Invalid link. Missing parameters.");
      return;
    }

    const run = async () => {
      try {
        const res = await fetch(
          `/api/quiz/validate?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (res.ok && data.valid) {
          // Set comprehensive cookies for user authentication
          setCookie("quiz_verified", "1");
          setCookie("quiz_email", email);
          setCookie("quiz_user_id", data.user.id);
          if (data.user.name) {
            setCookie("quiz_name", data.user.name);
          }
          
          setStatus("ok");
          setMessage("Verified! Redirecting to your quiz…");
          // Small delay for UX and then redirect without params
          setTimeout(() => router.replace("/quiz"), 600);
        } else {
          setStatus("error");
          setMessage(data.error || "Invalid or expired link.");
        }
      } catch (e) {
        setStatus("error");
        setMessage("Validation failed. Please try again.");
      }
    };
    run();
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === "ok" && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
            {status === "info" && <Info className="h-5 w-5 text-blue-600" />}
            <span>
              {status === "info" ? "Access Required" : "Validating"}
            </span>
          </CardTitle>
          <CardDescription>
            {status === "info" 
              ? "You need to verify your email to access the quiz."
              : "We're preparing your personalized quiz."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{message}</p>
          {status === "info" && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                Please check your email for a verification link, or contact support if you haven't received one.
              </p>
              <Button 
                onClick={() => window.location.href = '/'} 
                className="w-full"
                variant="outline"
              >
                Go to Homepage
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ValidatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </CardTitle>
            <CardDescription>Please wait while we load the validation page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ValidateContent />
    </Suspense>
  );
}


