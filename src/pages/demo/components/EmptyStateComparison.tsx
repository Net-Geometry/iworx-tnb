import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Video, BookOpen, Rocket } from "lucide-react";

const EmptyStateComparison = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Empty States</CardTitle>
        <CardDescription>
          Transform empty pages into learning opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Bad Example */}
          <div>
            <Badge variant="destructive" className="mb-3">Bad Example</Badge>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-card">
              <p className="text-muted-foreground">No assets found</p>
            </div>
          </div>

          {/* Good Example */}
          <div>
            <Badge variant="default" className="mb-3">Good Example</Badge>
            <div className="border-2 border-dashed border-primary/50 rounded-lg p-6 bg-card">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-primary" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Let's Create Your First Asset
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Assets are the foundation of your maintenance system. Start by adding equipment, machinery, or facilities.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Asset
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Video className="w-4 h-4 mr-2" />
                    Watch Tutorial
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    Need help getting started?
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Docs
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Examples
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Smart empty states</strong> should include:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>Clear explanation of what the feature does</li>
            <li>Primary action button to get started</li>
            <li>Secondary resources (tutorials, docs, examples)</li>
            <li>Visual icon or illustration to grab attention</li>
            <li>Encouraging tone that guides users forward</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyStateComparison;
