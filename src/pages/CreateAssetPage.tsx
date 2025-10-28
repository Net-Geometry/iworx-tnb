import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import AssetManagementForm from '@/components/assets/AssetManagementForm';

const CreateAssetPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/assets');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
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
            <BreadcrumbLink href="/assets">Asset Management</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Create Asset</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assets
          </Button>
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Asset</h1>
            <p className="text-muted-foreground">Add a new asset to your inventory management system</p>
          </div>
        </div>
      </div>

      {/* Asset Form */}
      <div className="max-w-6xl w-full">
        <div className="bg-card rounded-lg border border-border/50 p-6">
          <AssetManagementForm onClose={handleClose} mode="page" />
        </div>
      </div>
    </div>
  );
};

export default CreateAssetPage;