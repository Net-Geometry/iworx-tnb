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
import WorkOrderDetailPage from "./pages/WorkOrderDetailPage";
import JobPlansPage from "./pages/JobPlansPage";
import PreventiveMaintenancePage from "./pages/PreventiveMaintenancePage";
import CreatePMSchedulePage from "./pages/CreatePMSchedulePage";
import EditPMSchedulePage from "./pages/EditPMSchedulePage";
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
import IncidentReportPage from "./pages/safety/IncidentReportPage";
import SafetyHazardsPage from "./pages/safety/SafetyHazardsPage";
import LOTOProceduresPage from "./pages/safety/LOTOProceduresPage";
import PrecautionLibraryPage from "./pages/safety/PrecautionLibraryPage";
import CAPAManagementPage from "./pages/safety/CAPAManagementPage";
import SafetyReportsPage from "./pages/safety/SafetyReportsPage";
import { AdminGuard } from "./components/auth/AdminGuard";
import SystemSettingsPage from "@/pages/admin/SystemSettingsPage";
import UserRegistrationPage from "@/pages/admin/UserRegistrationPage";
import UserManagementPage from "@/pages/admin/UserManagementPage";
import UserRolesPage from "@/pages/admin/UserRolesPage";
import RoleManagementPage from "@/pages/admin/RoleManagementPage";
import RoleFormPage from "@/pages/admin/RoleFormPage";
import OrganizationManagementPage from "./pages/admin/OrganizationManagementPage";
import ReferenceDataPage from "./pages/admin/ReferenceDataPage";
import CraftsManagementPage from "./pages/admin/CraftsManagementPage";
import SkillsManagementPage from "./pages/admin/SkillsManagementPage";
import BusinessAreasManagementPage from "./pages/admin/BusinessAreasManagementPage";
import PeopleLaborPage from "./pages/people-labor/PeopleLaborPage";
import PeopleManagementPage from "./pages/people-labor/PeopleManagementPage";
import PersonDetailPage from "./pages/people-labor/PersonDetailPage";
import EditPersonPage from "./pages/people-labor/EditPersonPage";
import TeamsManagementPage from "./pages/people-labor/TeamsManagementPage";
import SkillsLibraryPage from "./pages/people-labor/SkillsLibraryPage";
import MyVerticals from "./pages/MyVerticals";
import CrossProjectAnalytics from "./pages/CrossProjectAnalytics";
import MetersPage from "./pages/meters/MetersPage";
import MeterGroupsPage from "./pages/meters/MeterGroupsPage";

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
            <Route path="/meters" element={
              <AuthGuard>
                <Layout>
                  <MetersPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/meter-groups" element={
              <AuthGuard>
                <Layout>
                  <MeterGroupsPage />
                </Layout>
              </AuthGuard>
            } />
          <Route path="/work-orders/:id" element={
            <AuthGuard>
              <Layout>
                <WorkOrderDetailPage />
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
            <Route path="/preventive-maintenance/create" element={
              <AuthGuard>
                <Layout>
                  <CreatePMSchedulePage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/preventive-maintenance/edit/:id" element={
              <AuthGuard>
                <Layout>
                  <EditPMSchedulePage />
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
            <Route path="/analytics/cross-project" element={
              <AuthGuard>
                <Layout>
                  <CrossProjectAnalytics />
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
                <Route path="/safety/incidents/report" element={
                  <AuthGuard>
                    <Layout>
                      <IncidentReportPage />
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

            {/* People & Labor Routes */}
            <Route path="/people-labor" element={
              <AuthGuard>
                <Layout>
                  <PeopleLaborPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/people-labor/people" element={
              <AuthGuard>
                <Layout>
                  <PeopleManagementPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/people-labor/people/:id" element={
              <AuthGuard>
                <Layout>
                  <PersonDetailPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/people-labor/people/:id/edit" element={
              <AuthGuard>
                <Layout>
                  <EditPersonPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/people-labor/teams" element={
              <AuthGuard>
                <Layout>
                  <TeamsManagementPage />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/people-labor/skills" element={
              <AuthGuard>
                <Layout>
                  <SkillsLibraryPage />
                </Layout>
              </AuthGuard>
            } />

            {/* System Administration Routes */}
            <Route path="/admin/settings" element={
              <AdminGuard>
                <Layout>
                  <SystemSettingsPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/admin/users/register" element={
              <AdminGuard>
                <Layout>
                  <UserRegistrationPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/admin/user-management" element={
              <AdminGuard>
                <Layout>
                  <UserManagementPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/admin/users/:userId/roles" element={
              <AdminGuard>
                <Layout>
                  <UserRolesPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/admin/roles" element={
              <AdminGuard>
                <Layout>
                  <RoleManagementPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/admin/roles/new" element={
              <AdminGuard>
                <Layout>
                  <RoleFormPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/admin/roles/:id/edit" element={
              <AdminGuard>
                <Layout>
                  <RoleFormPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/admin/organizations" element={
              <AdminGuard>
                <Layout>
                  <OrganizationManagementPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/admin/reference-data" element={
              <AdminGuard>
                <Layout>
                  <ReferenceDataPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/admin/reference-data/crafts" element={
              <AdminGuard>
                <Layout>
                  <CraftsManagementPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/admin/reference-data/skills" element={
              <AdminGuard>
                <Layout>
                  <SkillsManagementPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/admin/reference-data/business-areas" element={
              <AdminGuard>
                <Layout>
                  <BusinessAreasManagementPage />
                </Layout>
              </AdminGuard>
            } />
            {/* Legacy route - redirect to new location */}
            <Route path="/admin/crafts" element={
              <AdminGuard>
                <Layout>
                  <CraftsManagementPage />
                </Layout>
              </AdminGuard>
            } />
            <Route path="/my-verticals" element={
              <AuthGuard>
                <Layout>
                  <MyVerticals />
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
