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
import PreventiveMaintenancePage from "./pages/PreventiveMaintenancePage";
import InventoryPage from "./pages/InventoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MobileOperationsPage from "./pages/MobileOperationsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SafetyPage from "./pages/SafetyPage";
import SpatialPage from "./pages/SpatialPage";
import ReportsPage from "./pages/ReportsPage";
import BOMPage from "./pages/BOMPage";
import BOMDetailPage from "./pages/BOMDetailPage";

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
                  <InventoryPage />
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
            <Route path="/mobile-operations" element={
              <AuthGuard>
                <Layout>
                  <MobileOperationsPage />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
