import { useState, useEffect } from "react";
import { PMScheduleBOMView } from "./PMScheduleBOMView";
import { PMLaborPlanning } from "./PMLaborPlanning";
import { PMCostSummary } from "./PMCostSummary";

/**
 * PMPlannedTab Component
 * Main container for the PM Schedule planning tab
 * Integrates BOM, labor planning, and cost summary
 */

interface PMPlannedTabProps {
  assetId?: string;
  assignedPersonId?: string;
  estimatedDurationHours?: number;
  onCostUpdate?: (costs: { materialCost: number; laborCost: number; totalCost: number }) => void;
}

export const PMPlannedTab = ({ 
  assetId, 
  assignedPersonId, 
  estimatedDurationHours,
  onCostUpdate 
}: PMPlannedTabProps) => {
  const [materialCost, setMaterialCost] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [otherCosts] = useState(0);

  // Update parent with cost changes
  useEffect(() => {
    if (onCostUpdate) {
      const totalCost = materialCost + laborCost + otherCosts;
      onCostUpdate({ materialCost, laborCost, totalCost });
    }
  }, [materialCost, laborCost, otherCosts, onCostUpdate]);

  // Handle material cost updates from BOM view
  const handleMaterialsChange = (materials: Array<{ bomItemId: string; quantity: number; estimatedCost: number }>) => {
    const total = materials.reduce((sum, m) => sum + m.estimatedCost, 0);
    setMaterialCost(total);
  };

  // Handle labor cost updates
  const handleLaborCostChange = (cost: number) => {
    setLaborCost(cost);
  };

  return (
    <div className="space-y-6">
      {/* Materials & BOM Section */}
      <PMScheduleBOMView 
        assetId={assetId}
        onMaterialsChange={handleMaterialsChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Labor Planning Section */}
        <PMLaborPlanning
          assignedPersonId={assignedPersonId}
          estimatedDurationHours={estimatedDurationHours}
          onLaborCostChange={handleLaborCostChange}
        />

        {/* Cost Summary Section */}
        <PMCostSummary
          materialCost={materialCost}
          laborCost={laborCost}
          otherCosts={otherCosts}
        />
      </div>
    </div>
  );
};
