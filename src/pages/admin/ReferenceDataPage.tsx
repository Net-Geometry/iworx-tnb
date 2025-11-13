import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Database, Users, Wrench, MapPin } from "lucide-react";
import { useSkills } from "@/hooks/useSkills";
import { useBusinessAreas } from "@/hooks/useBusinessAreas";

/**
 * Reference Data Management Hub Page
 * Central location for managing all lookup/reference data in the system
 */
const ReferenceDataPage = () => {
  const navigate = useNavigate();
  const { skills = [] } = useSkills();
  const { data: businessAreas = [] } = useBusinessAreas();

  // Reference data categories with their respective information
  const referenceCategories = [
    {
      title: "People & Labor Data",
      description: "Manage skills and labor-related reference data",
      icon: Users,
      items: [
        {
          name: "Skills",
          description: "Manage skill library and certifications",
          count: skills.length,
          route: "/admin/reference-data/skills",
          color: "text-purple-600",
        },
      ],
    },
    {
      title: "Organization Data",
      description: "Manage organizational structure and locations",
      icon: MapPin,
      items: [
        {
          name: "Business Areas",
          description: "Manage business areas, regions, and stations",
          count: businessAreas.length,
          route: "/admin/reference-data/business-areas",
          color: "text-green-600",
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Reference Data Management</h1>
        </div>
        <p className="text-muted-foreground">
          Centralized management for all lookup and reference data throughout the system
        </p>
      </div>

      {/* Reference Data Categories */}
      <div className="space-y-8">
        {referenceCategories.map((category) => (
          <div key={category.title}>
            <div className="flex items-center gap-2 mb-4">
              <category.icon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">{category.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {category.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((item) => (
                <Card key={item.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className={item.color}>{item.name}</span>
                      <span className="text-2xl font-bold text-muted-foreground">
                        {item.count}
                      </span>
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate(item.route)}
                      className="w-full"
                      variant="outline"
                    >
                      Manage {item.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Future Categories Placeholder */}
      <Card className="mt-8 border-dashed">
        <CardHeader>
          <CardTitle className="text-muted-foreground flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Additional reference data categories will be added here, including:
            Asset Data (Categories, Manufacturers), Inventory Data (Units, Categories),
            and Safety Data (Hazard Types, PPE Categories)
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ReferenceDataPage;
