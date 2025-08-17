// Chat message types
export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  metadata?: any; // For storing structured data like tool calls, products, etc.
  parts?: MessagePart[];
}

export interface MessagePart {
  type: string;
  text?: string;
  state?: string;
  output?: any;
}

// Conversation types
export interface Conversation {
  id?: string;
  userEmail?: string;
  title?: string;
  messages: ChatMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

// API response types
export interface ConversationResponse {
  success: boolean;
  data?: Conversation;
  error?: string;
}

export interface ConversationsListResponse {
  success: boolean;
  data?: Conversation[];
  error?: string;
}
