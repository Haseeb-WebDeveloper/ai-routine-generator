"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  XCircle,
  Loader2,
  Settings,
  Camera,
  Upload,
  StopCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "@ai-sdk/react";
import Navbar from "@/components/Navbar";
import { RoutineWithProducts } from "@/components/ui/RoutineWithProducts";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { formatRoutineText } from "@/lib/format-text-content";
import { getToolDisplayName } from "@/lib/get-tool-name";

export default function QuizPage() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const START_PROMPT = "Hi! I'm ready to start.";

  const isLocal = process.env.NODE_ENV === 'development';

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
        console.error('Error sending initial message:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSentInitial, sendMessage]);

  // Auto-scroll to bottom only when a new user message is added
  useEffect(() => {
    if (
      messages.length > 0 &&
      messages[messages.length - 1].role === "user"
    ) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // Only scroll for user messages, not for assistant/AI messages
    // eslint-disable-next-line
  }, [messages.length > 0 ? messages[messages.length - 1]?.role : null]);
  // ^ This dependency ensures the effect runs only when the last message's role changes

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

  const handleImageUpload = async (imageUrl: string) => {
    try {
      // Send the image URL to the AI for skin type analysis
      await sendMessage({
        role: "user",
        parts: [{ 
          text: `I've uploaded an image of my skin for analysis. Please analyze it to determine my skin type. Image URL: ${imageUrl}`, 
          type: "text" 
        }],
      });
      toast.success("Image sent for analysis!");
    } catch (err) {
      console.error("Failed to send image for analysis:", err);
      toast.error("Failed to send image for analysis. Please try again.");
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

  // Memoized content parsing to prevent unnecessary re-renders
  const getMessageDisplayContent = (content: string, isStreaming: boolean) => {
    if (!content.includes('[PRODUCTS_JSON]')) {
      return { type: 'text', content };
    }
    
    // Check if content is complete (has both opening and closing markers)
    const isComplete = content.includes('[PRODUCTS_JSON]') && content.includes('[/PRODUCTS_JSON]');
    
    if (isComplete) {
      return { type: 'routine', content };
    } else {
      return { type: 'streaming', content };
    }
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

  // Helper function to check if a message is still streaming
  const isMessageStreaming = (message: any) => {
    // Check if this is the last message and it's still streaming
    const isLastMessage = messages.indexOf(message) === messages.length - 1;
    const content = extractMessageContent(message);
    
    // A message is streaming if:
    // 1. It's the last message AND the overall chat is streaming, OR
    // 2. It contains [PRODUCTS_JSON] but doesn't have the closing marker yet
    return (isLastMessage && isStreaming) || 
           (content.includes('[PRODUCTS_JSON]') && !content.includes('[/PRODUCTS_JSON]'));
  };

  // Helper function to check if message content is complete for parsing
  const isContentComplete = (content: string) => {
    // Check if the content has both opening and closing markers
    const hasOpeningMarker = content.includes('[PRODUCTS_JSON]');
    const hasClosingMarker = content.includes('[/PRODUCTS_JSON]');
    
    // Only consider complete if we have both markers
    return hasOpeningMarker && hasClosingMarker;
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
                  const isToolActive = hasActiveTool(message);
                  const toolName = getToolDisplayName(message);
                  const isStreaming = isMessageStreaming(message);
                  const displayContent = getMessageDisplayContent(content, isStreaming);
                  
                  // Debug logging
                  console.log('Message content:', {
                    hasProductsJson: content.includes('[PRODUCTS_JSON]'),
                    hasClosingMarker: content.includes('[/PRODUCTS_JSON]'),
                    isStreaming,
                    displayType: displayContent.type,
                    contentLength: content.length
                  });

                  return (
                    <div
                      key={`${message.id || index}-${displayContent.type}`}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`lg:max-w-[80%] max-w-[95%] px-4 py-3 border-b border-foreground/20`}>
                        {/* Show tool execution indicator */}
                        {isToolActive && (
                          <div className="flex items-center space-x-2 mb-2 text-foreground">
                            <Settings className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">{toolName}</span>
                          </div>
                        )}
                        
                        {/* Show routine generation status */}
                        {displayContent.type === 'streaming' && (
                          <div className="flex items-center space-x-2 mb-2 text-blue-600 animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">Building your routine...</span>
                          </div>
                        )}
                        
                        {/* Show message content - only one type at a time */}
                        {displayContent.type === 'routine' && (
                          // Render RoutineWithProducts when content is complete - completely replace streaming text
                          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                            <RoutineWithProducts content={displayContent.content} />
                          </div>
                        )}
                        
                        {displayContent.type === 'streaming' && (
                          // Show streaming text with placeholder - only while streaming
                          <div className="space-y-2 animate-in fade-in duration-200">
                            <div className="text-sm text-gray-500 italic mb-2 flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <span>Generating personalized routine...</span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-200">
                              <p className="whitespace-pre-wrap text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: formatRoutineText(displayContent.content) }}></p>
                            </div>
                          </div>
                        )}
                        
                        {displayContent.type === 'text' && (
                          // Regular text content (not routine-related)
                          <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatRoutineText(displayContent.content) }}></p>
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
                        <span>Lavera is thinking...</span>
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
                <div className="flex-1 flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-0 lg:mb-0 mb-2"
                    // disabled={isLoading || isStreaming}
                    autoFocus
                  />
                  <Button
                    type="button"
                    onClick={() => stop()}
                    variant="outline"
                    className="px-3 py-2 lg:mb-0 mb-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    // disabled={!isStreaming}
                    title="Stop AI"
                  >
                    <StopCircle className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowImageUpload(true)}
                    variant="outline"
                    className="px-3 py-2 lg:mb-0 mb-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    disabled={isLoading || isStreaming}
                    title="Upload image for skin type analysis"
                  >
                    <Upload className="h-4 w-4 text-blue-600" />
                  </Button>
                </div>
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
                <div className="mt-4 text-center">
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

      {/* Image Upload Modal */}
      <ImageUpload
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
}