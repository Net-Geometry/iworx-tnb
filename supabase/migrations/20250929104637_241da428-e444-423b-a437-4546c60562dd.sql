-- Add inventory_item_id column to bom_items table to link to inventory items
ALTER TABLE public.bom_items 
ADD COLUMN inventory_item_id uuid REFERENCES public.inventory_items(id);

-- Create index for better performance when querying by inventory item
CREATE INDEX idx_bom_items_inventory_item_id ON public.bom_items(inventory_item_id);

-- Add comment to document the relationship
COMMENT ON COLUMN public.bom_items.inventory_item_id IS 'Optional reference to inventory item - allows BOM items to be linked to existing inventory or manually created';