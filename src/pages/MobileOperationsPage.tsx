import { Smartphone } from "lucide-react";

const MobileOperationsPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mobile & Field Operations</h1>
          <p className="text-muted-foreground">Mobile work order execution and field operations management</p>
        </div>
      </div>

      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Module Under Development</h2>
        <p className="text-muted-foreground">
          This mobile operations module will provide mobile work order execution, inventory scanner with QR/barcode, 
          mobile inspection interface, dispatch board and labor management, and offline synchronization capabilities.
        </p>
      </div>
    </div>
  );
};

export default MobileOperationsPage;