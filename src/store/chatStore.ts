import { create } from 'zustand';
import { Conversation, ChatMessage } from '@/types/chat';
import { 
  getFromLocalStorage, 
  saveToLocalStorage, 
  saveConversationToLocalStorage,
  getConversationFromLocalStorage,
  deleteConversationFromLocalStorage
} from '@/lib/local-storage';

interface ChatStoreState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
}

interface ChatStoreActions {
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  removeConversation: (id: string) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  loadConversationsFromLocalStorage: () => void;
}

export const useChatStore = create<ChatStoreState & ChatStoreActions>((set, get) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,
  
  setConversations: (conversations) => {
    set({ conversations });
    saveToLocalStorage(conversations);
  },
  
  addConversation: (conversation) => {
    const { conversations } = get();
    const updatedConversations = [...conversations];
    
    // Check if conversation already exists
    const existingIndex = updatedConversations.findIndex(c => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      // Update existing conversation
      updatedConversations[existingIndex] = conversation;
    } else {
      // Add new conversation
      updatedConversations.push(conversation);
    }
    
    set({ conversations: updatedConversations });
    saveToLocalStorage(updatedConversations);
  },
  
  removeConversation: (id) => {
    const { conversations, currentConversation } = get();
    const updatedConversations = conversations.filter(c => c.id !== id);
    
    // If current conversation is being removed, set it to null
    let updatedCurrentConversation = currentConversation;
    if (currentConversation && currentConversation.id === id) {
      updatedCurrentConversation = null;
    }
    
    set({ 
      conversations: updatedConversations,
      currentConversation: updatedCurrentConversation
    });
    
    saveToLocalStorage(updatedConversations);
    deleteConversationFromLocalStorage(id);
  },
  
  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
    
    // If conversation is not null, add it to the list if it doesn't exist
    if (conversation) {
      const { conversations } = get();
      const exists = conversations.some(c => c.id === conversation.id);
      
      if (!exists) {
        const updatedConversations = [...conversations, conversation];
        set({ conversations: updatedConversations });
        saveToLocalStorage(updatedConversations);
      }
      
      // Save to localStorage
      saveConversationToLocalStorage(conversation);
    }
  },
  
  addMessage: (message) => {
    const { currentConversation } = get();
    
    if (!currentConversation) return;
    
    const updatedConversation = {
      ...currentConversation,
      messages: [...(currentConversation.messages || []), message],
      updatedAt: new Date()
    };
    
    set({ currentConversation: updatedConversation });
    
    // Update in conversations list
    const { conversations } = get();
    const updatedConversations = conversations.map(c => 
      c.id === updatedConversation.id ? updatedConversation : c
    );
    
    set({ conversations: updatedConversations });
    
    // Save to localStorage
    saveConversationToLocalStorage(updatedConversation);
  },
  
  updateMessages: (messages) => {
    const { currentConversation } = get();
    
    if (!currentConversation) return;
    
    const updatedConversation = {
      ...currentConversation,
      messages,
      updatedAt: new Date()
    };
    
    set({ currentConversation: updatedConversation });
    
    // Update in conversations list
    const { conversations } = get();
    const updatedConversations = conversations.map(c => 
      c.id === updatedConversation.id ? updatedConversation : c
    );
    
    set({ conversations: updatedConversations });
    
    // Save to localStorage
    saveConversationToLocalStorage(updatedConversation);
  },
  
  clearMessages: () => {
    const { currentConversation } = get();
    
    if (!currentConversation) return;
    
    const updatedConversation = {
      ...currentConversation,
      messages: [],
      updatedAt: new Date()
    };
    
    set({ currentConversation: updatedConversation });
    
    // Update in conversations list
    const { conversations } = get();
    const updatedConversations = conversations.map(c => 
      c.id === updatedConversation.id ? updatedConversation : c
    );
    
    set({ conversations: updatedConversations });
    
    // Save to localStorage
    saveConversationToLocalStorage(updatedConversation);
  },
  
  loadConversationsFromLocalStorage: () => {
    const localConversations = getFromLocalStorage();
    set({ conversations: localConversations });
  }
}));