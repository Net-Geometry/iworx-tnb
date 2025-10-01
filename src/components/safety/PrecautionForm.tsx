import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

// Local type definition for safety_precautions (now a view in microservices architecture)
interface SafetyPrecaution {
  id: string;
  precaution_code: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  severity_level: string;
  status: string;
  required_actions?: string[];
  associated_hazards?: string[];
  regulatory_references?: string[];
  applicable_scenarios?: any;
  usage_count: number;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

const formSchema = z.object({
  precaution_code: z.string().min(1, "Precaution code is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  severity_level: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['active', 'under_review', 'archived']),
});

type FormData = z.infer<typeof formSchema>;

interface PrecautionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  precaution?: SafetyPrecaution | null;
  mode: 'create' | 'edit';
}

const categories = [
  "PPE",
  "Chemical Safety", 
  "Electrical Safety",
  "Mechanical Safety",
  "Environmental Safety",
  "Fire Safety",
  "Fall Protection",
  "Ergonomics"
];

export function PrecautionForm({ open, onOpenChange, onSubmit, precaution, mode }: PrecautionFormProps) {
  const [requiredActions, setRequiredActions] = useState<string[]>(
    precaution?.required_actions || []
  );
  const [associatedHazards, setAssociatedHazards] = useState<string[]>(
    precaution?.associated_hazards || []
  );
  const [regulatoryReferences, setRegulatoryReferences] = useState<string[]>(
    precaution?.regulatory_references || []
  );
  const [newAction, setNewAction] = useState("");
  const [newHazard, setNewHazard] = useState("");
  const [newReference, setNewReference] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      precaution_code: precaution?.precaution_code || "",
      title: precaution?.title || "",
      description: precaution?.description || "",
      category: precaution?.category || "",
      subcategory: precaution?.subcategory || "",
      severity_level: (precaution?.severity_level as 'critical' | 'high' | 'medium' | 'low') || 'medium',
      status: (precaution?.status as 'active' | 'under_review' | 'archived') || 'active',
    },
  });

  const handleSubmit = async (data: FormData) => {
    const submissionData = {
      ...data,
      required_actions: requiredActions,
      associated_hazards: associatedHazards,
      regulatory_references: regulatoryReferences,
    };
    
    await onSubmit(submissionData);
    onOpenChange(false);
  };

  const addAction = () => {
    if (newAction.trim()) {
      setRequiredActions([...requiredActions, newAction.trim()]);
      setNewAction("");
    }
  };

  const removeAction = (index: number) => {
    setRequiredActions(requiredActions.filter((_, i) => i !== index));
  };

  const addHazard = () => {
    if (newHazard.trim()) {
      setAssociatedHazards([...associatedHazards, newHazard.trim()]);
      setNewHazard("");
    }
  };

  const removeHazard = (index: number) => {
    setAssociatedHazards(associatedHazards.filter((_, i) => i !== index));
  };

  const addReference = () => {
    if (newReference.trim()) {
      setRegulatoryReferences([...regulatoryReferences, newReference.trim()]);
      setNewReference("");
    }
  };

  const removeReference = (index: number) => {
    setRegulatoryReferences(regulatoryReferences.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Safety Precaution' : 'Edit Safety Precaution'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precaution_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precaution Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PPE-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief descriptive title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the safety precaution"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
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
                    <FormLabel>Subcategory (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Head Protection" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Required Actions */}
            <div className="space-y-3">
              <FormLabel>Required Actions</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add required action"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAction())}
                />
                <Button type="button" onClick={addAction} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {requiredActions.map((action, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {action}
                    <X
                      className="h-3 w-3 ml-1"
                      onClick={() => removeAction(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Associated Hazards */}
            <div className="space-y-3">
              <FormLabel>Associated Hazards</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add associated hazard"
                  value={newHazard}
                  onChange={(e) => setNewHazard(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHazard())}
                />
                <Button type="button" onClick={addHazard} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {associatedHazards.map((hazard, index) => (
                  <Badge key={index} variant="destructive" className="cursor-pointer">
                    {hazard}
                    <X
                      className="h-3 w-3 ml-1"
                      onClick={() => removeHazard(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Regulatory References */}
            <div className="space-y-3">
              <FormLabel>Regulatory References</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add regulatory reference"
                  value={newReference}
                  onChange={(e) => setNewReference(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addReference())}
                />
                <Button type="button" onClick={addReference} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {regulatoryReferences.map((reference, index) => (
                  <Badge key={index} variant="outline" className="cursor-pointer">
                    {reference}
                    <X
                      className="h-3 w-3 ml-1"
                      onClick={() => removeReference(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Create Precaution' : 'Update Precaution'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}