import { Settings } from "lucide-react";

const AssetsPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Management</h1>
          <p className="text-muted-foreground">Asset creation, health monitoring, criticality assessment, and BOM management</p>
        </div>
      </div>

      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Module Under Development</h2>
        <p className="text-muted-foreground">
          This comprehensive asset management module will include asset creation, hierarchical structure management, 
          health monitoring, criticality assessment, and Bill of Materials (BOM) management with complete lifecycle tracking.
        </p>
      </div>
    </div>
  );
};

export default AssetsPage;