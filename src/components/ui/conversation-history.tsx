"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chatStore";
import { useRouter } from "next/navigation";
import { Trash2, MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteConversation } from "@/lib/chat-helpers";
import { useAuth } from "@/context/AuthContext";
import { forceSyncConversation } from "@/lib/sync-service";

interface ConversationHistoryProps {
  onNewChat: () => void;
}

export function ConversationHistory({ onNewChat }: ConversationHistoryProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [syncingIds, setSyncingIds] = useState<string[]>([]);
  
  // Auth context
  const { user } = useAuth();
  
  // Chat store
  const { 
    conversations, 
    setConversations, 
    currentConversation, 
    setCurrentConversation,
    removeConversation
  } = useChatStore();
  
  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      try {
        // Load from localStorage first (already done by the Sidebar component)
        // Then try to fetch from server if user is authenticated
        if (user) {
          const response = await fetch('/api/chat/conversations');
          const result = await response.json();
          
          if (result.success) {
            // Merge with local conversations
            const serverConversations = result.data;
            setConversations(serverConversations);
          }
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversations();
  }, [user, setConversations]);
  
  // Handle conversation click
  const handleConversationClick = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
      router.push(`/chat/${id}`);
    }
  };
  
  // Handle conversation delete
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    try {
      await deleteConversation(id);
      removeConversation(id);
      
      // If deleted conversation is current, go to home
      if (currentConversation?.id === id) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };
  
  // Handle force sync for a conversation
  const handleSync = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    setSyncingIds(prev => [...prev, id]);
    
    try {
      await forceSyncConversation(id);
    } catch (error) {
      console.error('Error syncing conversation:', error);
    } finally {
      setSyncingIds(prev => prev.filter(syncId => syncId !== id));
    }
  };
  
  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    
    const d = new Date(date);
    const now = new Date();
    
    // If today, show time
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (d.getFullYear() === now.getFullYear()) {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show date
    return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Sort conversations by date
  const sortedConversations = [...conversations].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });
  
  return (
    <div className="flex flex-col gap-2">
      {isLoading ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Loading conversations...
        </div>
      ) : sortedConversations.length === 0 ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          No conversations yet.
          <Button 
            variant="link" 
            className="block mx-auto" 
            onClick={onNewChat}
          >
            Start a new chat
          </Button>
        </div>
      ) : (
        <>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Recent Conversations
          </h3>
          
          {sortedConversations.map((conversation) => {
            // Create a unique key for each conversation
            const key = conversation.id || `conversation-${Math.random()}`;
            
            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col w-full text-left h-auto py-2 px-3 rounded-md hover:bg-accent/50 cursor-pointer",
                  currentConversation?.id === conversation.id && "bg-muted"
                )}
                onClick={() => handleConversationClick(conversation.id as string)}
              >
                <div className="flex items-center w-full gap-2">
                  <MessageSquare size={16} className="shrink-0" />
                  <div className="flex-1 truncate">
                    {conversation.title || "New Conversation"}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Show sync button for local conversations */}
                    {conversation.id?.startsWith('local-') && user && (
                      <button
                        className="h-6 w-6 shrink-0 rounded-full hover:bg-background/80 flex items-center justify-center"
                        onClick={(e) => handleSync(e, conversation.id as string)}
                        disabled={syncingIds.includes(conversation.id as string)}
                      >
                        <Clock size={14} className={cn(
                          syncingIds.includes(conversation.id as string) && "animate-spin"
                        )} />
                      </button>
                    )}
                    
                    <button
                      className="h-6 w-6 shrink-0 rounded-full hover:bg-background/80 flex items-center justify-center"
                      onClick={(e) => handleDelete(e, conversation.id as string)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Show date and local indicator */}
                <div className="flex items-center justify-between w-full mt-1 text-xs text-muted-foreground">
                  <span>
                    {formatDate(conversation.updatedAt)}
                  </span>
                  {conversation.id?.startsWith('local-') && (
                    <span className="text-amber-500">
                      Local
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}