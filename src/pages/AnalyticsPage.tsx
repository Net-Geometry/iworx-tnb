import { Brain } from "lucide-react";
import { PredictiveMaintenanceChat } from "@/components/analytics/PredictiveMaintenanceChat";
import { AssetHealthDashboard } from "@/components/analytics/AssetHealthDashboard";
import { AnomalyAlerts } from "@/components/analytics/AnomalyAlerts";
import { SmartPrioritization } from "@/components/analytics/SmartPrioritization";

/**
 * AnalyticsPage - AI-Powered Predictive Maintenance Dashboard
 * 
 * Features:
 * - Conversational AI assistant for maintenance queries
 * - Real-time asset health monitoring with ML predictions
 * - Anomaly detection alerts with acknowledge/resolve actions
 * - AI-prioritized work order recommendations
 */

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-info-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advanced Analytics & AI</h1>
          <p className="text-muted-foreground">Predictive maintenance engine with AI-powered insights</p>
        </div>
      </div>

      {/* Main Layout: Chat (40%) + Dashboard (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* AI Chat Assistant - Left Side (40%) */}
        <div className="lg:col-span-2">
          <PredictiveMaintenanceChat />
        </div>

        {/* Analytics Dashboard - Right Side (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Asset Health Dashboard */}
          <AssetHealthDashboard />

          {/* Anomaly Alerts */}
          <AnomalyAlerts />

          {/* Smart Work Order Prioritization */}
          <SmartPrioritization />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;