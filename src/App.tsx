import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";

// Module Pages
import AssetsPage from "./pages/AssetsPage";
import AssetDetailPage from "./pages/AssetDetailPage";
import CreateAssetPage from "./pages/CreateAssetPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import JobPlansPage from "./pages/JobPlansPage";
import PreventiveMaintenancePage from "./pages/PreventiveMaintenancePage";
import InventoryOverviewPage from "./pages/inventory/InventoryOverviewPage";
import ItemsStockPage from "./pages/inventory/ItemsStockPage";
import LocationsPage from "./pages/inventory/LocationsPage";
import ReorderManagementPage from "./pages/inventory/ReorderManagementPage";
import TransfersLoansPage from "./pages/inventory/TransfersLoansPage";
import PurchaseOrdersPage from "./pages/inventory/PurchaseOrdersPage";
import SuppliersPage from "./pages/inventory/SuppliersPage";
import InventoryReportsPage from "./pages/inventory/InventoryReportsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SafetyPage from "./pages/SafetyPage";
import SpatialPage from "./pages/SpatialPage";
import ReportsPage from "./pages/ReportsPage";
import BOMPage from "./pages/BOMPage";
import BOMDetailPage from "./pages/BOMDetailPage";
import SafetyIncidentsPage from "./pages/safety/SafetyIncidentsPage";
import SafetyHazardsPage from "./pages/safety/SafetyHazardsPage";
import LOTOProceduresPage from "./pages/safety/LOTOProceduresPage";
import PrecautionLibraryPage from "./pages/safety/PrecautionLibraryPage";
import CAPAManagementPage from "./pages/safety/CAPAManagementPage";
import SafetyReportsPage from "./pages/safety/SafetyReportsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={
              <AuthGuard>
                <Layout>
                  <Index />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/assets" element={
              <AuthGuard>
                <Layout>
                  <AssetsPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/assets/:id" element={
              <AuthGuard>
                <Layout>
                  <AssetDetailPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/assets/create" element={
              <AuthGuard>
                <Layout>
                  <CreateAssetPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/work-orders" element={
              <AuthGuard>
                <Layout>
                  <WorkOrdersPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/job-plans" element={
              <AuthGuard>
                <Layout>
                  <JobPlansPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/preventive-maintenance" element={
              <AuthGuard>
                <Layout>
                  <PreventiveMaintenancePage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/inventory" element={
              <AuthGuard>
                <Layout>
                  <InventoryOverviewPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/inventory/items" element={
              <AuthGuard>
                <Layout>
                  <ItemsStockPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/inventory/locations" element={
              <AuthGuard>
                <Layout>
                  <LocationsPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/inventory/reorder" element={
              <AuthGuard>
                <Layout>
                  <ReorderManagementPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/inventory/transfers" element={
              <AuthGuard>
                <Layout>
                  <TransfersLoansPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/inventory/purchase-orders" element={
              <AuthGuard>
                <Layout>
                  <PurchaseOrdersPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/inventory/suppliers" element={
              <AuthGuard>
                <Layout>
                  <SuppliersPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/inventory/reports" element={
              <AuthGuard>
                <Layout>
                  <InventoryReportsPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/analytics" element={
              <AuthGuard>
                <Layout>
                  <AnalyticsPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/integrations" element={
              <AuthGuard>
                <Layout>
                  <IntegrationsPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/safety" element={
              <AuthGuard>
                <Layout>
                  <SafetyPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/spatial" element={
              <AuthGuard>
                <Layout>
                  <SpatialPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/reports" element={
              <AuthGuard>
                <Layout>
                  <ReportsPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/bom" element={
              <AuthGuard>
                <Layout>
                  <BOMPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/bom/:id" element={
              <AuthGuard>
                <Layout>
                  <BOMDetailPage />
                </Layout>
              </AuthGuard>
            } />
            
            {/* Safety & HSE Routes */}
                <Route path="/safety/incidents" element={
                  <AuthGuard>
                    <Layout>
                      <SafetyIncidentsPage />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/safety/hazards" element={
                  <AuthGuard>
                    <Layout>
                      <SafetyHazardsPage />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/safety/loto" element={
                  <AuthGuard>
                    <Layout>
                      <LOTOProceduresPage />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/safety/precautions" element={
                  <AuthGuard>
                    <Layout>
                      <PrecautionLibraryPage />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/safety/capa" element={
                  <AuthGuard>
                    <Layout>
                      <CAPAManagementPage />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/safety/reports" element={
                  <AuthGuard>
                    <Layout>
                      <SafetyReportsPage />
                    </Layout>
                  </AuthGuard>
                } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
