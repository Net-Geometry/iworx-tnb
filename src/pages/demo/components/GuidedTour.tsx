import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // DOM selector
  position: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    id: "step-1",
    title: "Welcome to the Guided Tour",
    content: "This tour will show you how interactive guides can help users learn your system. Click Next to continue.",
    target: "#tour-demo-section",
    position: "bottom",
  },
  {
    id: "step-2",
    title: "Create Assets",
    content: "Users start by creating assets. The tour highlights exactly where to click and what to do.",
    target: "#tour-step-1",
    position: "right",
  },
  {
    id: "step-3",
    title: "Assign Locations",
    content: "Next, they assign assets to locations. Each step builds on the previous one.",
    target: "#tour-step-2",
    position: "right",
  },
  {
    id: "step-4",
    title: "Set Schedules",
    content: "Finally, they configure maintenance schedules. Tours can have as many steps as needed!",
    target: "#tour-step-3",
    position: "right",
  },
];

interface GuidedTourProps {
  active: boolean;
  onComplete: () => void;
}

const GuidedTour = ({ active, onComplete }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!active) return;

    const updatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        setTargetPosition({
          top: rect.top + scrollTop,
          left: rect.left + scrollLeft,
        });

        // Scroll element into view
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [currentStep, active]);

  if (!active) return null;

  const step = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />

      {/* Spotlight */}
      <div
        className="fixed border-4 border-primary rounded-lg z-50 pointer-events-none animate-pulse"
        style={{
          top: targetPosition.top - 8,
          left: targetPosition.left - 8,
          width: document.querySelector(step.target)?.getBoundingClientRect().width! + 16,
          height: document.querySelector(step.target)?.getBoundingClientRect().height! + 16,
        }}
      />

      {/* Tour Card */}
      <Card
        className="fixed z-50 w-96 shadow-lg"
        style={{
          top: targetPosition.top + 100,
          left: targetPosition.left + 20,
        }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{step.title}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onComplete}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{step.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={isFirst}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <div className="flex gap-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <Button size="sm" onClick={handleNext}>
            {isLast ? "Finish" : "Next"}
            {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default GuidedTour;
