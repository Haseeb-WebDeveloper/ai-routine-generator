import { Conversation, ChatMessage } from "@/types/chat";
import { useChatStore } from "@/store/chatStore";
import { 
  saveConversationToLocalStorage, 
  getConversationFromLocalStorage,
  generateLocalConversationId,
  markConversationForSync
} from "./local-storage";

/**
 * Saves a conversation to the server
 */
export async function saveConversation(conversation: Conversation): Promise<Conversation> {
  try {
    // Always save to localStorage first
    saveConversationToLocalStorage(conversation);
    
    // If conversation has an ID that's not local, update it on server
    if (conversation.id && !conversation.id.startsWith('local-')) {
      const url = `/api/chat/conversations/${conversation.id}`;
      const method = 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversation),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error saving conversation to server:', result.error);
        // Still return the conversation since it's saved locally
        return conversation;
      }
      
      return result.data;
    } else if (!conversation.id) {
      // New conversation with no ID yet, create a local ID
      const localConversation = {
        ...conversation,
        id: generateLocalConversationId(),
      };
      
      // Save to localStorage with the new ID
      saveConversationToLocalStorage(localConversation);
      
      return localConversation;
    }
    
    return conversation;
  } catch (error: any) {
    console.error('Error saving conversation:', error);
    
    // If server save fails, ensure it's saved locally with a local ID
    if (!conversation.id) {
      const localConversation = {
        ...conversation,
        id: generateLocalConversationId(),
      };
      saveConversationToLocalStorage(localConversation);
      return localConversation;
    }
    
    // Return original conversation since it's already saved locally
    return conversation;
  }
}

/**
 * Fetches all conversations for the current user
 */
export async function fetchConversations(): Promise<Conversation[]> {
  try {
    // Try to get from server first
    const response = await fetch('/api/chat/conversations');
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch conversations');
    }
    
    // Merge with local conversations
    const serverConversations = result.data;
    const localConversations = getLocalConversations();
    
    // Filter out local conversations that have been synced to the server
    const uniqueLocalConversations = localConversations.filter(
      local => !serverConversations.some(server => server.id === local.id)
    );
    
    return [...serverConversations, ...uniqueLocalConversations];
  } catch (error: any) {
    console.error('Error fetching conversations from server:', error);
    
    // Fall back to local conversations if server fetch fails
    return getLocalConversations();
  }
}

/**
 * Get conversations from localStorage
 */
function getLocalConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem('ai-routine-conversations');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting local conversations:', error);
    return [];
  }
}

/**
 * Fetches a specific conversation by ID
 */
export async function fetchConversation(id: string): Promise<Conversation> {
  // If it's a local ID, get from localStorage
  if (id.startsWith('local-')) {
    const localConversation = getConversationFromLocalStorage(id);
    if (localConversation) {
      return localConversation;
    }
    throw new Error('Local conversation not found');
  }
  
  // Otherwise try to get from server
  try {
    const response = await fetch(`/api/chat/conversations/${id}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch conversation');
    }
    
    // Save to localStorage for offline access
    saveConversationToLocalStorage(result.data);
    
    return result.data;
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    
    // Try to get from localStorage as fallback
    const localConversation = getConversationFromLocalStorage(id);
    if (localConversation) {
      return localConversation;
    }
    
    throw error;
  }
}

/**
 * Adds a message to a conversation
 */
export async function addMessageToConversation(
  conversationId: string,
  message: ChatMessage
): Promise<ChatMessage> {
  try {
    // Get current conversation
    let conversation;
    
    if (conversationId.startsWith('local-')) {
      conversation = getConversationFromLocalStorage(conversationId);
    } else {
      try {
        conversation = await fetchConversation(conversationId);
      } catch (error) {
        console.error('Error fetching conversation for adding message:', error);
        conversation = getConversationFromLocalStorage(conversationId);
      }
    }
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Add message to conversation
    const updatedConversation = {
      ...conversation,
      messages: [...(conversation.messages || []), message],
      updatedAt: new Date()
    };
    
    // Save updated conversation locally
    saveConversationToLocalStorage(updatedConversation);
    markConversationForSync(conversationId);
    
    // If it's a server conversation, try to add message on server
    if (!conversationId.startsWith('local-')) {
      try {
        const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
        
        const result = await response.json();
        
        if (!result.success) {
          console.error('Error adding message on server:', result.error);
        }
      } catch (error) {
        console.error('Error adding message on server:', error);
        // Continue with local message
      }
    }
    
    return message;
  } catch (error: any) {
    console.error('Error adding message:', error);
    throw error;
  }
}

/**
 * Deletes a conversation
 */
export async function deleteConversation(id: string): Promise<void> {
  try {
    // Delete from localStorage first
    if (typeof window !== 'undefined') {
      const conversations = getLocalConversations();
      const filteredConversations = conversations.filter(c => c.id !== id);
      localStorage.setItem('ai-routine-conversations', JSON.stringify(filteredConversations));
    }
    
    // If it's not a local ID, delete from server too
    if (!id.startsWith('local-')) {
      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error deleting conversation from server:', result.error);
      }
    }
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

/**
 * Converts AI SDK messages to our ChatMessage format
 */
export function convertAiMessagesToChat(messages: any[]): ChatMessage[] {
  return messages.map(message => ({
    role: message.role,
    content: message.content || extractMessageContent(message),
    parts: message.parts,
    metadata: {
      // Store any additional metadata here
      hasToolCalls: hasActiveTool(message),
      toolName: getToolName(message),
    }
  }));
}

/**
 * Helper function to extract content from message parts
 */
export function extractMessageContent(message: any): string {
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
}

/**
 * Helper function to check if message contains active tools
 */
export function hasActiveTool(message: any): boolean {
  if (Array.isArray(message.parts)) {
    return message.parts.some(
      (part: any) =>
        part.type?.startsWith("tool-") && part.state !== "output-available"
    );
  }
  return false;
}

/**
 * Helper function to get tool name from message
 */
export function getToolName(message: any): string {
  if (Array.isArray(message.parts)) {
    for (const part of message.parts) {
      if (part.type?.startsWith("tool-")) {
        const toolName = part.type.replace("tool-", "");
        return toolName;
      }
    }
  }
  return "";
}

/**
 * Creates a new conversation with initial message
 */
export function createNewConversation(initialMessage: string): Conversation {
  const id = generateLocalConversationId();
  
  const conversation = {
    id,
    title: "New Conversation",
    messages: [
      {
        role: "user",
        content: initialMessage,
        parts: [{ type: "text", text: initialMessage }],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Save to localStorage immediately
  saveConversationToLocalStorage(conversation);
  
  return conversation;
}

/**
 * Generates a title for a conversation based on its first message
 */
export function generateConversationTitle(message: string): string {
  // Limit to first 30 characters
  const maxLength = 30;
  let title = message.trim();
  
  if (title.length > maxLength) {
    title = title.substring(0, maxLength) + "...";
  }
  
  return title || "New Conversation";
}