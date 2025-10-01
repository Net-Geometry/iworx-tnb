import { useState, useMemo } from "react";
import { BookOpen, Plus, Search, Filter, Eye, Edit, AlertTriangle, ShieldCheck, Zap, Wrench, Globe, Heart, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrecautions } from "@/hooks/usePrecautions";
import { PrecautionForm } from "@/components/safety/PrecautionForm";
import { PrecautionDetailsModal } from "@/components/safety/PrecautionDetailsModal";
import { SafetyPrecaution } from '@/types/microservices';

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
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPrecaution, setSelectedPrecaution] = useState<SafetyPrecaution | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { 
    precautions, 
    loading, 
    error, 
    addPrecaution, 
    updatePrecaution, 
    incrementUsageCount,
    refetch 
  } = usePrecautions();

  const categories = ["PPE", "Chemical Safety", "Electrical Safety", "Mechanical Safety", "Environmental Safety", "Fire Safety", "Fall Protection", "Ergonomics"];
  const severityLevels = ["critical", "high", "medium", "low"];

  const filteredPrecautions = useMemo(() => {
    return precautions.filter(precaution => {
      const matchesSearch = searchTerm === "" || 
        precaution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        precaution.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        precaution.precaution_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || precaution.category === selectedCategory;
      const matchesSeverity = selectedSeverity === "all" || precaution.severity_level === selectedSeverity;
      
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [precautions, searchTerm, selectedCategory, selectedSeverity]);

  const stats = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return {
      total: precautions.length,
      active: precautions.filter(p => p.status === 'active').length,
      critical: precautions.filter(p => p.severity_level === 'critical').length,
      recentlyUpdated: precautions.filter(p => {
        const updatedDate = new Date(p.updated_at);
        return updatedDate > thirtyDaysAgo;
      }).length,
      mostUsed: precautions.length > 0 ? Math.max(...precautions.map(p => p.usage_count || 0)) : 0
    };
  }, [precautions]);

  const handleCreatePrecaution = () => {
    setFormMode('create');
    setSelectedPrecaution(null);
    setFormOpen(true);
  };

  const handleEditPrecaution = (precaution: SafetyPrecaution) => {
    setFormMode('edit');
    setSelectedPrecaution(precaution);
    setFormOpen(true);
  };

  const handleViewPrecaution = (precaution: SafetyPrecaution) => {
    setSelectedPrecaution(precaution);
    setDetailsOpen(true);
    incrementUsageCount(precaution.id);
  };

  const handleFormSubmit = async (data: any) => {
    if (formMode === 'create') {
      await addPrecaution(data);
    } else if (selectedPrecaution) {
      await updatePrecaution(selectedPrecaution.id, data);
    }
    setFormOpen(false);
  };

  // Refresh data when filters change
  useState(() => {
    const filters = {
      category: selectedCategory,
      severity: selectedSeverity,
      search: searchTerm
    };
    refetch(filters);
  });

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
        <Button onClick={handleCreatePrecaution}>
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
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.total}</div>
            )}
            <p className="text-xs text-muted-foreground">All precautions in library</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Precautions</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.active}</div>
            )}
            <p className="text-xs text-muted-foreground">Currently approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
            )}
            <p className="text-xs text-muted-foreground">High-priority items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Updated</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.recentlyUpdated}</div>
            )}
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Referenced</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.mostUsed}</div>
            )}
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
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Precautions</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => refetch()}>Try Again</Button>
              </CardContent>
            </Card>
          )}

          {/* Precautions Grid */}
          {!loading && !error && (
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
                      
                      {precaution.required_actions && precaution.required_actions.length > 0 && (
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
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{precaution.usage_count || 0} uses</span>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPrecaution(precaution)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPrecaution(precaution)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPrecautions.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No precautions found</h3>
                <p className="text-muted-foreground mb-4">
                  {precautions.length === 0 
                    ? "No safety precautions have been created yet." 
                    : "Try adjusting your search criteria or filters."
                  }
                </p>
                {precautions.length === 0 && (
                  <Button onClick={handleCreatePrecaution}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Precaution
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Form and Detail Modals */}
      <PrecautionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        precaution={selectedPrecaution}
        mode={formMode}
      />

      <PrecautionDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        precaution={selectedPrecaution}
        onEdit={() => {
          setDetailsOpen(false);
          if (selectedPrecaution) {
            handleEditPrecaution(selectedPrecaution);
          }
        }}
        onIncrementUsage={() => {
          if (selectedPrecaution) {
            incrementUsageCount(selectedPrecaution.id);
          }
        }}
      />
    </div>
  );
}