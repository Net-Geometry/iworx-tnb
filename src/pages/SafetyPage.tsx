import { Shield } from "lucide-react";

const SafetyPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-accent-success rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-accent-success-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Safety & HSE</h1>
          <p className="text-muted-foreground">Safety incident management and hazard risk management</p>
        </div>
      </div>

      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Module Under Development</h2>
        <p className="text-muted-foreground">
          This safety and HSE module will encompass safety incident management and reporting, 
          safety hazard management with risk register, LOTO procedures creation and tracking, and CAPA management.
        </p>
      </div>
    </div>
  );
};

export default SafetyPage;