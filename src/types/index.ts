export interface AgentMessage {
  message: string;
  session_id: string;
}

export interface AgentResponse {
  response: string;
  session_id: string;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Session {
  id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    chunk_index: number;
  };
  embedding?: number[];
}

export interface Plugin {
  name: string;
  description: string;
  execute: (input: string) => Promise<string>;
  keywords: string[];
}

export interface PluginResult {
  plugin_name: string;
  result: string;
  executed: boolean;
}