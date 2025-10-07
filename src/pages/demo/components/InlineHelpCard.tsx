import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InlineHelpCardProps {
  title: string;
  description: string;
  type?: "info" | "warning" | "tip";
  expandable?: boolean;
  expandedContent?: string;
}

const InlineHelpCard = ({
  title,
  description,
  type = "info",
  expandable = true,
  expandedContent = "Inline help cards can expand to show more detailed information, code examples, or step-by-step instructions. They're perfect for providing just-in-time help without cluttering the interface.",
}: InlineHelpCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const iconMap = {
    info: <Info className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    tip: <Lightbulb className="w-4 h-4" />,
  };

  const variantMap = {
    info: "default",
    warning: "destructive",
    tip: "secondary",
  } as const;

  return (
    <Card className="border-l-4" style={{
      borderLeftColor: type === "info" ? "hsl(var(--primary))" : 
                       type === "warning" ? "hsl(var(--destructive))" : 
                       "hsl(var(--secondary))"
    }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Badge variant={variantMap[type]} className="shrink-0 mt-0.5">
              {iconMap[type]}
            </Badge>
            <div className="flex-1">
              <CardTitle className="text-base mb-1">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {expandable && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>
      </CardHeader>
      {expandable && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                {expandedContent}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline">
                  Learn More
                </Button>
                <Button size="sm" variant="ghost">
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
};

export default InlineHelpCard;
