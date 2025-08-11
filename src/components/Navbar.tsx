"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface UserInfo {
  email: string;
  name: string;
}

export default function Navbar() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lightweight cookie reader
  const getCookie = (name: string) => {
    const match = (typeof document !== 'undefined' ? document.cookie : '')
      .match(new RegExp('(?:^|;\\s*)' + name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1') + '=([^;]+)'));
    return match ? decodeURIComponent(match[1]) : null;
  };

  useEffect(() => {
    const checkAuth = () => {
      const quizEmail = getCookie('quiz_email');
      const quizUserId = getCookie('quiz_user_id');
      const quizVerified = getCookie('quiz_verified');
      const quizName = getCookie('quiz_name');

      if (quizEmail && quizUserId && quizVerified === '1') {
        // Try to get name from cookie or use email as fallback
        const name = quizName || quizEmail.split('@')[0];
        setUserInfo({ email: quizEmail, name });
      } else {
        // Retry after a short delay in case cookies are still being set
        setTimeout(() => {
          const retryEmail = getCookie('quiz_email');
          const retryUserId = getCookie('quiz_user_id');
          const retryVerified = getCookie('quiz_verified');
          const retryName = getCookie('quiz_name');
          
          if (retryEmail && retryUserId && retryVerified === '1') {
            const name = retryName || retryEmail.split('@')[0];
            setUserInfo({ email: retryEmail, name });
          }
        }, 1000);
      }
      setIsLoading(false);
    };

    // Initial check
    checkAuth();
    
    // Also check after a delay to catch late-set cookies
    const timeoutId = setTimeout(checkAuth, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const handleLogout = () => {
    // Clear all quiz-related cookies
    document.cookie = 'quiz_verified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'quiz_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'quiz_user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'quiz_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Reload the page to reset state
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">AI Routine Generator</div>
            <div className="animate-pulse bg-muted h-8 w-32 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  if (!userInfo) {
    return (
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">AI Routine Generator</div>
            <div className="text-sm text-muted-foreground">Guest User</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">AI Routine Generator</div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <div className="font-medium">{userInfo.name}</div>
                {/* <div className="text-muted-foreground">{userInfo.email}</div> */}
              </div>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
