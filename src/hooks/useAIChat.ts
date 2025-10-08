/**
 * Hook: useAIChat
 * 
 * Manages AI chat state with streaming support
 * Handles conversation history and message sending
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export const useAIChat = () => {
  const { currentOrganization } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear messages when organization changes
  useEffect(() => {
    setMessages([]);
  }, [currentOrganization?.id]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!currentOrganization?.id || !userMessage.trim()) return;

    // Add user message immediately
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setIsStreaming(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const CHAT_URL = `https://jsqzkaarpfowgmijcwaw.supabase.co/functions/v1/predictive-maintenance-ai`;

      const { data: { session } } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getSession());
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMessage = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              
              // Update the last message (assistant) or add new one
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => 
                    i === prev.length - 1 
                      ? { ...m, content: assistantMessage }
                      : m
                  );
                }
                return [...prev, { 
                  role: 'assistant' as const, 
                  content: assistantMessage,
                  timestamp: new Date()
                }];
              });
            }
          } catch {
            // Ignore parse errors for partial chunks
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.info('Message cancelled');
      } else {
        console.error('Chat error:', error);
        toast.error(error.message || 'Failed to send message');
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [currentOrganization?.id, messages]);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    cancelStream,
    clearMessages,
  };
};