import { useState } from "react";
import { Shield, Plus, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHazards, useCreateHazard } from "@/hooks/useSafetyHazards";
import { HazardForm } from "@/components/safety/HazardForm";
import { isWithinInterval, addDays } from "date-fns";

const SafetyHazardsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: hazards, isLoading } = useHazards();
  const createHazard = useCreateHazard();

  // Calculate KPIs from real data
  const totalHazards = hazards?.length || 0;
  const veryHighRisk = hazards?.filter(h => h.risk_level === 'very_high').length || 0;
  const highRisk = hazards?.filter(h => h.risk_level === 'high').length || 0;
  const mediumRisk = hazards?.filter(h => h.risk_level === 'medium').length || 0;
  
  const dueForReview = hazards?.filter(h => {
    if (!h.review_date) return false;
    const reviewDate = new Date(h.review_date);
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    return isWithinInterval(reviewDate, { start: today, end: thirtyDaysFromNow });
  }).length || 0;

  // Get high priority hazards (very high and high risk, open status)
  const highPriorityHazards = hazards
    ?.filter(h => (h.risk_level === 'very_high' || h.risk_level === 'high') && h.status === 'open')
    .slice(0, 3) || [];

  const handleCreateHazard = async (data: any) => {
    await createHazard.mutateAsync(data);
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very_high': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    return riskLevel.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hazard & Risk Register</h1>
            <p className="text-muted-foreground">Identify and assess workplace hazards</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Hazard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hazards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHazards}</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Very High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{veryHighRisk}</div>
            <p className="text-xs text-muted-foreground">Immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{highRisk}</div>
            <p className="text-xs text-muted-foreground">Needs mitigation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medium Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{mediumRisk}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueForReview}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-card rounded-xl p-8 text-center">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[...Array(25)].map((_, i) => {
                  const row = Math.floor(i / 5);
                  const col = i % 5;
                  const riskLevel = (row + 1) * (col + 1);
                  let bgColor = "bg-accent-success/20";
                  if (riskLevel > 15) bgColor = "bg-destructive/20";
                  else if (riskLevel > 8) bgColor = "bg-warning/20";
                  else if (riskLevel > 4) bgColor = "bg-accent/20";
                  
                  return (
                    <div key={i} className={`h-8 w-8 rounded ${bgColor} flex items-center justify-center text-xs font-medium`}>
                      {riskLevel}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground">Risk Assessment Matrix (Likelihood × Severity)</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>High Priority Hazards</CardTitle>
          </CardHeader>
          <CardContent>
            {highPriorityHazards.length > 0 ? (
              <div className="space-y-4">
                {highPriorityHazards.map((hazard) => (
                  <div key={hazard.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium">{hazard.title}</p>
                      <p className="text-sm text-muted-foreground">{hazard.location}</p>
                      <p className="text-xs text-muted-foreground mt-1">{hazard.hazard_number}</p>
                    </div>
                    <Badge variant={getRiskBadgeVariant(hazard.risk_level)}>
                      {getRiskLabel(hazard.risk_level)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No high priority hazards found
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hazard Form Dialog */}
      <HazardForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateHazard}
        mode="create"
      />
    </div>
  );
};

export default SafetyHazardsPage;