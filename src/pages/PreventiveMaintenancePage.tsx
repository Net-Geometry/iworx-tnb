import { Calendar } from "lucide-react";

const PreventiveMaintenancePage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Preventive Maintenance</h1>
          <p className="text-muted-foreground">PM template creation, schedule management, and automation</p>
        </div>
      </div>

      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Module Under Development</h2>
        <p className="text-muted-foreground">
          This preventive maintenance module will include PM template creation and management, 
          schedule management with automation, automated PM generation, and job plan designer with template library.
        </p>
      </div>
    </div>
  );
};

export default PreventiveMaintenancePage;