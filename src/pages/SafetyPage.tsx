import { Shield, AlertTriangle, AlertCircle, Lock, CheckCircle, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

const SafetyPage = () => {
  const safetyModules = [
    {
      title: "Incident Management",
      description: "Report and track safety incidents from occurrence to resolution",
      icon: AlertTriangle,
      path: "/safety/incidents",
      color: "bg-destructive/10 text-destructive",
      stats: "23 incidents this year"
    },
    {
      title: "Hazard & Risk Register",
      description: "Identify, assess, and manage workplace hazards and risks",
      icon: AlertCircle,
      path: "/safety/hazards",
      color: "bg-warning/10 text-warning",
      stats: "156 hazards tracked"
    },
    {
      title: "LOTO Procedures",
      description: "Lockout/Tagout procedures for safe equipment maintenance",
      icon: Lock,
      path: "/safety/loto",
      color: "bg-accent/10 text-accent",
      stats: "89 procedures active"
    },
    {
      title: "CAPA Management",
      description: "Corrective and preventive actions to prevent recurrence",
      icon: CheckCircle,
      path: "/safety/capa",
      color: "bg-accent-success/10 text-accent-success",
      stats: "45 CAPAs tracked"
    },
    {
      title: "Safety Reports",
      description: "Compliance reporting and safety performance analytics",
      icon: BarChart3,
      path: "/safety/reports",
      color: "bg-accent/10 text-accent",
      stats: "12 OSHA reports"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-accent-success/10 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-accent-success" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Safety & HSE</h1>
          <p className="text-muted-foreground">Comprehensive safety management and compliance system</p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Hazards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">15</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue CAPAs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">3</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Safety Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-success">94%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Safety Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safetyModules.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card key={module.path} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${module.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <NavLink to={module.path}>
                      <ArrowRight className="w-4 h-4" />
                    </NavLink>
                  </Button>
                </div>
                <CardTitle className="text-lg">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{module.description}</p>
                <p className="text-sm font-medium text-accent">{module.stats}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-auto p-4 flex-col items-start" variant="outline" asChild>
              <NavLink to="/safety/incidents">
                <AlertTriangle className="w-5 h-5 mb-2 text-destructive" />
                <span className="font-medium">Report Incident</span>
                <span className="text-xs text-muted-foreground">Quick incident reporting</span>
              </NavLink>
            </Button>
            <Button className="h-auto p-4 flex-col items-start" variant="outline" asChild>
              <NavLink to="/safety/hazards">
                <AlertCircle className="w-5 h-5 mb-2 text-warning" />
                <span className="font-medium">Add Hazard</span>
                <span className="text-xs text-muted-foreground">Register new hazard</span>
              </NavLink>
            </Button>
            <Button className="h-auto p-4 flex-col items-start" variant="outline" asChild>
              <NavLink to="/safety/loto">
                <Lock className="w-5 h-5 mb-2 text-accent" />
                <span className="font-medium">Create LOTO</span>
                <span className="text-xs text-muted-foreground">New lockout procedure</span>
              </NavLink>
            </Button>
            <Button className="h-auto p-4 flex-col items-start" variant="outline" asChild>
              <NavLink to="/safety/capa">
                <CheckCircle className="w-5 h-5 mb-2 text-accent-success" />
                <span className="font-medium">Create CAPA</span>
                <span className="text-xs text-muted-foreground">Corrective action</span>
              </NavLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyPage;