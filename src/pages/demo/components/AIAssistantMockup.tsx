import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
}

const AIAssistantMockup = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. I can help you navigate the system, answer questions, and guide you through tasks. What would you like to know?",
      suggestions: [
        "How do I create a work order?",
        "Show me asset management",
        "What are PM schedules?",
      ],
    },
  ]);
  const [input, setInput] = useState("");

  const handleSuggestion = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleSend = (message?: string) => {
    const userMessage = message || input;
    if (!userMessage.trim()) return;

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];

    // Simulate AI response
    setTimeout(() => {
      let response: Message;
      
      if (userMessage.toLowerCase().includes("work order")) {
        response = {
          role: "assistant",
          content: "To create a work order:\n\n1. Navigate to Work Orders in the sidebar\n2. Click 'Create Work Order'\n3. Fill in the asset, priority, and description\n4. Assign a technician and set the due date\n\nWould you like me to take you there now?",
          suggestions: [
            "Yes, take me to work orders",
            "Tell me about priorities",
            "How do I assign technicians?",
          ],
        };
      } else if (userMessage.toLowerCase().includes("asset")) {
        response = {
          role: "assistant",
          content: "Asset Management helps you track all your equipment and facilities. You can:\n\n• Create asset hierarchies\n• Track maintenance history\n• Monitor asset health\n• Generate QR codes for mobile access\n\nWhat aspect would you like to explore?",
          suggestions: [
            "Show me asset hierarchy",
            "How do I add assets?",
            "What is asset health?",
          ],
        };
      } else if (userMessage.toLowerCase().includes("pm schedule")) {
        response = {
          role: "assistant",
          content: "PM (Preventive Maintenance) Schedules help you automate routine maintenance:\n\n• Set recurring maintenance tasks\n• Auto-generate work orders\n• Track compliance and history\n• Optimize maintenance routes\n\nWant to see examples?",
          suggestions: [
            "Show PM examples",
            "How do I create a PM schedule?",
            "What are maintenance routes?",
          ],
        };
      } else {
        response = {
          role: "assistant",
          content: "I can help you with:\n\n• Navigation and feature discovery\n• Step-by-step task guidance\n• Best practices and tips\n• Troubleshooting common issues\n\nWhat would you like help with?",
          suggestions: [
            "Show me around the system",
            "What can I do here?",
            "Help with preventive maintenance",
          ],
        };
      }

      setMessages([...newMessages, response]);
    }, 500);

    setMessages(newMessages);
    setInput("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Assistant
        </CardTitle>
        <CardDescription>
          Conversational help that understands context and guides users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Chat Area */}
          <ScrollArea className="h-96 p-4 bg-card">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index}>
                  <div
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-2 mt-3 ml-11">
                      {message.suggestions.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestion(suggestion)}
                          className="text-xs h-8"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-muted/50">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={() => handleSend()} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <Badge variant="secondary" className="text-xs mr-2">Demo</Badge>
              This is a mockup. Real implementation would use Lovable AI.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistantMockup;
