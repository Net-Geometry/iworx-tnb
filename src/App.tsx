import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Module Pages
import AssetsPage from "./pages/AssetsPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import PreventiveMaintenancePage from "./pages/PreventiveMaintenancePage";
import InventoryPage from "./pages/InventoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MobileOperationsPage from "./pages/MobileOperationsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SafetyPage from "./pages/SafetyPage";
import SpatialPage from "./pages/SpatialPage";
import ReportsPage from "./pages/ReportsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/preventive-maintenance" element={<PreventiveMaintenancePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/mobile-operations" element={<MobileOperationsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/spatial" element={<SpatialPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
