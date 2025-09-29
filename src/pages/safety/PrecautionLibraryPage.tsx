import { useState } from "react";
import { BookOpen, Plus, Search, Filter, Eye, Edit, AlertTriangle, ShieldCheck, Zap, Wrench, Globe, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SafetyPrecaution {
  id: string;
  precaution_code: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  severity_level: 'critical' | 'high' | 'medium' | 'low';
  required_actions: string[];
  associated_hazards: string[];
  regulatory_references: string[];
  status: 'active' | 'under_review' | 'archived';
  usage_count: number;
  created_at: string;
  updated_at: string;
}

const mockPrecautions: SafetyPrecaution[] = [
  {
    id: "1",
    precaution_code: "PPE-001",
    title: "Hard Hat Required",
    description: "Hard hats must be worn in all construction and maintenance areas to protect against falling objects and head injuries.",
    category: "PPE",
    subcategory: "Head Protection",
    severity_level: "critical",
    required_actions: ["Ensure hard hat is properly fitted", "Check for cracks or damage before use", "Replace if damaged"],
    associated_hazards: ["Falling objects", "Head injuries", "Impact hazards"],
    regulatory_references: ["OSHA 1926.95", "ANSI Z89.1"],
    status: "active",
    usage_count: 156,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-03-20T14:45:00Z"
  },
  {
    id: "2",
    precaution_code: "CHEM-015",
    title: "Chemical Splash Protection",
    description: "Wear appropriate chemical-resistant clothing and eye protection when handling corrosive substances.",
    category: "Chemical Safety",
    subcategory: "Corrosives",
    severity_level: "high",
    required_actions: ["Wear chemical-resistant gloves", "Use safety goggles or face shield", "Ensure proper ventilation"],
    associated_hazards: ["Chemical burns", "Eye injuries", "Skin contact"],
    regulatory_references: ["OSHA 1910.132", "ANSI Z87.1"],
    status: "active",
    usage_count: 89,
    created_at: "2024-02-01T09:15:00Z",
    updated_at: "2024-03-15T11:20:00Z"
  },
  {
    id: "3",
    precaution_code: "ELEC-008",
    title: "Lockout/Tagout Required",
    description: "All electrical equipment must be properly locked out and tagged out before maintenance work begins.",
    category: "Electrical Safety",
    subcategory: "Energy Control",
    severity_level: "critical",
    required_actions: ["Turn off power at source", "Apply lockout device", "Tag with identification", "Test equipment is de-energized"],
    associated_hazards: ["Electrical shock", "Arc flash", "Electrocution"],
    regulatory_references: ["OSHA 1910.147", "NFPA 70E"],
    status: "active",
    usage_count: 234,
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-03-18T16:30:00Z"
  },
  {
    id: "4",
    precaution_code: "MECH-022",
    title: "Pinch Point Awareness",
    description: "Be aware of pinch points and moving parts when working near conveyor systems and rotating equipment.",
    category: "Mechanical Safety",
    subcategory: "Moving Parts",
    severity_level: "high",
    required_actions: ["Keep hands and loose clothing away", "Use proper tools", "Ensure guards are in place"],
    associated_hazards: ["Crushing injuries", "Caught-in hazards", "Amputation"],
    regulatory_references: ["OSHA 1910.212", "ANSI B11.0"],
    status: "active",
    usage_count: 127,
    created_at: "2024-01-25T12:45:00Z",
    updated_at: "2024-03-10T10:15:00Z"
  },
  {
    id: "5",
    precaution_code: "ENV-005",
    title: "Confined Space Entry",
    description: "Follow proper confined space entry procedures including atmospheric testing and continuous monitoring.",
    category: "Environmental Safety",
    subcategory: "Confined Spaces",
    severity_level: "critical",
    required_actions: ["Test atmosphere before entry", "Use continuous monitoring", "Maintain communication with attendant", "Have rescue plan ready"],
    associated_hazards: ["Oxygen deficiency", "Toxic gases", "Engulfment"],
    regulatory_references: ["OSHA 1910.146", "NIOSH 80-106"],
    status: "active",
    usage_count: 78,
    created_at: "2024-02-10T14:20:00Z",
    updated_at: "2024-03-22T09:40:00Z"
  }
];

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

export default function PrecautionLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  const categories = ["PPE", "Chemical Safety", "Electrical Safety", "Mechanical Safety", "Environmental Safety"];
  const severityLevels = ["critical", "high", "medium", "low"];

  const filteredPrecautions = mockPrecautions.filter(precaution => {
    const matchesSearch = precaution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         precaution.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         precaution.precaution_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || precaution.category === selectedCategory;
    const matchesSeverity = selectedSeverity === "all" || precaution.severity_level === selectedSeverity;
    
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const stats = {
    total: mockPrecautions.length,
    active: mockPrecautions.filter(p => p.status === 'active').length,
    critical: mockPrecautions.filter(p => p.severity_level === 'critical').length,
    recentlyUpdated: mockPrecautions.filter(p => {
      const updatedDate = new Date(p.updated_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return updatedDate > thirtyDaysAgo;
    }).length,
    mostUsed: Math.max(...mockPrecautions.map(p => p.usage_count))
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Precaution Library</h1>
            <p className="text-muted-foreground">
              Standardized safety precautionary measures & protective instructions
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Precaution
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Precautions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All precautions in library</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Precautions</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">High-priority items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Updated</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentlyUpdated}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Referenced</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mostUsed}</div>
            <p className="text-xs text-muted-foreground">Usage count</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Precautions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by title, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {severityLevels.map(severity => (
                  <SelectItem key={severity} value={severity}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory === "all" ? "all" : selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory === "all" ? "all" : selectedCategory} className="mt-6">
          {/* Precautions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrecautions.map((precaution) => {
              const CategoryIcon = getCategoryIcon(precaution.category);
              
              return (
                <Card key={precaution.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-5 w-5 text-primary" />
                        <Badge variant="outline" className="text-xs font-mono">
                          {precaution.precaution_code}
                        </Badge>
                      </div>
                      <Badge variant={getSeverityColor(precaution.severity_level)}>
                        {precaution.severity_level}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {precaution.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {precaution.category}
                      </Badge>
                      {precaution.subcategory && (
                        <Badge variant="outline" className="text-xs">
                          {precaution.subcategory}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm line-clamp-3">
                      {precaution.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Required Actions:</div>
                      <ul className="text-xs space-y-1">
                        {precaution.required_actions.slice(0, 2).map((action, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-primary">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                        {precaution.required_actions.length > 2 && (
                          <li className="text-muted-foreground">
                            +{precaution.required_actions.length - 2} more...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{precaution.usage_count} uses</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredPrecautions.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No precautions found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}