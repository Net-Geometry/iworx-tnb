import { useWorkOrderSkillMatching } from "@/hooks/useWorkOrderSkillMatching";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Award, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WorkOrderSkillMatchingPanelProps {
  workOrderId: string;
  onSelectTechnician?: (personId: string, personName: string) => void;
}

/**
 * Component to display recommended technicians based on work order skill requirements
 * Shows skill match percentage and missing/fulfilled skills
 */
export const WorkOrderSkillMatchingPanel = ({ 
  workOrderId, 
  onSelectTechnician 
}: WorkOrderSkillMatchingPanelProps) => {
  const { workOrderSkills, recommendedTechnicians, isLoading } = useWorkOrderSkillMatching(workOrderId);

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return <div className="p-6">Loading skill matching...</div>;
  }

  if (workOrderSkills.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No skill requirements defined for this work order. Add skill requirements to get technician recommendations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Skill Requirements Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Required Skills ({workOrderSkills.length})
          </CardTitle>
          <CardDescription>
            Skills needed to complete this work order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {workOrderSkills.map((skill) => (
              <Badge 
                key={skill.id} 
                variant={skill.is_fulfilled ? "default" : "outline"}
                className="flex items-center gap-1"
              >
                {skill.is_fulfilled && <CheckCircle2 className="w-3 h-3" />}
                {skill.skills?.skill_name} ({skill.proficiency_level_required})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Technicians */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Recommended Technicians
        </h3>

        {recommendedTechnicians.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No technicians found with matching skills. Consider assigning training or adjusting skill requirements.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {recommendedTechnicians.map((tech) => (
              <Card key={tech.person_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Technician Info */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(tech.person_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <h4 className="font-semibold">{tech.person_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {tech.total_experience_years} years experience
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Percentage */}
                    <div className="text-right space-y-2">
                      <div className={`text-2xl font-bold ${getMatchColor(tech.match_percentage)}`}>
                        {tech.match_percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">Skill Match</div>
                    </div>
                  </div>

                  {/* Match Progress Bar */}
                  <div className="mt-4">
                    <Progress value={tech.match_percentage} className="h-2" />
                  </div>

                  {/* Matched Skills */}
                  {tech.matched_skills && tech.matched_skills.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Matched Skills:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tech.matched_skills.map((skill: any, idx: number) => (
                          <Badge key={idx} variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Skill {idx + 1}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {tech.missing_skills && tech.missing_skills.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Skills Gap:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tech.missing_skills.map((skill: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-orange-600 dark:text-orange-400">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Skill {idx + 1}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assign Button */}
                  {onSelectTechnician && (
                    <div className="mt-4">
                      <Button 
                        className="w-full" 
                        onClick={() => onSelectTechnician(tech.person_id, tech.person_name)}
                        variant={tech.match_percentage === 100 ? "default" : "outline"}
                      >
                        Assign {tech.person_name}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};