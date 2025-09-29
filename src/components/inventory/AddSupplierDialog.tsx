import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Star } from 'lucide-react';
import { useSuppliers, CreateSupplierData } from '@/hooks/useSuppliers';
import { useToast } from '@/hooks/use-toast';

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(100, 'Name must be less than 100 characters'),
  contact_name: z.string().max(100, 'Contact name must be less than 100 characters').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional().or(z.literal('')),
  address: z.string().max(500, 'Address must be less than 500 characters').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').max(255, 'Website must be less than 255 characters').optional().or(z.literal('')),
  tax_id: z.string().max(50, 'Tax ID must be less than 50 characters').optional().or(z.literal('')),
  payment_terms: z.number().min(0, 'Payment terms must be positive').max(365, 'Payment terms must be less than 365 days').optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().or(z.literal(''))
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface AddSupplierDialogProps {
  children?: React.ReactNode;
}

export function AddSupplierDialog({ children }: AddSupplierDialogProps) {
  const [open, setOpen] = useState(false);
  const { addSupplier } = useSuppliers();
  const { toast } = useToast();

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      tax_id: '',
      payment_terms: 30,
      rating: undefined,
      notes: ''
    }
  });

  const onSubmit = async (data: SupplierFormData) => {
    try {
      // Convert empty strings to null for optional fields
      const supplierData: CreateSupplierData = {
        name: data.name,
        contact_name: data.contact_name || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        website: data.website || null,
        tax_id: data.tax_id || null,
        payment_terms: data.payment_terms,
        rating: data.rating,
        notes: data.notes || null,
        is_active: true
      };

      await addSupplier.mutateAsync(supplierData);
      
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
      
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add supplier. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Supplier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter supplier name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contact_name">Contact Person</Label>
              <Input
                id="contact_name"
                {...form.register('contact_name')}
                placeholder="Contact person name"
              />
              {form.formState.errors.contact_name && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.contact_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="supplier@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="+1 (555) 123-4567"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...form.register('website')}
                placeholder="https://supplier.com"
              />
              {form.formState.errors.website && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.website.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input
                id="tax_id"
                {...form.register('tax_id')}
                placeholder="Tax identification number"
              />
              {form.formState.errors.tax_id && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.tax_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="payment_terms">Payment Terms (Days)</Label>
              <Input
                id="payment_terms"
                type="number"
                {...form.register('payment_terms', { valueAsNumber: true })}
                placeholder="30"
              />
              {form.formState.errors.payment_terms && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.payment_terms.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={form.watch('rating')?.toString() || ''}
                onValueChange={(value) => form.setValue('rating', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.rating && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.rating.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...form.register('address')}
                placeholder="Full address"
                rows={2}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Additional notes about the supplier"
                rows={3}
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.notes.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addSupplier.isPending}>
              {addSupplier.isPending ? 'Adding...' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}