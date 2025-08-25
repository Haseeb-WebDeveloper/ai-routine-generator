"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "@ai-sdk/react";
import Navbar from "@/components/Navbar";
import { getToolDisplayName, getToolTextLoop } from "@/lib/get-tool-name";
import Image from "next/image";
import { ProductDisplay, Product } from "@/components/ProductDisplay";
import { TextLoop } from "@/components/ui/text-loop";

// Import AI Elements
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
// import { Tool, ToolHeader, ToolContent } from "@/components/ai-elements/tool";
// import { Loader } from "@/components/ai-elements/loader";
import { Response } from "@/components/ai-elements/response";
import { extractMessageContent } from "@/utils/extract-messages-content";
import {
  getQuizSuggestions,
  extractQuestionNumber,
  QuizSuggestion,
} from "@/lib/quiz-suggestions";
import { TextShimmer } from "@/components/ui/shimer";

export default function QuizPage() {
  const [input, setInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [messageSuggestions, setMessageSuggestions] = useState<Map<string, QuizSuggestion[]>>(new Map());
  const [respondedMessages, setRespondedMessages] = useState<Set<string>>(new Set()); // Track messages user has responded to
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const initialMessageSentRef = useRef(false); // Use ref to prevent duplicate sends
  const START_PROMPT = "Hi! I'm ready to start.";

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

  // Extract products and suggestions from messages
  useEffect(() => {
    // Find the most recent assistant message
    const assistantMessages = messages.filter(
      (msg) => msg.role === "assistant"
    );
    if (assistantMessages.length === 0) {
      return;
    }

    const lastMessage = assistantMessages[assistantMessages.length - 1];

    // Check if this message has parts
    if (!Array.isArray(lastMessage.parts)) {
      return;
    }

    // Extract content to check for question numbers
    const content = extractMessageContent(lastMessage);
    if (content) {
      const questionNumber = extractQuestionNumber(content);

      if (questionNumber && questionNumber >= 1 && questionNumber <= 8) {
        // Only show suggestions if user hasn't responded to this message yet
        if (!respondedMessages.has(lastMessage.id)) {
          const suggestions = getQuizSuggestions(questionNumber);
          // Clear all previous suggestions and only show suggestions for this current question
          setMessageSuggestions(new Map([[lastMessage.id, suggestions]]));
        } else {
          // User has already responded to this message, don't show suggestions
          setMessageSuggestions(new Map());
        }
      } else {
        // Clear all suggestions if no valid question number
        setMessageSuggestions(new Map());
      }
    }

    // Look for tool output with products
    for (const part of lastMessage.parts as any[]) {
      // Check for both possible tool name formats
      if (part.type?.includes("plan") && part.type?.includes("send")) {
        if (part.state === "output-available" && part.output) {
          if (Array.isArray(part.output.products)) {
            setProducts(part.output.products);
            break;
          }
        }
      }
    }
  }, [messages]);

  // On mount, send a start message as user (hidden later), conditional on verification status
  useEffect(() => {
    // Use ref to ensure this only runs once
    if (!hasSentInitial && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true; // Mark as sent immediately
      setHasSentInitial(true);

      const cookieEmail = getCookie("quiz_email");
      const cookieName = getCookie("quiz_name");
      const cookieVerified = getCookie("quiz_verified");

      let initialText = START_PROMPT;

      // Only include user info if they are verified
      if (cookieVerified === "1" && cookieEmail && cookieName) {
        initialText = `${START_PROMPT} (User name: ${cookieName}) (User email: ${cookieEmail})`;
      }

      sendMessage({
        role: "user",
        parts: [{ text: initialText, type: "text" }],
      })
        .then(() => {
          // Initial message sent successfully
        })
        .catch((err) => {
          // Reset the ref if there was an error so it can try again
          initialMessageSentRef.current = false;
          setHasSentInitial(false);
        });
    }
  }, []); // Empty dependency array - only run once on mount

  // Auto-scroll to bottom for user messages and when suggestions change
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        // Use setTimeout to ensure DOM is updated before scrolling
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [messages]);

  // Also scroll when suggestions change to accommodate UI changes
  useEffect(() => {
    // Small delay to ensure DOM updates are complete
    setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  }, [messageSuggestions]);

  // Only show loading indicator when status is "submitted" (waiting for AI to start streaming)
  const isWaitingForAI = status === "submitted";
  // Show streaming state (AI is responding, so don't show loading indicator)
  const isStreaming = status === "streaming";

  // Remove debug products state effect
  // useEffect(() => {
  //   console.log("[QuizPage] Products state updated:", products);
  // }, [products]);


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isWaitingForAI || isStreaming) return;

    try {
      // Mark the last assistant message as responded to and clear suggestions
      const assistantMessages = messages.filter((msg) => msg.role === "assistant");
      if (assistantMessages.length > 0) {
        const lastAssistantMessageId = assistantMessages[assistantMessages.length - 1].id;
        // Mark this message as responded to
        setRespondedMessages(prev => new Set([...prev, lastAssistantMessageId]));
        // Immediately clear suggestions from UI
        setMessageSuggestions(new Map());
      }

      setInput("");
      await sendMessage({
        role: "user",
        parts: [{ text: input, type: "text" }],
      });
      inputRef.current?.focus();
    } catch (err) {
      // Only show user-facing error
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleSuggestionClick = async (suggestion: QuizSuggestion, messageId: string) => {
    if (isWaitingForAI || isStreaming) return;

    try {
      // Mark this message as responded to and clear suggestions
      setRespondedMessages(prev => new Set([...prev, messageId]));
      setMessageSuggestions(new Map());
      
      await sendMessage({
        role: "user",
        parts: [{ text: suggestion.value, type: "text" }],
      });
      inputRef.current?.focus();
    } catch (err) {
      // Only show user-facing error
      toast.error("Failed to send suggestion. Please try again.");
    }
  };

  const resetQuiz = () => {
    setMessages([]);
    setProducts([]); // Clear products
    setMessageSuggestions(new Map()); // Clear all message suggestions
    setRespondedMessages(new Set()); // Clear responded messages tracking
    toast.success("Chat cleared!");
    setHasSentInitial(false); // Allow initial AI message to be sent again
    initialMessageSentRef.current = false; // Reset the ref as well
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
        <div className=" pt-8 pb-36">
          <div>
            {/* Chat Messages */}
            <Conversation className="mb-6">
              <ConversationContent>
                {messages.map((message: any, index: any) => {
                  // Hide only the initial start message (even if it includes USER_EMAIL)
                  const shouldHideMessage =
                    message.role === "user" &&
                    message.parts &&
                    message.parts.length > 0 &&
                    String(message.parts[0].text || "").startsWith(
                      START_PROMPT
                    );

                  if (shouldHideMessage) return null;

                  const content = extractMessageContent(message);
                  const isToolActive = hasActiveTool(message);
                  const messageSuggestionsList = messageSuggestions.get(message.id) || [];

                  // Check if this is the last assistant message and products are available
                  const assistantMessages = messages.filter(
                    (m) => m.role === "assistant"
                  );
                  const lastAssistantMessageId =
                    assistantMessages.length > 0
                      ? assistantMessages[assistantMessages.length - 1].id
                      : null;
                  const isLastAssistantMessage =
                    message.role === "assistant" &&
                    message.id === lastAssistantMessageId;

                  // Remove debug info

                  return (
                    <React.Fragment key={message.id || index}>
                      <div
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        } mb-4`}
                      >
                        <div
                          className={`lg:max-w-[80%] max-w-[95%] py-3 border-b border-foreground/20`}
                        >
                          {/* Show tool execution indicator */}
                          {/* {isToolActive && (
                            <div className="flex items-center gap-2 mb-2 text-foreground">
                              <Settings className="h-4 w-4 animate-spin" />
                              <span className="text-sm font-medium">
                                <TextLoop
                                  interval={50}
                                  className="text-sm font-medium"
                                >
                                  {getToolTextLoop(message).map((text, index) => (
                                    <span key={index}>{text}</span>
                                  ))}
                                </TextLoop>
                              </span>
                            </div>
                          )} */}

                          {/* Show tool execution indicator */}
                          {isToolActive && (
                            <TextShimmer>
                              {getToolDisplayName(message)}
                            </TextShimmer>
                          )}

                          {/* Show message content with conditional scroll behavior */}
                          {content && (
                            <div>
                              <Response className="whitespace-pre-wrap">
                                {content}
                              </Response>
                            </div>
                          )}

                          {/* Show suggestions right under the AI message */}
                          {message.role === "assistant" && messageSuggestionsList.length > 0 && (
                            <div className="mt-2 pt-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {messageSuggestionsList.map((suggestion, suggestionIndex) => (
                                  <Button
                                    key={suggestionIndex}
                                    onClick={() => handleSuggestionClick(suggestion, message.id)}
                                    disabled={isWaitingForAI || isStreaming}
                                    className="rounded-md px-3 py-1 bg-background border border-foreground/20 shadow-none text-sm text-foreground/70 hover:bg-foreground/5 hover:text-foreground hover:border-foreground/30 transition-all duration-200"
                                  >
                                    {suggestion.text}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Show products immediately after the last assistant message */}
                      {(() => {
                        const shouldShowProducts = isLastAssistantMessage && products.length > 0;
                        return shouldShowProducts;
                      })() && (
                        <ProductDisplay products={products} />
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Show loading indicator only while waiting for AI to start streaming */}
                {isWaitingForAI && (
                  <div className="flex justify-start">
                    <div className="rounded-lg py-3">
                      <TextShimmer>Lavera is thinking...</TextShimmer>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

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
        <div className="fixed lg:bottom-2 bottom-4 left-1/2 -translate-x-1/2 w-full mx-auto flex justify-center items-center bg-background">
          {/* Input Form */}
          <div className="max-w-4xl w-full flex justify-center items-center  lg:px-6 px-4">
            <PromptInput
              className="w-full p-2"
              onSubmit={handleFormSubmit}
              onClick={handleFormClick}
            >
              <PromptInputTextarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                minHeight={48}
                maxHeight={164}
                autoFocus
                className="p-1.5 h-fit "
              />
              <PromptInputToolbar>
                <div className="flex items-center justify-end gap-2 w-full">
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
                  {isWaitingForAI ? (
                    <Button
                      type="button"
                      onClick={stop}
                      className="cursor-pointer disabled:cursor-not-allowed aspect-square h-10 p-2.5 shadow-none w-fit bg-background border border-foreground/20 transition-colors"
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
                    <PromptInputSubmit
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
                    </PromptInputSubmit>
                  )}
                </div>
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>
      </div>

      {/* Top shadow effect */}
      <div className="fixed max-w-4xl mx-auto top-0 left-1/2 -translate-x-1/2 w-full h-16 bg-gradient-to-b from-white to-transparent"></div>
    </div>
  );
}
