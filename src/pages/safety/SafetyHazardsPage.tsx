import { Shield, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SafetyHazardsPage = () => {
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
        <Button>
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
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Very High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">3</div>
            <p className="text-xs text-muted-foreground">Immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">12</div>
            <p className="text-xs text-muted-foreground">Needs mitigation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medium Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">28</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Chemical Storage Area</p>
                  <p className="text-sm text-muted-foreground">Inadequate ventilation system</p>
                </div>
                <Badge variant="destructive">Very High</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Loading Dock</p>
                  <p className="text-sm text-muted-foreground">Forklift pedestrian conflict</p>
                </div>
                <Badge variant="destructive">High</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Machine Shop</p>
                  <p className="text-sm text-muted-foreground">Missing safety guards</p>
                </div>
                <Badge variant="secondary">High</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafetyHazardsPage;