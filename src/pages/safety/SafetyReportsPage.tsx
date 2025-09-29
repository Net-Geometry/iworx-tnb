import { Shield, Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SafetyReportsPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Safety Reports</h1>
            <p className="text-muted-foreground">Compliance reporting and analytics</p>
          </div>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">OSHA Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Incident Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-success">2.1</div>
            <p className="text-xs text-muted-foreground">Per 100 employees</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Near Miss Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">Last 90 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Training Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-success">96%</div>
            <p className="text-xs text-muted-foreground">Current employees</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Standard Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">OSHA 300 Log</p>
                  <p className="text-sm text-muted-foreground">Work-related injuries and illnesses</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Incident Summary Report</p>
                  <p className="text-sm text-muted-foreground">Monthly incident statistics</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Risk Assessment Report</p>
                  <p className="text-sm text-muted-foreground">Current hazard register status</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">CAPA Effectiveness Report</p>
                  <p className="text-sm text-muted-foreground">Corrective action performance</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Safety Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-card rounded-xl p-8 text-center space-y-4">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Track safety performance metrics and identify improvement opportunities.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-card p-3 rounded-lg">
                    <div className="font-semibold text-accent-success">↓ 15%</div>
                    <div className="text-muted-foreground">Incident Reduction</div>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <div className="font-semibold text-accent">180 days</div>
                    <div className="text-muted-foreground">Injury-Free Days</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafetyReportsPage;