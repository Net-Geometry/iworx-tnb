/**
 * Register IoT Device Page
 * Full-page form for registering new IoT devices with validation
 * Microservices-based implementation with proper code structure
 */

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { IoTDeviceTypeSelector } from "@/components/iot-devices/IoTDeviceTypeSelector";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const iotDeviceSchema = z.object({
  device_name: z.string().min(3, "Name must be at least 3 characters").max(100),
  dev_eui: z.string()
    .regex(/^[0-9A-Fa-f]{14,16}$/, "DevEUI must be 14-16 hexadecimal characters")
    .transform(val => val.toUpperCase()),
  device_identifier: z.string().optional(),
  network_provider: z.enum(['ttn', 'chirpstack', 'aws_iot_core']),
  device_type_id: z.string().uuid().optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
  asset_id: z.string().uuid().optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
  app_key: z.string().regex(/^[0-9A-Fa-f]{32}$/, "App Key must be 32 hex characters").or(z.literal("")).transform(val => val === "" ? undefined : val).optional(),
  app_eui: z.string().regex(/^[0-9A-Fa-f]{14,16}$/, "App EUI must be 14-16 hex characters").or(z.literal("")).transform(val => val === "" ? undefined : val).optional(),
  activation_mode: z.enum(['OTAA', 'ABP']).optional(),
  frequency_plan: z.string().optional(),
});

type IoTDeviceFormData = z.infer<typeof iotDeviceSchema>;

export default function RegisterIoTDevicePage() {
  const navigate = useNavigate();
  const { currentOrganization, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const form = useForm<IoTDeviceFormData>({
    resolver: zodResolver(iotDeviceSchema),
    defaultValues: {
      device_name: "",
      dev_eui: "",
      device_identifier: "",
      network_provider: "ttn",
      device_type_id: undefined,
      asset_id: undefined,
      app_key: "",
      app_eui: "",
      activation_mode: "OTAA",
      frequency_plan: "EU868",
    },
  });

  const onSubmit = async (data: IoTDeviceFormData) => {
    if (!currentOrganization?.id || !user?.id) {
      toast.error("Organization or user not found");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare lorawan_config
      const lorawanConfig: any = {};
      if (data.app_key) lorawanConfig.app_key = data.app_key;
      if (data.app_eui) lorawanConfig.app_eui = data.app_eui;
      if (data.activation_mode) lorawanConfig.activation_mode = data.activation_mode;
      if (data.frequency_plan) lorawanConfig.frequency_plan = data.frequency_plan;

      const { data: device, error } = await supabase
        .from('iot_devices')
        .insert({
          device_name: data.device_name,
          dev_eui: data.dev_eui,
          device_identifier: data.device_identifier || null,
          network_provider: data.network_provider,
          device_type_id: data.device_type_id || null,
          asset_id: data.asset_id || null,
          lorawan_config: Object.keys(lorawanConfig).length > 0 ? lorawanConfig : null,
          organization_id: currentOrganization.id,
          created_by: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(
        <div>
          <p className="font-semibold">Device registered successfully!</p>
          <p className="text-sm mt-1">DevEUI: {device.dev_eui}</p>
        </div>
      );

      // Navigate back to IoT devices list
      navigate("/iot-devices");
    } catch (error: any) {
      console.error("Error creating device:", error);
      toast.error(`Failed to register device: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/iot-devices")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Register IoT Device</h1>
          <p className="text-muted-foreground">
            Configure a new IoT device to collect sensor data from physical assets
          </p>
        </div>
      </div>

      {/* Registration Form */}
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="device_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Temperature Sensor 01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dev_eui"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DevEUI *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0123456789ABCDEF" 
                          maxLength={16}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.replace(/[^0-9A-Fa-f]/g, ''))}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between items-center">
                        <span>14-16 hexadecimal characters</span>
                        <span className={field.value.length >= 14 && field.value.length <= 16 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                          {field.value.length}/14-16
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="device_identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Identifier (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="TEMP-SENSOR-01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Configuration */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Configuration</h3>

                <FormField
                  control={form.control}
                  name="network_provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Network Provider *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select network provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ttn">The Things Network (TTN)</SelectItem>
                          <SelectItem value="chirpstack">ChirpStack</SelectItem>
                          <SelectItem value="aws_iot_core">AWS IoT Core</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="device_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Type</FormLabel>
                      <FormControl>
                        <IoTDeviceTypeSelector
                          value={field.value}
                          onChange={field.onChange}
                          organizationId={currentOrganization?.id}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Advanced LoRaWAN Settings */}
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold hover:text-primary">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                  Advanced LoRaWAN Settings
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="app_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>App Key</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="0123456789ABCDEF0123456789ABCDEF"
                            maxLength={32}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.replace(/[^0-9A-Fa-f]/g, ''))}
                          />
                        </FormControl>
                        <FormDescription className="flex justify-between items-center">
                          <span>32 hexadecimal characters</span>
                          <span className={field.value.length === 32 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                            {field.value.length}/32
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="app_eui"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>App EUI / Join EUI</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="0123456789ABCDEF"
                            maxLength={16}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.replace(/[^0-9A-Fa-f]/g, ''))}
                          />
                        </FormControl>
                        <FormDescription className="flex justify-between items-center">
                          <span>14-16 hexadecimal characters</span>
                          <span className={field.value.length >= 14 && field.value.length <= 16 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                            {field.value.length}/14-16
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="activation_mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activation Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="OTAA">OTAA (Over-the-Air Activation)</SelectItem>
                            <SelectItem value="ABP">ABP (Activation By Personalization)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="frequency_plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency Plan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EU868">EU868</SelectItem>
                            <SelectItem value="US915">US915</SelectItem>
                            <SelectItem value="AS923">AS923</SelectItem>
                            <SelectItem value="AU915">AU915</SelectItem>
                            <SelectItem value="KR920">KR920</SelectItem>
                            <SelectItem value="IN865">IN865</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/iot-devices")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Register Device"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
