import { Smartphone } from "lucide-react";

/**
 * MobilePage - Mobile & Field Operations Module
 * 
 * This page serves as the entry point for mobile and field operations functionality.
 * It includes mobile work order execution, offline sync capabilities, and field crew management.
 */
const MobilePage = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mobile & Field Operations</h1>
          <p className="text-muted-foreground">
            Mobile work order execution, inventory scanner, and field crew dispatch
          </p>
        </div>
      </div>

      {/* Module Content */}
      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Module Under Development</h2>
        <p className="text-muted-foreground mb-4">
          This mobile operations module will feature mobile work order execution, barcode scanning
          for inventory management, offline synchronization capabilities, and field crew dispatch board.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-background/50 rounded-lg border border-border/30">
            <h3 className="font-medium text-foreground mb-2">📱 Mobile Work Orders</h3>
            <p className="text-sm text-muted-foreground">
              Execute work orders from mobile devices with offline capability
            </p>
          </div>
          <div className="p-4 bg-background/50 rounded-lg border border-border/30">
            <h3 className="font-medium text-foreground mb-2">🔍 Inventory Scanner</h3>
            <p className="text-sm text-muted-foreground">
              Barcode and QR code scanning for inventory tracking
            </p>
          </div>
          <div className="p-4 bg-background/50 rounded-lg border border-border/30">
            <h3 className="font-medium text-foreground mb-2">🔄 Offline Sync</h3>
            <p className="text-sm text-muted-foreground">
              Automatic synchronization when connection is restored
            </p>
          </div>
          <div className="p-4 bg-background/50 rounded-lg border border-border/30">
            <h3 className="font-medium text-foreground mb-2">📋 Dispatch Board</h3>
            <p className="text-sm text-muted-foreground">
              Real-time field crew assignment and tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePage;
