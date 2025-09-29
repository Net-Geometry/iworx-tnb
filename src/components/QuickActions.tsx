import { Plus, Calendar, AlertTriangle, Wrench, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QuickActions = () => {
  const actions = [
    {
      title: "Create Work Order",
      description: "Generate new maintenance task",
      icon: Plus,
      color: "bg-gradient-primary"
    },
    {
      title: "Schedule PM",
      description: "Plan preventive maintenance",
      icon: Calendar,
      color: "bg-gradient-secondary"
    },
    {
      title: "Report Issue",
      description: "Log equipment problem",
      icon: AlertTriangle,
      color: "bg-destructive"
    },
    {
      title: "Asset Inspection",
      description: "Conduct routine check",
      icon: Wrench,
      color: "bg-gradient-success"
    },
    {
      title: "Inventory Request",
      description: "Request spare parts",
      icon: Package,
      color: "bg-warning"
    },
    {
      title: "Site Location",
      description: "View asset locations",
      icon: MapPin,
      color: "bg-info"
    }
  ];

  return (
    <Card className="bg-gradient-card border border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;