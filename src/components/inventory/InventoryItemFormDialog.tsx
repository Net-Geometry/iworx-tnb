import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateInventoryItem, useUpdateInventoryItem, type InventoryItem } from "@/hooks/useInventoryItems";
import { useSuppliers } from "@/hooks/useSuppliers";
import { Loader2 } from "lucide-react";

const itemSchema = z.object({
  item_number: z.string().optional(),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  unit_of_measure: z.string().optional(),
  barcode: z.string().optional(),
  current_stock: z.string().optional(),
  reorder_point: z.string().optional(),
  reorder_quantity: z.string().optional(),
  safety_stock: z.string().optional(),
  max_stock_level: z.string().optional(),
  unit_cost: z.string().optional(),
  supplier_id: z.string().optional(),
  is_serialized: z.boolean().default(false),
  is_active: z.boolean().default(true),
  lead_time_days: z.string().optional(),
  item_image_url: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface InventoryItemFormDialogProps {
  mode: 'add' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
}

export const InventoryItemFormDialog: React.FC<InventoryItemFormDialogProps> = ({
  mode,
  open,
  onOpenChange,
  item,
}) => {
  const { data: suppliers = [] } = useSuppliers();
  const createItemMutation = useCreateInventoryItem();
  const updateItemMutation = useUpdateInventoryItem();

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      item_number: "",
      name: "",
      description: "",
      category: "",
      subcategory: "",
      unit_of_measure: "each",
      barcode: "",
      current_stock: "0",
      reorder_point: "0",
      reorder_quantity: "0",
      safety_stock: "0",
      max_stock_level: "",
      unit_cost: "",
      supplier_id: "",
      is_serialized: false,
      is_active: true,
      lead_time_days: "0",
      item_image_url: "",
    },
  });

  // Update form when item changes for edit mode
  useEffect(() => {
    if (mode === 'edit' && item && open) {
      form.reset({
        item_number: item.item_number || "",
        name: item.name,
        description: item.description || "",
        category: item.category || "",
        subcategory: item.subcategory || "",
        unit_of_measure: item.unit_of_measure || "each",
        barcode: item.barcode || "",
        current_stock: item.current_stock?.toString() || "0",
        reorder_point: item.reorder_point?.toString() || "0",
        reorder_quantity: item.reorder_quantity?.toString() || "0",
        safety_stock: item.safety_stock?.toString() || "0",
        max_stock_level: item.max_stock_level?.toString() || "",
        unit_cost: item.unit_cost?.toString() || "",
        supplier_id: item.supplier_id || "",
        is_serialized: item.is_serialized || false,
        is_active: item.is_active !== false,
        lead_time_days: item.lead_time_days?.toString() || "0",
        item_image_url: item.item_image_url || "",
      });
    } else if (mode === 'add' && open) {
      form.reset({
        item_number: "",
        name: "",
        description: "",
        category: "",
        subcategory: "",
        unit_of_measure: "each",
        barcode: "",
        current_stock: "0",
        reorder_point: "0",
        reorder_quantity: "0",
        safety_stock: "0",
        max_stock_level: "",
        unit_cost: "",
        supplier_id: "",
        is_serialized: false,
        is_active: true,
        lead_time_days: "0",
        item_image_url: "",
      });
    }
  }, [mode, item, open, form]);

  const onSubmit = async (data: ItemFormData) => {
    try {
      const itemData = {
        item_number: data.item_number || undefined,
        name: data.name,
        description: data.description || undefined,
        category: data.category || undefined,
        subcategory: data.subcategory || undefined,
        unit_of_measure: data.unit_of_measure || "each",
        barcode: data.barcode || undefined,
        current_stock: data.current_stock ? Number(data.current_stock) : 0,
        reorder_point: data.reorder_point ? Number(data.reorder_point) : 0,
        reorder_quantity: data.reorder_quantity ? Number(data.reorder_quantity) : 0,
        safety_stock: data.safety_stock ? Number(data.safety_stock) : 0,
        max_stock_level: data.max_stock_level ? Number(data.max_stock_level) : undefined,
        unit_cost: data.unit_cost ? Number(data.unit_cost) : undefined,
        lead_time_days: data.lead_time_days ? Number(data.lead_time_days) : 0,
        supplier_id: data.supplier_id || undefined,
        is_serialized: data.is_serialized,
        is_active: data.is_active,
        item_image_url: data.item_image_url || undefined,
      };

      if (mode === 'add') {
        await createItemMutation.mutateAsync(itemData);
      } else if (mode === 'edit' && item) {
        await updateItemMutation.mutateAsync({ id: item.id, itemData });
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(`Failed to ${mode} item:`, error);
    }
  };

  const categories = [
    "Hydraulics", "Bearings", "Safety", "Couplings", "Filters", 
    "Motors", "Pumps", "Valves", "Seals", "Tools", "Electrical", "Other"
  ];

  const unitOptions = [
    "each", "piece", "box", "case", "gallon", "liter", "meter", "foot", 
    "kilogram", "pound", "set", "roll", "sheet"
  ];

  const isLoading = createItemMutation.isPending || updateItemMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Inventory Item' : 'Edit Inventory Item'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="item_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., HYD-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter item description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subcategory" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit_of_measure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measure</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter barcode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="current_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reorder_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Point</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reorder_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="safety_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="max_stock_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Stock Level</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Cost ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lead_time_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Time (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="item_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name="is_serialized"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Serialized Item</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === 'add' ? 'Add Item' : 'Update Item'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};