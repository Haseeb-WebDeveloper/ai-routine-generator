"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { fetchConversation } from "@/lib/chat-helpers";
import { useParams } from "next/navigation";

export default function ChatPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams();
  const { setCurrentConversation } = useChatStore();
  
  // Load the conversation when the ID changes
  useEffect(() => {
    const loadConversation = async () => {
      if (!id) return;
      
      try {
        const conversation = await fetchConversation(id as string);
        setCurrentConversation(conversation);
      } catch (error) {
        console.error("Error loading conversation:", error);
      }
    };
    
    loadConversation();
  }, [id, setCurrentConversation]);
  
  return (
    <div className="h-full">
      {children}
    </div>
  );
}