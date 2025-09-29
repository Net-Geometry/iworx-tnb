import { BarChart3 } from "lucide-react";

const ReportsPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-destructive rounded-xl flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-destructive-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reporting & BI</h1>
          <p className="text-muted-foreground">Executive dashboards and advanced analytics</p>
        </div>
      </div>

      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Module Under Development</h2>
        <p className="text-muted-foreground">
          This reporting and BI module will offer executive dashboards with KPIs, customizable dashboard builder, 
          advanced analytics dashboard, and a custom report builder for comprehensive business intelligence.
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;