import { Shield, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LOTOProceduresPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">LOTO Procedures</h1>
            <p className="text-muted-foreground">Lockout/Tagout procedure management</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Procedure
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Procedures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Equipment specific</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Procedures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-success">72</div>
            <p className="text-xs text-muted-foreground">Approved & current</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">8</div>
            <p className="text-xs text-muted-foreground">Next 60 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft Procedures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent LOTO Procedures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Conveyor Belt System #3</p>
                  <p className="text-sm text-muted-foreground">Last updated: 2 days ago</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Hydraulic Press #A12</p>
                  <p className="text-sm text-muted-foreground">Last updated: 1 week ago</p>
                </div>
                <Badge variant="secondary">Review Due</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Compressor Unit #7</p>
                  <p className="text-sm text-muted-foreground">Created: 3 days ago</p>
                </div>
                <Badge variant="outline">Draft</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>LOTO Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-card rounded-xl p-8 text-center space-y-4">
              <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Energy Control Program</h3>
                <p className="text-muted-foreground mb-4">
                  Ensure safe isolation of hazardous energy during maintenance activities.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-card p-3 rounded-lg">
                    <div className="font-semibold text-accent-success">98%</div>
                    <div className="text-muted-foreground">Compliance Rate</div>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <div className="font-semibold text-accent">12 mins</div>
                    <div className="text-muted-foreground">Avg. Lockout Time</div>
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

export default LOTOProceduresPage;