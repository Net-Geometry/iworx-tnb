import { Wrench } from "lucide-react";

const WorkOrdersPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
          <Wrench className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Work Management</h1>
          <p className="text-muted-foreground">Work order creation, execution, templates, and standardization</p>
        </div>
      </div>

      <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-border/50">
        <h2 className="text-xl font-semibold text-foreground mb-4">Module Under Development</h2>
        <p className="text-muted-foreground">
          This work management module will support work order creation, editing, and execution with templates, 
          standardization, calendar views, and board views for corrective, preventive, and emergency maintenance.
        </p>
      </div>
    </div>
  );
};

export default WorkOrdersPage;