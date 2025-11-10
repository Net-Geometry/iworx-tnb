import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, Sparkles, TrendingUp, AlertTriangle, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUERIES = [
  {
    label: "Highest Cost Vertical",
    query: "Which vertical has the highest maintenance costs this month?",
    icon: DollarSign,
  },
  {
    label: "Safety Trends",
    query: "Show me safety incident trends across all verticals for the last 3 months",
    icon: AlertTriangle,
  },
  {
    label: "Efficiency Comparison",
    query: "Compare maintenance efficiency across MSMS, BWA, and other verticals",
    icon: TrendingUp,
  },
  {
    label: "Cost Anomalies",
    query: "Are there any unusual cost spikes or anomalies I should be aware of?",
    icon: Sparkles,
  },
];

export default function SuperadminAIAssistantPage() {
  const { user, hasCrossProjectAccess } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check permissions
  useEffect(() => {
    if (!hasCrossProjectAccess && !hasPermission('admin', 'read')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You need TNB Management role to access this feature.",
      });
      navigate('/');
    }
  }, [hasCrossProjectAccess, hasPermission, navigate, toast]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (queryText?: string) => {
    const messageContent = queryText || input.trim();
    
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Prepare conversation history (last 10 messages for context)
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(
        `https://hpxbcaynhelqktyeoqal.supabase.co/functions/v1/superadmin-ai-chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: messageContent,
            conversationHistory,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. TNB Management role required.');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          throw new Error('AI credits depleted. Please contact administrator.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      // Add initial assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantContent += content;
              
              // Update the last message
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }

      // Process final buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (!line.trim() || line.startsWith(':') || !line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error('Failed to parse final buffer:', e);
          }
        }
      }

      // Save conversation to database
      if (user && assistantContent) {
        await supabase.from('superadmin_ai_conversations').insert({
          user_id: user.id,
          query: messageContent,
          response: assistantContent,
          metadata: {
            timestamp: new Date().toISOString(),
          },
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to send message',
      });
      
      // Remove incomplete assistant message
      setMessages(prev => prev.filter(m => m.content.trim() !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = (query: string) => {
    setInput(query);
    textareaRef.current?.focus();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Superadmin AI Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions about cross-vertical cost analysis, maintenance trends, and efficiency insights
          </p>
        </div>
      </div>

      {/* Quick Query Buttons */}
      {messages.length === 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Quick Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {QUICK_QUERIES.map((q) => {
              const Icon = q.icon;
              return (
                <Button
                  key={q.label}
                  variant="outline"
                  className="h-auto p-4 justify-start text-left"
                  onClick={() => handleQuickQuery(q.query)}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{q.label}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {q.query}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <Card className="flex flex-col h-[600px]">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Brain className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
              <p className="text-muted-foreground max-w-md">
                Ask me anything about cost analysis, maintenance efficiency, safety trends, or operational insights across all TNB verticals.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {message.content || (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground">
                      {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about cost analysis, efficiency trends, safety incidents..."
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-normal">
              Powered by Gemini 2.5 Flash
            </Badge>
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
