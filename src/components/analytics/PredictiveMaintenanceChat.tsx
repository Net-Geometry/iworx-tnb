/**
 * PredictiveMaintenanceChat Component
 * 
 * AI-powered chat interface for maintenance insights
 * Features streaming responses and conversation history
 */

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, X, MessageSquare } from "lucide-react";
import { useAIChat } from "@/hooks/useAIChat";
import { cn } from "@/lib/utils";

export const PredictiveMaintenanceChat = () => {
  const { messages, isLoading, isStreaming, sendMessage, cancelStream, clearMessages } = useAIChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Maintenance Assistant</h3>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium mb-2">Start a conversation</p>
            <p className="text-sm max-w-md">
              Ask me about asset health, anomalies, failure predictions, or work order priorities.
            </p>
            <div className="mt-6 space-y-2 text-left max-w-md">
              <p className="text-xs font-medium">Example questions:</p>
              <div className="text-xs space-y-1 opacity-70">
                <p>• "What assets are at highest risk of failure?"</p>
                <p>• "Show me recent anomalies in pump systems"</p>
                <p>• "Which work orders should I prioritize today?"</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-4 py-2",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about assets, anomalies, or maintenance priorities..."
            className="resize-none"
            rows={2}
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={cancelStream}
              >
                <X className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
};