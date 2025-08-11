"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  XCircle,
  Loader2,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "@ai-sdk/react";
import Navbar from "@/components/Navbar";
import { RoutineWithProducts } from "@/components/ui/RoutineWithProducts";

export default function QuizPage() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const START_PROMPT = "Hi! I'm ready to start.";

  // Lightweight cookie reader
  const getCookie = (name: string) => {
    const match = (typeof document !== 'undefined' ? document.cookie : '')
      .match(new RegExp('(?:^|;\\s*)' + name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1') + '=([^;]+)'));
    return match ? decodeURIComponent(match[1]) : null;
  };

  // Clean URL parameters after authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('email') || url.searchParams.has('token')) {
        // Remove query parameters and update URL without page reload
        const cleanUrl = url.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    }
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const quizEmail = getCookie('quiz_email');
      const quizUserId = getCookie('quiz_user_id');
      const quizVerified = getCookie('quiz_verified');
      
      if (quizEmail && quizUserId && quizVerified === '1') {
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
    // Also check after a delay
    const timeoutId = setTimeout(checkAuth, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  const {
    messages,
    sendMessage,
    status,
    error: chatError,
    setMessages,
    clearError,
    stop,
    regenerate,
    resumeStream,
  } = useChat();

  // On mount, send a start message as user (hidden later), always send START_PROMPT, and include USER_EMAIL if available
  useEffect(() => {
    if (!hasSentInitial) {
      setHasSentInitial(true);
      const cookieEmail = getCookie('quiz_email');
      const cookieName = getCookie('quiz_name');
      let initialText = START_PROMPT;
      if (cookieEmail) {
        initialText = `${START_PROMPT} (User name: ${cookieName}) (User email: ${cookieEmail})`;
      }
      sendMessage({
        role: "user",
        parts: [{ text: initialText, type: "text" }],
      }).catch((err) => {
        console.error('Error sending initial message:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSentInitial, sendMessage]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Only show loading indicator when status is "submitted" (waiting for AI to start streaming)
  const isLoading = status === "submitted";
  // Show streaming state (AI is responding, so don't show loading indicator)
  const isStreaming = status === "streaming";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    try {
      await sendMessage({
        role: "user",
        parts: [{ text: input, type: "text" }],
      });
      setInput("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const resetQuiz = () => {
    setMessages([]);
    toast.success("Chat cleared!");
    setHasSentInitial(false); // Allow initial AI message to be sent again
  };

  // Helper function to extract content from message parts
  const extractMessageContent = (message: any) => {
    if (typeof message.content === "string" && message.content) {
      return message.content;
    }
    
    if (Array.isArray(message.parts)) {
      const textParts = [];
      const toolParts = [];
      
      for (const part of message.parts) {
        if (part.type === "text" && typeof part.text === "string") {
          textParts.push(part.text);
        } else if (part.type?.startsWith("tool-") && part.output) {
          // Extract tool output
          if (part.output.message) {
            toolParts.push(part.output.message);
          } else if (part.output.summary) {
            toolParts.push(part.output.summary);
          }
        }
      }
      
      return [...textParts, ...toolParts].join("");
    }
    
    return "";
  };

  // Helper function to check if message contains active tools
  const hasActiveTool = (message: any) => {
    if (Array.isArray(message.parts)) {
      return message.parts.some((part: any) => 
        part.type?.startsWith("tool-") && part.state !== "output-available"
      );
    }
    return false;
  };

  // Helper function to get tool name for display
  const getToolDisplayName = (message: any) => {
    if (Array.isArray(message.parts)) {
      const toolPart = message.parts.find((part: any) => part.type?.startsWith("tool-"));
      if (toolPart) {
        const toolName = toolPart.type.replace("tool-", "");
        if (toolName.includes("routine")) {
          return "Generating Routine";
        } else if (toolName.includes("send_mail")) {
          return "Sending Mail";
        }
        return `Using ${toolName}`;
      }
    }
    return "Processing";
  };

  // ai response
  console.log("ai response", messages[messages.length - 1]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="py-8 flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto lg:px-4 px-2">
          <div className="border-[2px] border-border lg:p-6 px-2 py-4 rounded-2xl bg-foreground/[0.035]">
            <div>
              {/* Chat Messages */}
              <div className="space-y-4 mb-6 h-[60vh] max-h-[60vh] overflow-y-auto chatbot-scrollbar">
                {messages.map((message: any, index: any) => {
                  // Hide only the initial start message (even if it includes USER_EMAIL)
                  const shouldHideMessage = message.role === "user" && 
                    message.parts && 
                    message.parts.length > 0 && 
                    String(message.parts[0].text || '').startsWith(START_PROMPT);
                  
                  if (shouldHideMessage) return null;

                  const content = extractMessageContent(message);
                  console.log('content', content)
                  const isToolActive = hasActiveTool(message);
                  const toolName = getToolDisplayName(message);

                  return (
                    <div
                      key={message.id || index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`lg:max-w-[80%] max-w-[95%] px-4 py-3 border-b border-foreground/20`}>
                        {/* Show tool execution indicator */}
                        {isToolActive && (
                          <div className="flex items-center space-x-2 mb-2 text-foreground">
                            <Settings className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">{toolName}...</span>
                          </div>
                        )}
                        
                        {/* Show message content */}
                        {content && (
                          content.includes('[PRODUCTS_JSON]') ? (
                            <RoutineWithProducts content={content} />
                          ) : (
                            <p className="whitespace-pre-wrap">{content}</p>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Show loading indicator only while waiting for AI to start streaming */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Do NOT show loading indicator while streaming */}
                <div ref={chatEndRef} />
              </div>

              {/* Error Display */}
              {chatError && (
                <Alert className="border-red-200 bg-red-50 mb-4">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {chatError.message || "An error occurred. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Input Form */}
              <form className="flex flex-col lg:flex-row space-x-2" onSubmit={handleFormSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-0 lg:mb-0 mb-2"
                  disabled={isLoading || isStreaming}
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading || isStreaming}
                  className="px-6 py-3"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send"
                  )}
                </Button>
              </form>

              {/* Reset Button */}
              {messages.length > 0 && (
                <div className="hidden lg:block lg:mt-4 text-center">
                  <Button
                    onClick={resetQuiz}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    Clear Chat
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}