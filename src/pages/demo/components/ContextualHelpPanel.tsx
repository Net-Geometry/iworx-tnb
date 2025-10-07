import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, BookOpen, Video, ExternalLink } from "lucide-react";

interface ContextualHelpPanelProps {
  section: string;
  onClose: () => void;
}

const helpContent: Record<string, any> = {
  overview: {
    title: "Getting Started",
    articles: [
      { title: "What is a Self-Explanatory System?", type: "article" },
      { title: "Overview Video", type: "video" },
      { title: "Best Practices", type: "article" },
    ],
    quickTips: [
      "Use Ctrl+K to open the command palette",
      "Hover over elements for detailed tooltips",
      "Look for inline help cards throughout the system",
    ],
  },
  tours: {
    title: "Guided Tours",
    articles: [
      { title: "Creating Your First Tour", type: "article" },
      { title: "Tour Best Practices", type: "article" },
      { title: "When to Use Tours", type: "video" },
    ],
    quickTips: [
      "Tours should be 3-7 steps for optimal retention",
      "Always allow users to skip or exit tours",
      "Show tours on first visit or when requested",
    ],
  },
  contextual: {
    title: "Contextual Help",
    articles: [
      { title: "Inline Help Design", type: "article" },
      { title: "Smart Tooltip Guidelines", type: "article" },
      { title: "Empty State Patterns", type: "video" },
    ],
    quickTips: [
      "Keep inline help concise and actionable",
      "Use visual hierarchy to separate help from content",
      "Update help content based on user feedback",
    ],
  },
  interactive: {
    title: "Interactive Features",
    articles: [
      { title: "Building an AI Assistant", type: "article" },
      { title: "Natural Language Processing", type: "video" },
      { title: "Fallback Strategies", type: "article" },
    ],
    quickTips: [
      "AI assistants should have clear capabilities",
      "Always provide fallback options",
      "Learn from user interactions over time",
    ],
  },
  advanced: {
    title: "Advanced Features",
    articles: [
      { title: "Progressive Disclosure Strategy", type: "article" },
      { title: "Video Tooltips Production", type: "video" },
      { title: "Keyboard Shortcuts Design", type: "article" },
    ],
    quickTips: [
      "Unlock features gradually to avoid overwhelming users",
      "Keep videos under 15 seconds for tooltips",
      "Document all keyboard shortcuts consistently",
    ],
  },
};

const ContextualHelpPanel = ({ section, onClose }: ContextualHelpPanelProps) => {
  const content = helpContent[section] || helpContent.overview;

  return (
    <Card className="w-80 h-fit sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {content.title}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Related Articles */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Related Articles</h4>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {content.articles.map((article: any, index: number) => (
                <button
                  key={index}
                  className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 group"
                >
                  {article.type === "video" ? (
                    <Video className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-sm flex-1">{article.title}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Tips */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Quick Tips</h4>
          <div className="space-y-2">
            {content.quickTips.map((tip: string, index: number) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <Badge variant="outline" className="shrink-0 h-5 w-5 p-0 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Context-specific help */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            This panel adapts to show help relevant to your current section. In a real implementation,
            content would be fetched from a knowledge base.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContextualHelpPanel;
