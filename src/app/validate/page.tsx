"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

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
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string>("Validating your link…");

  useEffect(() => {
    const email = params.get("email");
    const token = params.get("token");

    // If already verified, go straight to quiz
    const verified = getCookie("quiz_verified");
    const cookieEmail = getCookie("quiz_email");
    if (!email && verified === "1" && cookieEmail) {
      router.replace("/quiz");
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
          setCookie("quiz_verified", "1");
          setCookie("quiz_email", email);
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
            {status === "ok" && <CheckCircle className="h-5 w-5" />}
            {status === "error" && <XCircle className="h-5 w-5" />}
            <span>Validating</span>
          </CardTitle>
          <CardDescription>We're preparing your personalized quiz.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{message}</p>
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


