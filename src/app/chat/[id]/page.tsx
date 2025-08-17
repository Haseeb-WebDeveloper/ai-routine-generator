"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, Settings, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import { ProductDisplay, Product } from "@/components/ProductDisplay";
import { useChatStore } from "@/store/chatStore";
import { convertAiMessagesToChat, saveConversation, createNewConversation, fetchConversation } from "@/lib/chat-helpers";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
import { Loader } from "@/components/ai-elements/loader";
import { Response } from "@/components/ai-elements/response";
import { getToolDisplayName } from "@/lib/get-tool-name";
import Link from "next/link";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const [messagesSaved, setMessagesSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const START_PROMPT = "Hi! I'm ready to start.";
  
  // Auth context
  const { user, isLoading: authLoading } = useAuth();
  
  // Chat store state
  const { 
    currentConversation, 
    setCurrentConversation, 
    addMessage, 
    updateMessages,
    setConversations
  } = useChatStore();

  const isLocal = process.env.NODE_ENV === "development";
  const isTempConversation = typeof id === 'string' && (id.startsWith('temp-') || id.startsWith('local-'));

  // Load conversation when ID changes
  useEffect(() => {
    const loadConversation = async () => {
      if (!id) return;
      
      try {
        setIsLoadingConversation(true);
        
        // For local IDs, try to get from localStorage first
        if (id.toString().startsWith('local-')) {
          // This will be handled by the chat store
          return;
        }
        
        // For server IDs, fetch from API
        if (user && !id.toString().startsWith('temp-')) {
          const conversation = await fetchConversation(id as string);
          setCurrentConversation(conversation);
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
        toast.error("Conversation not found");
        router.push('/');
      } finally {
        setIsLoadingConversation(false);
      }
    };
    
    // Only load if we don't already have the conversation loaded
    if (!currentConversation || currentConversation.id !== id) {
      loadConversation();
    }
  }, [id, user, setCurrentConversation, router, currentConversation]);

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
          "[ChatPage] Found products in message:",
          part.output.products
        );
        setProducts(part.output.products);
        break;
      }
    }
  }, [messages]);

  // On mount, load conversation messages or send initial message
  useEffect(() => {
    // Skip if we've already sent the initial message
    if (initialMessageSent || messages.length > 0) return;
    
    // If we have a current conversation with messages, use those
    if (currentConversation && currentConversation.messages && currentConversation.messages.length > 0) {
      // Only send the first user message to start the conversation
      const firstUserMessage = currentConversation.messages.find(msg => msg.role === "user");
      if (firstUserMessage && currentConversation) {
        setInitialMessageSent(true);
        sendMessage({
          role: "user",
          parts: [{ text: firstUserMessage.content, type: "text" }],
        }).catch((err) => {
          console.error("Error sending initial message:", err);
          setInitialMessageSent(false);
        });
      }
      return;
    }
    
    // If no conversation and no ID, redirect to homepage
    if (!id) {
      router.push('/');
    }
  }, [currentConversation, messages.length, sendMessage, id, router, initialMessageSent]);

  // Debounced save function to prevent too many API calls
  const debouncedSave = useCallback((conversation: any) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      // Don't save for anonymous users with temp IDs
      if (!user && !conversation.id?.startsWith('local-')) {
        setIsSaving(false);
        return;
      }
      
      try {
        const savedConversation = await saveConversation(conversation);
        
        // If this is a new conversation, update the ID
        if (conversation && !conversation.id && savedConversation.id) {
          setCurrentConversation(savedConversation);
        }
        
        setMessagesSaved(true);
      } catch (error) {
        console.error("Error saving conversation:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce
  }, [user, setCurrentConversation]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Save messages to localStorage/server when they change
  useEffect(() => {
    // Only save if we have messages and a current conversation
    if (messages.length === 0 || !currentConversation || isLoadingConversation) return;
    
    // Don't save if we just loaded the conversation and haven't made changes
    if (messagesSaved && status !== 'streaming') return;
    
    // Convert AI SDK messages to our format
    const chatMessages = convertAiMessagesToChat(messages);
    
    // Only save if the messages have actually changed
    const existingMessages = currentConversation.messages || [];
    if (existingMessages.length === chatMessages.length && 
        status !== 'streaming' &&
        JSON.stringify(existingMessages) === JSON.stringify(chatMessages)) {
      return;
    }
    
    setIsSaving(true);
    
    // Update the current conversation with new messages
    const updatedConversation = {
      ...currentConversation,
      messages: chatMessages,
      updatedAt: new Date()
    };
    
    // Update the messages in the store
    updateMessages(chatMessages);
    
    // Debounce the save operation
    debouncedSave(updatedConversation);
  }, [
    messages, 
    currentConversation, 
    isLoadingConversation, 
    updateMessages, 
    debouncedSave, 
    messagesSaved,
    status
  ]);

  // Cleanup function to cancel any pending timeouts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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
      inputRef.current?.focus();
      setMessagesSaved(false);
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const resetChat = () => {
    // Clear any pending save operations
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setMessages([]);
    setProducts([]); // Clear products
    setCurrentConversation(null); // Clear current conversation
    setHasSentInitial(false); // Allow initial AI message to be sent again
    setInitialMessageSent(false); // Reset initial message flag
    setMessagesSaved(false); // Reset messages saved flag
    toast.success("Chat cleared!");
    router.push('/');
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

  // On form click focus input
  const handleFormClick = () => {
    inputRef.current?.focus();
  };

  // Show loading state while fetching conversation
  if (isLoadingConversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-lg">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full px-4">
      {!user && !authLoading && (
        <div className="bg-amber-50 border-amber-200 border rounded-md p-3 mb-4 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Your conversation will not be saved. <Link href="/signin" className="text-amber-700 hover:underline font-medium">Sign in</Link> to save your chats.</span>
          </div>
          <div className="flex gap-2">
            <Link href="/signin">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="relative max-w-4xl w-full mx-auto h-full ">
        <div className="pt-4 pb-36">
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
                  const toolName = getToolDisplayName(message);

                  return (
                    <div
                      key={message.id || index}
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
                        {isToolActive && (
                          <div className="flex items-center gap-2 mb-2 text-foreground">
                            <Settings className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">
                              {toolName}
                            </span>
                          </div>
                        )}

                        {/* Show message content */}
                        {content && (
                          <Response className="whitespace-pre-wrap">
                            {content}
                          </Response>
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
                        <Loader size={16} />
                        <span>Lavera is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

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
        <div className="sticky bottom-2 w-full max-w-4xl mx-auto flex justify-center items-center px-4">
          {/* Input Form */}
          <PromptInput
            className="w-full p-4 bg-background"
            onSubmit={handleFormSubmit}
            onClick={handleFormClick}
          >
            <PromptInputTextarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              minHeight={24}
              maxHeight={164}
              autoFocus
              className="p-0 h-fit"
            />
            <PromptInputToolbar>
              <div className="flex items-center justify-end gap-2 w-full">
                {messages.length > 0 && (
                  <Button
                    onClick={resetChat}
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
      
      {/* Loading indicator */}
      {isSaving && user && (
        <div className="fixed bottom-20 right-4 bg-primary/10 text-primary px-3 py-1 rounded-md text-sm flex items-center gap-1">
          <Loader2 size={14} className="animate-spin" />
          <span>Saving...</span>
        </div>
      )}
    </div>
  );
}