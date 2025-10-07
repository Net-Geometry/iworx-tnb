import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock, CheckCircle2, Circle } from "lucide-react";

interface Feature {
  id: string;
  name: string;
  description: string;
  unlockAt: number; // Percentage of progress
  unlocked: boolean;
}

const ProgressiveDisclosureDemo = () => {
  const [progress, setProgress] = useState(25);
  
  const [features, setFeatures] = useState<Feature[]>([
    {
      id: "basic",
      name: "Basic Assets",
      description: "Create and manage assets",
      unlockAt: 0,
      unlocked: true,
    },
    {
      id: "hierarchy",
      name: "Asset Hierarchy",
      description: "Organize assets in hierarchies",
      unlockAt: 25,
      unlocked: progress >= 25,
    },
    {
      id: "workorders",
      name: "Work Orders",
      description: "Create and track work orders",
      unlockAt: 50,
      unlocked: progress >= 50,
    },
    {
      id: "pm",
      name: "PM Schedules",
      description: "Automate preventive maintenance",
      unlockAt: 75,
      unlocked: progress >= 75,
    },
    {
      id: "analytics",
      name: "Advanced Analytics",
      description: "Deep insights and reporting",
      unlockAt: 100,
      unlocked: progress >= 100,
    },
  ]);

  const handleProgress = (value: number) => {
    setProgress(value);
    setFeatures(features.map(f => ({
      ...f,
      unlocked: f.unlockAt <= value,
    })));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Progressive Disclosure
        </CardTitle>
        <CardDescription>
          Unlock features as users gain experience and complete milestones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Simulation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Progress</span>
            <Badge variant="secondary">{progress}%</Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleProgress(0)}>
              Reset
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleProgress(25)}>
              25%
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleProgress(50)}>
              50%
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleProgress(75)}>
              75%
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleProgress(100)}>
              100%
            </Button>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                feature.unlocked
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-muted/50"
              }`}
            >
              <div className="shrink-0">
                {feature.unlocked ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={`font-semibold ${!feature.unlocked && "text-muted-foreground"}`}>
                  {feature.name}
                </h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>

              <Badge variant={feature.unlocked ? "default" : "secondary"}>
                {feature.unlocked ? "Unlocked" : `Unlock at ${feature.unlockAt}%`}
              </Badge>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="pt-4 border-t border-border">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Recent Achievements
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "First Asset", unlocked: progress >= 10 },
              { name: "Team Player", unlocked: progress >= 30 },
              { name: "PM Master", unlocked: progress >= 60 },
              { name: "Analytics Pro", unlocked: progress >= 90 },
              { name: "Power User", unlocked: progress >= 100 },
              { name: "Coming Soon", unlocked: false },
            ].map((achievement, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-center ${
                  achievement.unlocked
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-muted flex items-center justify-center">
                  {achievement.unlocked ? (
                    <Trophy className="w-4 h-4 text-primary" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className={`text-xs ${!achievement.unlocked && "text-muted-foreground"}`}>
                  {achievement.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Progressive disclosure</strong> prevents overwhelming new users by:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>Starting with core features only</li>
            <li>Unlocking advanced features based on usage patterns</li>
            <li>Celebrating milestones with achievements</li>
            <li>Gamifying the learning process</li>
            <li>Maintaining a sense of progression and growth</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressiveDisclosureDemo;
