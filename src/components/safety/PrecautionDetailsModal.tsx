import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, Eye, AlertTriangle, ShieldCheck, Zap, Wrench, Globe, Heart, Calendar, User } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

type SafetyPrecaution = Database['public']['Tables']['safety_precautions']['Row'];

interface PrecautionDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  precaution: SafetyPrecaution | null;
  onEdit?: () => void;
  onIncrementUsage?: () => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'secondary';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'ppe': return ShieldCheck;
    case 'chemical safety': return AlertTriangle;
    case 'electrical safety': return Zap;
    case 'mechanical safety': return Wrench;
    case 'environmental safety': return Globe;
    default: return Heart;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'under_review': return 'secondary';
    case 'archived': return 'outline';
    default: return 'outline';
  }
};

export function PrecautionDetailsModal({ 
  open, 
  onOpenChange, 
  precaution, 
  onEdit,
  onIncrementUsage 
}: PrecautionDetailsModalProps) {
  if (!precaution) return null;

  const CategoryIcon = getCategoryIcon(precaution.category);

  const handleViewUsage = () => {
    if (onIncrementUsage) {
      onIncrementUsage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CategoryIcon className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle className="text-xl">{precaution.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    {precaution.precaution_code}
                  </Badge>
                  <Badge variant={getSeverityColor(precaution.severity_level)}>
                    {precaution.severity_level}
                  </Badge>
                  <Badge variant={getStatusColor(precaution.status)}>
                    {precaution.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleViewUsage}>
                <Eye className="h-4 w-4 mr-1" />
                View ({precaution.usage_count})
              </Button>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {precaution.description}
              </p>
            </CardContent>
          </Card>

          {/* Category and Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Category:</span>
                  <Badge variant="secondary" className="ml-2">
                    {precaution.category}
                  </Badge>
                </div>
                {precaution.subcategory && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Subcategory:</span>
                    <Badge variant="outline" className="ml-2">
                      {precaution.subcategory}
                    </Badge>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Severity Level:</span>
                  <Badge variant={getSeverityColor(precaution.severity_level)} className="ml-2">
                    {precaution.severity_level}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Usage Count:</span>
                  <span className="font-bold">{precaution.usage_count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Last Updated:</span>
                  <span className="text-sm">{new Date(precaution.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={getStatusColor(precaution.status)}>
                    {precaution.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Required Actions */}
          {precaution.required_actions && precaution.required_actions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required Actions</CardTitle>
                <CardDescription>
                  Specific actions that must be taken to implement this precaution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {precaution.required_actions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Associated Hazards */}
          {precaution.associated_hazards && precaution.associated_hazards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Associated Hazards</CardTitle>
                <CardDescription>
                  Potential hazards this precaution helps mitigate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {precaution.associated_hazards.map((hazard, index) => (
                    <Badge key={index} variant="destructive">
                      {hazard}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regulatory References */}
          {precaution.regulatory_references && precaution.regulatory_references.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regulatory References</CardTitle>
                <CardDescription>
                  Applicable regulations, standards, and compliance requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {precaution.regulatory_references.map((reference, index) => (
                    <Badge key={index} variant="outline" className="font-mono">
                      {reference}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applicable Scenarios */}
          {precaution.applicable_scenarios && 
           Array.isArray(precaution.applicable_scenarios) && 
           precaution.applicable_scenarios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applicable Scenarios</CardTitle>
                <CardDescription>
                  Situations where this precaution should be applied
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {precaution.applicable_scenarios.map((scenario, index) => (
                    <div key={index} className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{typeof scenario === 'string' ? scenario : JSON.stringify(scenario)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}