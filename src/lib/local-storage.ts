import { Conversation, ChatMessage } from "@/types/chat";

// Keys for localStorage
const CONVERSATIONS_KEY = 'ai-routine-conversations';
const UNSYNCED_CONVERSATIONS_KEY = 'ai-routine-unsynced-conversations';
const LAST_SYNC_KEY = 'ai-routine-last-sync';

/**
 * Save conversations to localStorage
 */
export const saveToLocalStorage = (conversations: Conversation[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations to localStorage:', error);
  }
};

/**
 * Get conversations from localStorage
 */
export const getFromLocalStorage = (): Conversation[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CONVERSATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting conversations from localStorage:', error);
    return [];
  }
};

/**
 * Save a single conversation to localStorage
 */
export const saveConversationToLocalStorage = (conversation: Conversation) => {
  if (typeof window === 'undefined') return;
  try {
    const conversations = getFromLocalStorage();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }
    
    saveToLocalStorage(conversations);
    markConversationForSync(conversation.id as string);
  } catch (error) {
    console.error('Error saving conversation to localStorage:', error);
  }
};

/**
 * Get a single conversation from localStorage by ID
 */
export const getConversationFromLocalStorage = (id: string): Conversation | null => {
  if (typeof window === 'undefined') return null;
  try {
    const conversations = getFromLocalStorage();
    return conversations.find(c => c.id === id) || null;
  } catch (error) {
    console.error('Error getting conversation from localStorage:', error);
    return null;
  }
};

/**
 * Delete a conversation from localStorage
 */
export const deleteConversationFromLocalStorage = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    const conversations = getFromLocalStorage();
    const filteredConversations = conversations.filter(c => c.id !== id);
    saveToLocalStorage(filteredConversations);
    
    // Also remove from unsynced list if it was there
    const unsynced = getUnsyncedConversations();
    if (unsynced.includes(id)) {
      const filteredUnsynced = unsynced.filter(cid => cid !== id);
      saveUnsyncedConversations(filteredUnsynced);
    }
  } catch (error) {
    console.error('Error deleting conversation from localStorage:', error);
  }
};

/**
 * Mark a conversation as needing sync with the server
 */
export const markConversationForSync = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    const unsynced = getUnsyncedConversations();
    if (!unsynced.includes(id)) {
      unsynced.push(id);
      saveUnsyncedConversations(unsynced);
    }
  } catch (error) {
    console.error('Error marking conversation for sync:', error);
  }
};

/**
 * Get list of conversation IDs that need to be synced with the server
 */
export const getUnsyncedConversations = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(UNSYNCED_CONVERSATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting unsynced conversations:', error);
    return [];
  }
};

/**
 * Save list of unsynced conversation IDs
 */
export const saveUnsyncedConversations = (ids: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(UNSYNCED_CONVERSATIONS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('Error saving unsynced conversations:', error);
  }
};

/**
 * Clear a conversation from the unsynced list (after successful sync)
 */
export const clearConversationFromUnsyncedList = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    const unsynced = getUnsyncedConversations();
    const filteredUnsynced = unsynced.filter(cid => cid !== id);
    saveUnsyncedConversations(filteredUnsynced);
  } catch (error) {
    console.error('Error clearing conversation from unsynced list:', error);
  }
};

/**
 * Save timestamp of last sync
 */
export const saveLastSyncTimestamp = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving last sync timestamp:', error);
  }
};

/**
 * Get timestamp of last sync
 */
export const getLastSyncTimestamp = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const timestamp = localStorage.getItem(LAST_SYNC_KEY);
    return timestamp ? parseInt(timestamp, 10) : 0;
  } catch (error) {
    console.error('Error getting last sync timestamp:', error);
    return 0;
  }
};

/**
 * Generate a unique ID for a new conversation
 */
export const generateLocalConversationId = (): string => {
  return `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
