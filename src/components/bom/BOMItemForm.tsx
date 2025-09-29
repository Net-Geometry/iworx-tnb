import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useBOMItems, BOMItem } from "@/hooks/useBOMs";
import { InventoryItemSelector } from "./InventoryItemSelector";
import { InventoryItem } from "@/hooks/useInventoryItems";

const bomItemSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  item_number: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  item_type: z.enum(['part', 'material', 'tool', 'consumable']),
  cost_per_unit: z.number().min(0).optional(),
  lead_time_days: z.number().min(0).optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
  inventory_item_id: z.string().optional(),
});

type BOMItemFormData = z.infer<typeof bomItemSchema>;

interface BOMItemFormProps {
  bomId: string;
  item?: BOMItem;
  onSuccess?: () => void;
}

export const BOMItemForm = ({ bomId, item, onSuccess }: BOMItemFormProps) => {
  const { addBOMItem, updateBOMItem } = useBOMItems(bomId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [mode, setMode] = useState<"inventory" | "manual">("inventory");

  const form = useForm<BOMItemFormData>({
    resolver: zodResolver(bomItemSchema),
    defaultValues: {
      item_name: item?.item_name || "",
      item_number: item?.item_number || "",
      description: item?.description || "",
      quantity: item?.quantity || 1,
      unit: item?.unit || "each",
      item_type: item?.item_type || "part",
      cost_per_unit: item?.cost_per_unit || undefined,
      lead_time_days: item?.lead_time_days || undefined,
      supplier: item?.supplier || "",
      notes: item?.notes || "",
      inventory_item_id: undefined,
    },
  });

  // Auto-populate form when inventory item is selected
  useEffect(() => {
    if (selectedInventoryItem && mode === "inventory") {
      form.setValue("item_name", selectedInventoryItem.name);
      form.setValue("item_number", selectedInventoryItem.item_number || "");
      form.setValue("description", selectedInventoryItem.description || "");
      form.setValue("unit", selectedInventoryItem.unit_of_measure || "each");
      form.setValue("cost_per_unit", selectedInventoryItem.unit_cost || undefined);
      form.setValue("lead_time_days", selectedInventoryItem.lead_time_days || undefined);
      form.setValue("supplier", ""); // Will be populated from supplier relationship
      form.setValue("inventory_item_id", selectedInventoryItem.id);
      
      // Set item type based on category or default to part
      const categoryToType: Record<string, "part" | "material" | "tool" | "consumable"> = {
        "Tools": "tool",
        "Materials": "material",
        "Consumables": "consumable",
      };
      const itemType = selectedInventoryItem.category ? categoryToType[selectedInventoryItem.category] || "part" : "part";
      form.setValue("item_type", itemType);
    }
  }, [selectedInventoryItem, mode, form]);

  const onSubmit = async (data: BOMItemFormData) => {
    try {
      setIsSubmitting(true);
      
      const bomItemData = {
        ...data,
        inventory_item_id: mode === "inventory" ? selectedInventoryItem?.id : null,
      };
      
      if (item) {
        await updateBOMItem(item.id, bomItemData);
      } else {
        await addBOMItem({
          ...bomItemData,
          bom_id: bomId,
          level: 0,
        } as Omit<BOMItem, 'id' | 'created_at' | 'updated_at'>);
      }
      
      onSuccess?.();
      if (!item) {
        form.reset();
        setSelectedInventoryItem(null);
      }
    } catch (error) {
      console.error('Failed to save BOM item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={mode} onValueChange={(value) => setMode(value as "inventory" | "manual")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory">Select from Inventory</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory" className="space-y-4">
            <InventoryItemSelector 
              selectedItem={selectedInventoryItem}
              onSelectItem={setSelectedInventoryItem}
            />
            {selectedInventoryItem && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Linked to Inventory Item
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMode("manual");
                      setSelectedInventoryItem(null);
                    }}
                  >
                    Convert to Manual Entry
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
              Manual entry mode allows you to create custom BOM items that are not linked to inventory.
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="item_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="item_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item number" {...field} />
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
                <Textarea 
                  placeholder="Enter item description" 
                  className="min-h-[60px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input placeholder="each, kg, m, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="item_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="part">Part</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cost_per_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost per Unit ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                  <Input 
                    type="number"
                    placeholder="7"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <FormControl>
                <Input placeholder="Enter supplier name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes or specifications" 
                  className="min-h-[60px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : item ? "Update Item" : "Add Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
};