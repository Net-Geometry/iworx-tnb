/**
 * IoT Devices Page
 * 
 * Main page for IoT device registration, management, and monitoring
 * Located under Core Asset Management section
 */

import { useState } from "react";
import { Radio, Plus, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIoTDevices } from "@/hooks/useIoTDevices";
import { useIoTDeviceTypes } from "@/hooks/useIoTDeviceTypes";
import { useAuth } from "@/contexts/AuthContext";
import { IoTDeviceTable } from "@/components/iot-devices/IoTDeviceTable";
import { IoTDeviceForm } from "@/components/iot-devices/IoTDeviceForm";
import { IoTWebhookSetup } from "@/components/iot-devices/IoTWebhookSetup";
import { Badge } from "@/components/ui/badge";

export default function IoTDevicesPage() {
  const { currentOrganization } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isWebhookGuideOpen, setIsWebhookGuideOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("all");

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
  const offlineDevices = devices.filter(d => {
    if (d.status !== 'active') return false;
    if (!d.last_seen_at) return true;
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
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Register Device
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Devices</CardDescription>
            <CardTitle className="text-3xl">{totalDevices}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Devices</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {activeDevices}
              <Badge variant="default" className="bg-accent-success text-accent-success-foreground">
                Online
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Offline Devices</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {offlineDevices}
              <Badge variant="destructive">
                Offline
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
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
            devices={filteredDevices} 
            isLoading={isLoading}
            onEdit={(device) => {
              // TODO: Implement edit functionality
              console.log("Edit device:", device);
            }}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <IoTDeviceForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          setIsWebhookGuideOpen(true);
        }}
      />

      <IoTWebhookSetup
        isOpen={isWebhookGuideOpen}
        onClose={() => setIsWebhookGuideOpen(false)}
      />
    </div>
  );
}
