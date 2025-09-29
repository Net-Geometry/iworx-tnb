import { Shield, Plus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CAPAManagementPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-accent-success/10 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-accent-success" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">CAPA Management</h1>
            <p className="text-muted-foreground">Corrective & Preventive Actions tracking</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create CAPA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total CAPAs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">12</div>
            <p className="text-xs text-muted-foreground">Active CAPAs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">8</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">3</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-success">22</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Priority CAPAs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Improve Chemical Handling</p>
                  <p className="text-sm text-muted-foreground">Due: March 15, 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">High</Badge>
                  <Badge variant="secondary">Overdue</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Safety Training Update</p>
                  <p className="text-sm text-muted-foreground">Due: April 2, 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Medium</Badge>
                  <Badge variant="outline">In Progress</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">PPE Compliance Review</p>
                  <p className="text-sm text-muted-foreground">Due: April 10, 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Low</Badge>
                  <Badge variant="outline">Open</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>CAPA Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-card rounded-xl p-8 text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Continuous Improvement</h3>
                <p className="text-muted-foreground mb-4">
                  Track corrective and preventive actions to prevent recurrence of safety issues.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-card p-3 rounded-lg">
                    <div className="font-semibold text-accent-success">94%</div>
                    <div className="text-muted-foreground">Completion Rate</div>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <div className="font-semibold text-accent">18 days</div>
                    <div className="text-muted-foreground">Avg. Close Time</div>
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

export default CAPAManagementPage;