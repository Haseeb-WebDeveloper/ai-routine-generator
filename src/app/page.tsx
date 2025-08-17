"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  XCircle,
  Settings,
  Loader2,
  MessageSquare,
  LogIn,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import { ProductDisplay, Product } from "@/components/ProductDisplay";
import { useChatStore } from "@/store/chatStore";
import {
  convertAiMessagesToChat,
  saveConversation,
  createNewConversation,
} from "@/lib/chat-helpers";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
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

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auth context
  const { user, isLoading: authLoading } = useAuth();
  
  // Chat store state
  const { setCurrentConversation } = useChatStore();

  // Create a new conversation and redirect
  const createConversationAndRedirect = async (initialMessage: string) => {
    try {
      setIsLoading(true);

      // Create a new conversation
      const newConversation = createNewConversation(initialMessage);

      // For authenticated users, save to server
      if (user) {
        const savedConversation = await saveConversation(newConversation);
        setCurrentConversation(savedConversation);

        // Redirect to the new conversation
        if (savedConversation.id) {
          router.push(`/chat/${savedConversation.id}`);
          return;
        }
      } else {
        // For non-authenticated users, just set the conversation in store without saving
        // and generate a temporary ID
        const tempId = `temp-${Date.now()}`;
        const tempConversation = {
          ...newConversation,
          id: tempId,
        };
        setCurrentConversation(tempConversation);
        router.push(`/chat/${tempId}`);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await createConversationAndRedirect(input);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await createConversationAndRedirect(suggestion);
  };

  // On form click focus input
  const handleFormClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="h-full relative px-4">
      {!user && !authLoading && (
        <div className="flex justify-end gap-2 py-4">
          <Link href="/signin">
            <Button variant="outline" className="flex items-center gap-2">
              <LogIn size={16} />
              <span>Sign In</span>
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="flex items-center gap-2">
              <UserPlus size={16} />
              <span>Sign Up</span>
            </Button>
          </Link>
        </div>
      )}
      <div className="max-w-4xl relative w-full mx-auto h-full">
        <div className="pt-8 pb-36">
          <div>
            {/* Empty Chat Area with Suggestions */}
            <Conversation className="mb-6">
              <ConversationContent>
                <div className="flex flex-col items-center justify-center min-h-[300px] gap-6 py-12">
                  <div className="flex flex-col items-center gap-3">
                    <h2 className="text-2xl font-semibold">
                      Start a new conversation
                    </h2>
                    {!user && !authLoading && (
                      <p className="text-sm text-amber-600 mt-2">
                        Note: Your conversation will not be saved. Sign in to save your chats.
                      </p>
                    )}
                  </div>

                  {/* Suggestion Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-start gap-1 text-left"
                      onClick={() =>
                        handleSuggestionClick(
                          "Create a skincare routine for me."
                        )
                      }
                    >
                      <span className="font-medium">
                        Create a skincare routine
                      </span>
                      <span className="text-sm text-muted-foreground text-wrap">
                        Get a personalized routine based on your skin type
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-start gap-1 text-left"
                      onClick={() =>
                        handleSuggestionClick(
                          "What products are good for acne-prone skin?"
                        )
                      }
                    >
                      <span className="font-medium">
                        Product recommendations
                      </span>
                      <span className="text-sm text-muted-foreground text-wrap">
                        Find products for your skin concerns
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-start gap-1 text-left"
                      onClick={() =>
                        handleSuggestionClick(
                          "How do I layer skincare products?"
                        )
                      }
                    >
                      <span className="font-medium">Skincare tips</span>
                      <span className="text-sm text-muted-foreground text-wrap">
                        Learn how to use products effectively
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-start gap-1 text-left"
                      onClick={() =>
                        handleSuggestionClick(
                          "What ingredients should I avoid for sensitive skin?"
                        )
                      }
                    >
                      <span className="font-medium">Ingredient advice</span>
                      <span className="text-sm text-muted-foreground text-wrap">
                        Understand what works for your skin
                      </span>
                    </Button>
                  </div>
                </div>

                <div ref={chatEndRef} />
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>
        </div>
        <div className="sticky bottom-2 w-full max-w-4xl mx-auto flex justify-center items-center px-4 bg-background">
          {/* Input Form */}
          <PromptInput
            className="w-full p-4"
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
                <PromptInputSubmit
                  disabled={!input.trim() || isLoading}
                  className="cursor-pointer disabled:cursor-not-allowed aspect-square h-10 p-2.5 shadow-none w-fit bg-primary transition-colors"
                >
                  {isLoading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Image
                      src="/icon/up-arrow.svg"
                      alt="Send"
                      className="h-full w-full"
                      width={100}
                      height={100}
                    />
                  )}
                </PromptInputSubmit>
              </div>
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}