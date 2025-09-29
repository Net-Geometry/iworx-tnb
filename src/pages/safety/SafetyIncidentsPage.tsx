import { Shield, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SafetyIncidentsPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Safety Incidents</h1>
            <p className="text-muted-foreground">Report and track safety incidents</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">2</div>
            <p className="text-xs text-muted-foreground">Requires immediate action</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Investigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">5</div>
            <p className="text-xs text-muted-foreground">Active investigations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-success">18</div>
            <p className="text-xs text-muted-foreground">Average: 3.2 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-card rounded-xl p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Incident Management System</h3>
            <p className="text-muted-foreground">
              Track safety incidents from reporting through investigation to resolution.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyIncidentsPage;