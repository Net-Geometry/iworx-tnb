/**
 * IoT Devices Page
 * 
 * Main page for IoT device registration, management, and monitoring
 * Located under Core Asset Management section
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio, Plus, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIoTDevices, useDeleteIoTDevice } from "@/hooks/useIoTDevices";
import { useIoTDeviceTypes } from "@/hooks/useIoTDeviceTypes";
import { useAuth } from "@/contexts/AuthContext";
import { IoTDeviceTable } from "@/components/iot-devices/IoTDeviceTable";
import { IoTWebhookSetup } from "@/components/iot-devices/IoTWebhookSetup";
import { IoTDeviceEditDialog } from "@/components/iot-devices/IoTDeviceEditDialog";

import { IoTMeterMappingForm } from "@/components/iot-devices/IoTMeterMappingForm";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function IoTDevicesPage() {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const [isWebhookGuideOpen, setIsWebhookGuideOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("all");
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [mappingDevice, setMappingDevice] = useState<any>(null);
  const [deletingDevice, setDeletingDevice] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const deleteDevice = useDeleteIoTDevice();

  const { data: devices = [], isLoading } = useIoTDevices(currentOrganization?.id);
  const { data: deviceTypes = [] } = useIoTDeviceTypes(currentOrganization?.id);

  // Calculate KPIs
  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => {
    if (d.status !== 'active') return false;
    if (!d.last_seen_at) return false;
    const minutesSince = (Date.now() - new Date(d.last_seen_at).getTime()) / 60000;
    return minutesSince < 60;
  }).length;
  const neverSeenDevices = devices.filter(d => {
    return d.status === 'active' && !d.last_seen_at;
  }).length;
  const offlineDevices = devices.filter(d => {
    if (d.status !== 'active') return false;
    if (!d.last_seen_at) return false; // Never seen counted separately
    const minutesSince = (Date.now() - new Date(d.last_seen_at).getTime()) / 60000;
    return minutesSince > 1440; // 24 hours
  }).length;

  // Filter devices
  const filteredDevices = devices.filter(device => {
    const matchesSearch = searchQuery === "" || 
      device.device_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.dev_eui?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    const matchesType = deviceTypeFilter === "all" || device.device_type_id === deviceTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDevices.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDevices = filteredDevices.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDeviceTypeFilterChange = (value: string) => {
    setDeviceTypeFilter(value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deletingDevice) return;
    
    try {
      await deleteDevice.mutateAsync(deletingDevice.id);
      setDeletingDevice(null);
    } catch (error) {
      console.error("Failed to delete device:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Radio className="h-8 w-8 text-primary" />
            IoT Device Registration
          </h1>
          <p className="text-muted-foreground mt-1">
            Register and manage IoT devices for real-time asset monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsWebhookGuideOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Webhook Setup
          </Button>
          <Button onClick={() => navigate("/iot-devices/register")}>
            <Plus className="h-4 w-4 mr-2" />
            Register Device
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Devices</CardDescription>
            <CardTitle className="text-3xl">{totalDevices}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Online</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {activeDevices}
              <Badge variant="default" className="bg-accent-success text-accent-success-foreground text-xs">
                Connected
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {neverSeenDevices}
              <Badge variant="destructive" className="text-xs">
                Awaiting
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Offline</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {offlineDevices}
              <Badge variant="destructive" className="text-xs">
                24h+
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Device Types</CardDescription>
            <CardTitle className="text-3xl">{deviceTypes.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by name or DevEUI..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deviceTypeFilter} onValueChange={handleDeviceTypeFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {deviceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Device Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Devices</CardTitle>
          <CardDescription>
            Manage your IoT devices and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IoTDeviceTable 
            devices={paginatedDevices} 
            isLoading={isLoading}
            onEdit={(device) => setEditingDevice(device)}
            onViewDetails={(device) => navigate(`/iot-devices/${device.id}`)}
            onConfigureMapping={(device) => setMappingDevice(device)}
            onDelete={(device) => setDeletingDevice(device)}
          />

          {/* Pagination Controls */}
          {filteredDevices.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 mt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredDevices.length)} of {filteredDevices.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Setup Guide */}
      <IoTWebhookSetup
        isOpen={isWebhookGuideOpen}
        onClose={() => setIsWebhookGuideOpen(false)}
      />

      {/* Device Edit Dialog */}
      <IoTDeviceEditDialog
        device={editingDevice}
        isOpen={!!editingDevice}
        onClose={() => setEditingDevice(null)}
        onSuccess={() => setEditingDevice(null)}
      />


      {/* Meter Mapping Form */}
      <IoTMeterMappingForm
        isOpen={!!mappingDevice}
        onClose={() => setMappingDevice(null)}
        deviceId={mappingDevice?.id}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDevice} onOpenChange={() => setDeletingDevice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete IoT Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingDevice?.device_name}</strong>?
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDevice.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
