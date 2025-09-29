import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Copy } from "lucide-react";

export const BOMTemplates = () => {
  const templates = [
    {
      id: 'pump-maintenance',
      name: 'Pump Maintenance BOM',
      description: 'Standard maintenance components for centrifugal pumps',
      type: 'maintenance',
      items: ['Mechanical seal', 'O-rings', 'Bearings', 'Lubricant', 'Gaskets']
    },
    {
      id: 'motor-assembly',
      name: 'Electric Motor Assembly',
      description: 'Complete assembly BOM for electric motors',
      type: 'manufacturing',
      items: ['Stator', 'Rotor', 'Bearings', 'Housing', 'Terminal box']
    },
    {
      id: 'conveyor-spare',
      name: 'Conveyor Spare Parts',
      description: 'Common spare parts for conveyor systems',
      type: 'spare_parts',
      items: ['Drive belt', 'Rollers', 'Motors', 'Sensors', 'Guards']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">BOM Templates</h2>
          <p className="text-muted-foreground">Pre-configured BOMs for common asset types</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-card transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Sample Items ({template.items.length}):
                  </p>
                  <div className="space-y-1">
                    {template.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-sm text-foreground">
                        • {item}
                      </div>
                    ))}
                    {template.items.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        + {template.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Create Custom Template</h3>
              <p className="text-sm text-muted-foreground">
                Build your own reusable BOM template for specific asset types
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};