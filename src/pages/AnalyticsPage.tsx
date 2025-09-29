import { Brain } from "lucide-react";

const AnalyticsPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-info-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advanced Analytics & AI</h1>
          <p className="text-muted-foreground">Predictive maintenance engine and AI-powered asset health computation</p>
        </div>
      </div>

      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Module Under Development</h2>
        <p className="text-muted-foreground">
          This advanced analytics module will feature predictive maintenance engine with model deployment, 
          machine learning feature store, AI-powered asset health computation, CBM rules engine, and anomaly detection.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPage;