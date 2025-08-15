"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, Loader2, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "@ai-sdk/react";
import Navbar from "@/components/Navbar";
import { getToolDisplayName } from "@/lib/get-tool-name";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { ProductDisplay, Product } from "@/components/ProductDisplay";

export default function QuizPage() {
  const [input, setInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const START_PROMPT = "Hi! I'm ready to start.";

  const isLocal = process.env.NODE_ENV === "development";

  // Lightweight cookie reader
  const getCookie = (name: string) => {
    const match = (
      typeof document !== "undefined" ? document.cookie : ""
    ).match(
      new RegExp(
        "(?:^|;\\s*)" +
          name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$1") +
          "=([^;]+)"
      )
    );
    return match ? decodeURIComponent(match[1]) : null;
  };

  // Clean URL parameters after authentication
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("email") || url.searchParams.has("token")) {
        // Remove query parameters and update URL without page reload
        const cleanUrl = url.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
    }
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const quizEmail = getCookie("quiz_email");
      const quizUserId = getCookie("quiz_user_id");
      const quizVerified = getCookie("quiz_verified");

      if (quizEmail && quizUserId && quizVerified === "1") {
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

  // Extract products from messages
  useEffect(() => {
    if (messages.length === 0) return;

    // Find the most recent assistant message
    const assistantMessages = messages.filter(
      (msg) => msg.role === "assistant"
    );
    if (assistantMessages.length === 0) return;

    const lastMessage = assistantMessages[assistantMessages.length - 1];

    // Check if this message has parts
    if (!Array.isArray(lastMessage.parts)) return;

    // Look for tool output with products
    for (const part of lastMessage.parts as any[]) {
      if (
        part.type?.startsWith("tool-plan_and_send_routine") &&
        part.state === "output-available" &&
        part.output &&
        Array.isArray(part.output.products)
      ) {
        console.log(
          "[QuizPage] Found products in message:",
          part.output.products
        );
        setProducts(part.output.products);
        break;
      }
    }
  }, [messages]);

  // On mount, send a start message as user (hidden later), always send START_PROMPT, and include USER_EMAIL if available
  useEffect(() => {
    if (!hasSentInitial) {
      setHasSentInitial(true);
      const cookieEmail = getCookie("quiz_email");
      const cookieName = getCookie("quiz_name");
      let initialText = START_PROMPT;
      if (cookieEmail) {
        if (isLocal) {
          initialText = `${START_PROMPT} (User name: Haseeb (User email: web.dev.haseeb@gmail.com)`;
        } else {
          initialText = `${START_PROMPT} (User name: ${cookieName}) (User email: ${cookieEmail})`;
        }
      }
      sendMessage({
        role: "user",
        parts: [{ text: initialText, type: "text" }],
      }).catch((err) => {
        console.error("Error sending initial message:", err);
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
      setInput("");
      await sendMessage({
        role: "user",
        parts: [{ text: input, type: "text" }],
      });
      // setInput("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const resetQuiz = () => {
    setMessages([]);
    setProducts([]); // Clear products
    toast.success("Chat cleared!");
    setHasSentInitial(false); // Allow initial AI message to be sent again
  };

  // Helper function to extract content from message parts
  const extractMessageContent = (message: any) => {
    if (typeof message.content === "string" && message.content) {
      return message.content;
    }

    if (Array.isArray(message.parts)) {
      // Check if this is a plan_and_send_routine tool result
      const routineTool = message.parts.find(
        (part: any) =>
          part.type?.startsWith("tool-plan_and_send_routine") &&
          part.state === "output-available" &&
          part.output
      );

      // If we found a routine tool result, use its message or value
      if (routineTool?.output) {
        if (routineTool.output.message) {
          return routineTool.output.message;
        } else if (routineTool.output.value?.message) {
          return routineTool.output.value.message;
        }
      }

      // Otherwise, look for text parts
      const textParts = [];
      for (const part of message.parts) {
        if (part.type === "text" && typeof part.text === "string") {
          textParts.push(part.text);
        }
      }

      if (textParts.length > 0) {
        return textParts.join("");
      }

      // If no text parts, look for any tool output
      for (const part of message.parts) {
        if (part.type?.startsWith("tool-") && part.output) {
          if (part.output.message) {
            return part.output.message;
          } else if (part.output.summary) {
            return part.output.summary;
          }
        }
      }
    }

    return "";
  };

  // Helper function to check if message contains active tools
  const hasActiveTool = (message: any) => {
    if (Array.isArray(message.parts)) {
      return message.parts.some(
        (part: any) =>
          part.type?.startsWith("tool-") && part.state !== "output-available"
      );
    }
    return false;
  };

  // On form click focous input
  const handleFormClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen relative px-4">
      <Navbar />
      <div className="max-w-4xl lg:px-4 px-2 w-full mx-auto h-full">
        <div className=" pt-8 pb-32">
          <div>
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 ">
              {messages.map((message: any, index: any) => {
                // Hide only the initial start message (even if it includes USER_EMAIL)
                const shouldHideMessage =
                  message.role === "user" &&
                  message.parts &&
                  message.parts.length > 0 &&
                  String(message.parts[0].text || "").startsWith(START_PROMPT);

                if (shouldHideMessage) return null;

                const content = extractMessageContent(message);
                const isToolActive = hasActiveTool(message);
                const toolName = getToolDisplayName(message);

                return (
                  <div
                    key={message.id || index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`lg:max-w-[80%] max-w-[95%]  py-3 border-b border-foreground/20`}
                    >
                      {/* Show tool execution indicator */}
                      {isToolActive && (
                        <div className="flex items-center space-x-2 mb-2 text-foreground">
                          <Settings className="h-4 w-4 animate-spin" />
                          <span className="text-sm font-medium">
                            {toolName}
                          </span>
                        </div>
                      )}

                      {/* Show message content */}
                      {content && (
                        <p className="whitespace-pre-wrap">{content}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Show loading indicator only while waiting for AI to start streaming */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg py-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Lavera is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Do NOT show loading indicator while streaming */}
              <div ref={chatEndRef} />
            </div>
            {/* Products Display */}
            <ProductDisplay products={products} />

            {/* Error Display */}
            {chatError && (
              <Alert className="border-red-200 bg-red-50 mb-4">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {chatError.message || "An error occurred. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <div className="fixed lg:bottom-2 bottom-4 left-1/2 -translate-x-1/2 w-full mx-auto flex justify-center items-center lg:px-4 px-4 bg-background">
          {/* Input Form */}
          <form
            className="flex flex-col gap-2 max-w-4xl w-full rounded-2xl border border-foreground/20 shadow bg-foreground/[0.02] p-4"
            onSubmit={handleFormSubmit}
            onClick={handleFormClick}
          >
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(e as any);
                }
              }}
              placeholder="Type your message here..."
              className="field-sizing-content max-h-29.5 min-h-0 resize-none font-normal transition-all chatbot-scrollbar w-full py-0 rounded-none px-0 focus:outline-none focus:ring-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-base"
              autoFocus
            />
            <div className="flex justify-end items-center gap-2">
              {messages.length > 0 && (
                <Button
                  onClick={resetQuiz}
                  className="cursor-pointer aspect-square h-10 p-2.5 shadow-none w-fit bg-background border border-foreground/20 transition-colors group hover:bg-background"
                >
                  <Image
                    src="/icon/reset.svg"
                    alt="Reset"
                    className="h-full w-full opacity-50 group-hover:opacity-100 transition-opacity"
                    width={100}
                    height={100}
                  />
                </Button>
              )}
              {isLoading ? (
                <Button
                  type="button"
                  onClick={stop}
                  className="cursor-pointer aspect-square h-10 p-2.5 shadow-none w-fit bg-background border border-foreground/20 transition-colors"
                >
                  <Image
                    src="/icon/stop.svg"
                    alt="Stop"
                    className="h-full w-full"
                    width={100}
                    height={100}
                  />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!input.trim()}
                  className="cursor-pointer disabled:cursor-not-allowed aspect-square h-10 p-2.5 shadow-none w-fit bg-primary transition-colors"
                >
                  <Image
                    src="/icon/up-arrow.svg"
                    alt="Send"
                    className="h-full w-full"
                    width={100}
                    height={100}
                  />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Top shadow effect */}
      <div className="fixed max-w-4xl mx-auto top-0 left-1/2 -translate-x-1/2 w-full h-16 bg-gradient-to-b from-white to-transparent"></div>
    </div>
  );
}
