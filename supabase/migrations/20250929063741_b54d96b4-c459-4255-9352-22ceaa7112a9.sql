-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  contact_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  address TEXT,
  website VARCHAR,
  tax_id VARCHAR,
  payment_terms INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_locations table
CREATE TABLE public.inventory_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  code VARCHAR UNIQUE,
  location_type VARCHAR DEFAULT 'warehouse', -- warehouse, storage, bin, shelf
  parent_location_id UUID REFERENCES public.inventory_locations(id),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  capacity_limit NUMERIC,
  current_utilization NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_number VARCHAR UNIQUE,
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR,
  subcategory VARCHAR,
  unit_of_measure VARCHAR DEFAULT 'each',
  current_stock NUMERIC DEFAULT 0,
  reserved_stock NUMERIC DEFAULT 0,
  available_stock NUMERIC GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  reorder_point NUMERIC DEFAULT 0,
  reorder_quantity NUMERIC DEFAULT 0,
  max_stock_level NUMERIC,
  unit_cost NUMERIC,
  last_cost NUMERIC,
  average_cost NUMERIC,
  barcode VARCHAR,
  qr_code_data TEXT,
  is_serialized BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  supplier_id UUID REFERENCES public.suppliers(id),
  lead_time_days INTEGER DEFAULT 0,
  safety_stock NUMERIC DEFAULT 0,
  item_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_item_locations table for multi-location stock
CREATE TABLE public.inventory_item_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.inventory_locations(id) ON DELETE CASCADE,
  quantity NUMERIC DEFAULT 0,
  reserved_quantity NUMERIC DEFAULT 0,
  available_quantity NUMERIC GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  bin_location VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(item_id, location_id)
);

-- Create inventory_transactions table
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  location_id UUID REFERENCES public.inventory_locations(id),
  transaction_type VARCHAR NOT NULL, -- receipt, issue, adjustment, transfer_out, transfer_in
  quantity NUMERIC NOT NULL,
  unit_cost NUMERIC,
  total_cost NUMERIC,
  reference_type VARCHAR, -- purchase_order, work_order, adjustment, transfer
  reference_id UUID,
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number VARCHAR UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  status VARCHAR DEFAULT 'draft', -- draft, pending_approval, approved, sent, partially_received, received, cancelled
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  delivery_date DATE,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  currency VARCHAR DEFAULT 'USD',
  payment_terms INTEGER DEFAULT 30,
  delivery_address TEXT,
  notes TEXT,
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory_items(id),
  item_description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
  received_quantity NUMERIC DEFAULT 0,
  remaining_quantity NUMERIC GENERATED ALWAYS AS (quantity - received_quantity) STORED,
  expected_delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_transfers table
CREATE TABLE public.inventory_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_number VARCHAR UNIQUE NOT NULL,
  from_location_id UUID NOT NULL REFERENCES public.inventory_locations(id),
  to_location_id UUID NOT NULL REFERENCES public.inventory_locations(id),
  status VARCHAR DEFAULT 'pending', -- pending, in_transit, completed, cancelled
  transfer_type VARCHAR DEFAULT 'transfer', -- transfer, loan
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  shipped_by UUID REFERENCES auth.users(id),
  received_by UUID REFERENCES auth.users(id),
  request_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ship_date TIMESTAMP WITH TIME ZONE,
  expected_arrival_date TIMESTAMP WITH TIME ZONE,
  received_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_transfer_items table
CREATE TABLE public.inventory_transfer_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id UUID NOT NULL REFERENCES public.inventory_transfers(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  quantity_requested NUMERIC NOT NULL,
  quantity_shipped NUMERIC DEFAULT 0,
  quantity_received NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_loans table
CREATE TABLE public.inventory_loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_number VARCHAR UNIQUE NOT NULL,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  borrower_name VARCHAR NOT NULL,
  borrower_email VARCHAR,
  borrower_department VARCHAR,
  from_location_id UUID NOT NULL REFERENCES public.inventory_locations(id),
  quantity NUMERIC NOT NULL,
  loan_date DATE DEFAULT CURRENT_DATE,
  expected_return_date DATE NOT NULL,
  actual_return_date DATE,
  status VARCHAR DEFAULT 'active', -- active, returned, overdue, lost
  notes TEXT,
  loaned_by UUID REFERENCES auth.users(id),
  returned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_item_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_loans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for suppliers
CREATE POLICY "Anyone can view suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for inventory_locations
CREATE POLICY "Anyone can view locations" ON public.inventory_locations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage locations" ON public.inventory_locations FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for inventory_items
CREATE POLICY "Anyone can view items" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage items" ON public.inventory_items FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for inventory_item_locations
CREATE POLICY "Anyone can view item locations" ON public.inventory_item_locations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage item locations" ON public.inventory_item_locations FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for inventory_transactions
CREATE POLICY "Anyone can view transactions" ON public.inventory_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage transactions" ON public.inventory_transactions FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for purchase_orders
CREATE POLICY "Anyone can view purchase orders" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage purchase orders" ON public.purchase_orders FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for purchase_order_items
CREATE POLICY "Anyone can view PO items" ON public.purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage PO items" ON public.purchase_order_items FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for inventory_transfers
CREATE POLICY "Anyone can view transfers" ON public.inventory_transfers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage transfers" ON public.inventory_transfers FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for inventory_transfer_items
CREATE POLICY "Anyone can view transfer items" ON public.inventory_transfer_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage transfer items" ON public.inventory_transfer_items FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for inventory_loans
CREATE POLICY "Anyone can view loans" ON public.inventory_loans FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage loans" ON public.inventory_loans FOR ALL USING (auth.uid() IS NOT NULL);

-- Create update triggers for updated_at columns
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_locations_updated_at BEFORE UPDATE ON public.inventory_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_item_locations_updated_at BEFORE UPDATE ON public.inventory_item_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_order_items_updated_at BEFORE UPDATE ON public.purchase_order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_transfers_updated_at BEFORE UPDATE ON public.inventory_transfers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_transfer_items_updated_at BEFORE UPDATE ON public.inventory_transfer_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_loans_updated_at BEFORE UPDATE ON public.inventory_loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_item_number ON public.inventory_items(item_number);
CREATE INDEX idx_inventory_items_barcode ON public.inventory_items(barcode);
CREATE INDEX idx_inventory_items_supplier ON public.inventory_items(supplier_id);
CREATE INDEX idx_inventory_transactions_item ON public.inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_date ON public.inventory_transactions(transaction_date);
CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_inventory_transfers_locations ON public.inventory_transfers(from_location_id, to_location_id);
CREATE INDEX idx_inventory_loans_status ON public.inventory_loans(status);
CREATE INDEX idx_inventory_loans_return_date ON public.inventory_loans(expected_return_date);