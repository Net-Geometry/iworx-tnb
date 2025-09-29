import { Package } from "lucide-react";

const InventoryPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-warning-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory & Procurement</h1>
          <p className="text-muted-foreground">Comprehensive inventory tracking and procurement workflows</p>
        </div>
      </div>

      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Module Under Development</h2>
        <p className="text-muted-foreground">
          This inventory and procurement module will offer comprehensive inventory tracking, reorder management, 
          policies, inventory transfers and loans, purchase orders and receiving, and complete procurement workflows.
        </p>
      </div>
    </div>
  );
};

export default InventoryPage;