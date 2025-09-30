import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Temporarily simplified version to debug the React context issue
const PreventiveMaintenancePage = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Preventive Maintenance</h1>
            <p className="text-muted-foreground">PM schedule management, automation & tracking</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">PM Module Loading...</h2>
        <p className="text-muted-foreground">
          Setting up the preventive maintenance module components
        </p>
      </div>
    </div>
  );
};

export default PreventiveMaintenancePage;