import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface HealthIndicatorProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

export function HealthIndicator({ score, className, showLabel = true }: HealthIndicatorProps) {
  const getHealthColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";  
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getHealthText = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 relative">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300", getHealthColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-sm font-medium tabular-nums", getHealthText(score))}>
          {score}%
        </span>
      )}
    </div>
  );
}