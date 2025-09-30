import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const locationSchema = z.object({
  name: z.string().min(1, "Location name is required").max(255),
  code: z.string().optional(),
  location_type: z.string().default("warehouse"),
  address: z.string().optional(),
  capacity_limit: z.string().optional(),
  parent_location_id: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface AddLocationDialogProps {
  onLocationAdded?: () => void;
}

export function AddLocationDialog({ onLocationAdded }: AddLocationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentOrganization } = useAuth();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      code: "",
      location_type: "warehouse",
      address: "",
      capacity_limit: "",
      parent_location_id: "",
    },
  });

  const onSubmit = async (data: LocationFormData) => {
    setIsLoading(true);
    try {
      const locationData = {
        name: data.name,
        code: data.code || null,
        location_type: data.location_type,
        address: data.address || null,
        capacity_limit: data.capacity_limit ? Number(data.capacity_limit) : null,
        parent_location_id: data.parent_location_id || null,
        organization_id: currentOrganization?.id,
      };

      const { error } = await supabase
        .from("inventory_locations")
        .insert([locationData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location added successfully",
      });

      form.reset();
      setOpen(false);
      onLocationAdded?.();
    } catch (error) {
      console.error("Error adding location:", error);
      toast({
        title: "Error",
        description: "Failed to add location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Create a new inventory storage location. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Warehouse, Storage Room A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., WH-01, ST-A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="storage">Storage Room</SelectItem>
                      <SelectItem value="bin">Bin</SelectItem>
                      <SelectItem value="zone">Zone</SelectItem>
                      <SelectItem value="aisle">Aisle</SelectItem>
                      <SelectItem value="shelf">Shelf</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Physical address or location description" 
                      className="resize-none"
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity Limit</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Maximum capacity (sq ft, cubic meters, etc.)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Location"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}