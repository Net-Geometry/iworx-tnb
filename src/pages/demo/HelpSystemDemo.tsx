import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Rocket, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import GuidedTour from "./components/GuidedTour";
import ContextualHelpPanel from "./components/ContextualHelpPanel";
import InlineHelpCard from "./components/InlineHelpCard";
import SmartTooltipDemo from "./components/SmartTooltipDemo";
import EmptyStateComparison from "./components/EmptyStateComparison";
import AIAssistantMockup from "./components/AIAssistantMockup";
import ProgressiveDisclosureDemo from "./components/ProgressiveDisclosureDemo";
import VideoTooltipDemo from "./components/VideoTooltipDemo";
import CommandPaletteDemo from "./components/CommandPaletteDemo";

/**
 * Demo page showcasing all self-explanatory system features
 * This is a standalone demo that can be easily removed
 */
const HelpSystemDemo = () => {
  const [tourActive, setTourActive] = useState(false);
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 max-w-7xl relative">
      {/* Demo Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Self-Explanatory System Demo
            </h1>
            <p className="text-muted-foreground">
              Interactive demonstration of all help system features
            </p>
          </div>
          <Badge variant="secondary" className="h-fit">
            <Rocket className="w-3 h-3 mr-1" />
            Demo Mode
          </Badge>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Demo Page</AlertTitle>
          <AlertDescription>
            This is a standalone demonstration. All features are self-contained and can be
            easily removed by deleting the <code className="bg-muted px-1 py-0.5 rounded">/demo</code> folder and route.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Main Demo Area */}
        <div className="flex-1">
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="grid grid-cols-5 w-full mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tours">Tours</TabsTrigger>
              <TabsTrigger value="contextual">Contextual</TabsTrigger>
              <TabsTrigger value="interactive">Interactive</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>9 Self-Explanatory Features</CardTitle>
                  <CardDescription>
                    A comprehensive system to guide users without external documentation
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FeatureCard
                    number="1"
                    title="Guided Tours"
                    description="Step-by-step walkthroughs of complex workflows"
                  />
                  <FeatureCard
                    number="2"
                    title="Help Panel"
                    description="Contextual help that adapts to current page"
                  />
                  <FeatureCard
                    number="3"
                    title="Inline Help"
                    description="Tips and hints right where you need them"
                  />
                  <FeatureCard
                    number="4"
                    title="Smart Tooltips"
                    description="Rich tooltips with actions and shortcuts"
                  />
                  <FeatureCard
                    number="5"
                    title="Smart Empty States"
                    description="Turn empty pages into learning opportunities"
                  />
                  <FeatureCard
                    number="6"
                    title="AI Assistant"
                    description="Conversational help and navigation"
                  />
                  <FeatureCard
                    number="7"
                    title="Progressive Disclosure"
                    description="Unlock features as users progress"
                  />
                  <FeatureCard
                    number="8"
                    title="Video Tooltips"
                    description="Visual demonstrations on hover"
                  />
                  <FeatureCard
                    number="9"
                    title="Command Palette"
                    description="Quick access to all features via keyboard"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button onClick={() => setTourActive(true)}>
                    <Rocket className="w-4 h-4 mr-2" />
                    Start Guided Tour
                  </Button>
                  <Button variant="outline" onClick={() => setHelpPanelOpen(!helpPanelOpen)}>
                    Toggle Help Panel
                  </Button>
                  <Button variant="outline" onClick={() => setCommandPaletteOpen(true)}>
                    Open Command Palette (Ctrl+K)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tours Tab */}
            <TabsContent value="tours" className="space-y-6">
              <Card id="tour-demo-section">
                <CardHeader>
                  <CardTitle>Interactive Guided Tours</CardTitle>
                  <CardDescription>
                    Guide users through complex workflows with step-by-step tours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <GuidedTour active={tourActive} onComplete={() => setTourActive(false)} />
                  
                  <div id="tour-step-1" className="p-4 border border-border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Step 1: Create an Asset</h3>
                    <p className="text-sm text-muted-foreground">
                      This is where you would create a new asset in the system
                    </p>
                  </div>

                  <div id="tour-step-2" className="p-4 border border-border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Step 2: Assign to Location</h3>
                    <p className="text-sm text-muted-foreground">
                      Next, assign the asset to a specific location
                    </p>
                  </div>

                  <div id="tour-step-3" className="p-4 border border-border rounded-lg bg-card">
                    <h3 className="font-semibold mb-2">Step 3: Set Maintenance Schedule</h3>
                    <p className="text-sm text-muted-foreground">
                      Finally, configure the preventive maintenance schedule
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contextual Tab */}
            <TabsContent value="contextual" className="space-y-6">
              <InlineHelpCard
                title="Inline Help Cards"
                description="These cards provide contextual help right next to the UI elements"
                type="info"
              />

              <SmartTooltipDemo />

              <EmptyStateComparison />
            </TabsContent>

            {/* Interactive Tab */}
            <TabsContent value="interactive" className="space-y-6">
              <AIAssistantMockup />
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <ProgressiveDisclosureDemo />
              <VideoTooltipDemo />
            </TabsContent>
          </Tabs>

          {/* Removal Instructions */}
          <Card className="mt-8 border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                How to Remove This Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Remove the route <code className="bg-muted px-1 py-0.5 rounded">/demo/help-system</code> from <code className="bg-muted px-1 py-0.5 rounded">App.tsx</code></li>
                <li>Delete the folder <code className="bg-muted px-1 py-0.5 rounded">src/pages/demo/</code></li>
                <li>Remove the sidebar link from <code className="bg-muted px-1 py-0.5 rounded">AppSidebar.tsx</code></li>
                <li>That's it! No database cleanup needed</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Contextual Help Panel */}
        {helpPanelOpen && (
          <ContextualHelpPanel
            section={activeSection}
            onClose={() => setHelpPanelOpen(false)}
          />
        )}
      </div>

      {/* Command Palette */}
      <CommandPaletteDemo
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <div className="p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
    <div className="flex items-start gap-3">
      <Badge variant="outline" className="shrink-0">
        {number}
      </Badge>
      <div>
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

export default HelpSystemDemo;
