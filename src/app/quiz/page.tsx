"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  XCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "@ai-sdk/react";

export default function QuizPage() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const START_PROMPT = "Hi! I'm ready to start.";

  // Lightweight cookie reader
  const getCookie = (name: string) => {
    const match = (typeof document !== 'undefined' ? document.cookie : '')
      .match(new RegExp('(?:^|;\\s*)' + name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1') + '=([^;]+)'));
    return match ? decodeURIComponent(match[1]) : null;
  };

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

  // On mount, send a start message as user (hidden later), and include USER_EMAIL if available
  useEffect(() => {
    if (!hasSentInitial) {
      setHasSentInitial(true);
      const cookieEmail = getCookie('quiz_email');
      const initialText = cookieEmail
        ? `${START_PROMPT} (User email: ${cookieEmail})`
        : START_PROMPT;
      sendMessage({
        role: "user",
        parts: [{ text: initialText, type: "text" }],
      }).catch((err) => {
        // Optionally handle error, but don't show a message to user
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

  return (
    <div className="min-h-screen py-8 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto px-4">
        <div className="border-[2px] border-border p-6 rounded-2xl bg-foreground/[0.035]">
          <div>
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto chatbot-scrollbar">
              {messages.map((message: any, index: any) => (
                // Hide only the initial start message (even if it includes USER_EMAIL)
                (message.role !== "user" || (message.parts && message.parts.length > 0 && !String(message.parts[0].text || '').startsWith(START_PROMPT))) && (
                  <div
                    key={message.id || index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 border-b border-foreground/20`}
                    >
                      <p className="whitespace-pre-wrap">
                        {typeof (message as any).content === "string" &&
                        (message as any).content
                          ? (message as any).content
                          : Array.isArray((message as any).parts)
                          ? (message as any).parts
                              .map((part: any) =>
                                typeof part.text === "string" ? part.text : ""
                              )
                              .join("")
                          : ""}
                      </p>
                    </div>
                  </div>
                )
              ))}

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
            <form className="flex space-x-2" onSubmit={handleFormSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-0"
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
          </div>
        </div>
      </div>
    </div>
  );
}