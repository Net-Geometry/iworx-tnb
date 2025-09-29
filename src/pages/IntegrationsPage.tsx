import { Link } from "lucide-react";

const IntegrationsPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
          <Link className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integration Platform</h1>
          <p className="text-muted-foreground">Integration hub with connector management and IoT data ingestion</p>
        </div>
      </div>

      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Module Under Development</h2>
        <p className="text-muted-foreground">
          This integration platform will include an integration hub with connector management, 
          integration orchestrator for complex workflows, API key management, and real-time data ingestion with IoT integration.
        </p>
      </div>
    </div>
  );
};

export default IntegrationsPage;