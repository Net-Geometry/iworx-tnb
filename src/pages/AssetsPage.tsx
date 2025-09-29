import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Plus, Download, Upload, LayoutGrid, List, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AssetKPICards } from "@/components/assets/AssetKPICards";
import { AssetTable } from "@/components/assets/AssetTable";
import { AssetHierarchy } from "@/components/assets/AssetHierarchy";
import { AssetDetailsPanel } from "@/components/assets/AssetDetailsPanel";
import { FilterBar } from "@/components/assets/FilterBar";

const AssetsPage = () => {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Asset Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Asset Management</h1>
            <p className="text-muted-foreground">Comprehensive asset lifecycle management and monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => navigate('/assets/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Asset
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <AssetKPICards />

      {/* Main Content Area */}
      <div className="flex gap-6 h-[calc(100vh-300px)]">
        {/* Left Sidebar - Hierarchy */}
        <div className="w-80 bg-card rounded-lg border border-border/50">
          <AssetHierarchy onNodeSelect={(node) => console.log('Selected node:', node)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Filter Bar */}
          <FilterBar onFiltersChange={(filters) => console.log('Filters:', filters)} />

          {/* View Toggle & Asset List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">1,247 assets</span>
                <span className="text-xs text-muted-foreground">• 23 critical</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Asset Table/Grid */}
            <div className="bg-card rounded-lg border border-border/50">
              <AssetTable onAssetSelect={setSelectedAsset} />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Asset Details */}
        {selectedAsset && (
          <AssetDetailsPanel 
            asset={selectedAsset} 
            onClose={() => setSelectedAsset(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default AssetsPage;