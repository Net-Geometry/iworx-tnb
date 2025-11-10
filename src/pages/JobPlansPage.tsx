import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard, Plus, Search, Filter, LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobPlanCard } from "@/components/job-plans/JobPlanCard";
import { useJobPlans, useJobPlanStats } from "@/hooks/useJobPlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";

const JobPlansPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  const { data: jobPlans, isLoading } = useJobPlans();
  const { data: stats } = useJobPlanStats();

  const filteredJobPlans = jobPlans?.filter(plan => {
    // Safety check: ensure this is actually a job plan, not a work order
    if (!plan.job_plan_number) {
      console.warn('[JobPlansPage] Invalid data structure, missing job_plan_number:', plan);
      return false;
    }
    
    // Search filter with safe property access
    const matchesSearch = 
      plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.job_plan_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter;
    
    // Job type filter
    const matchesJobType = jobTypeFilter === "all" || plan.job_type === jobTypeFilter;
    
    return matchesSearch && matchesStatus && matchesJobType;
  }) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredJobPlans.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedJobPlans = filteredJobPlans.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleJobTypeFilterChange = (value: string) => {
    setJobTypeFilter(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className?: string }> = {
      active: { variant: "default", className: "bg-green-500" },
      draft: { variant: "secondary" },
      under_review: { variant: "outline", className: "border-yellow-500 text-yellow-600" },
      archived: { variant: "destructive" }
    };
    const config = variants[status] || { variant: "outline" };
    return <Badge variant={config.variant} className={config.className}>{status.replace('_', ' ')}</Badge>;
  };

  const getJobTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      preventive: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      corrective: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      predictive: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      emergency: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      shutdown: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    };
    return <Badge className={colors[type] || ""}>{type}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Clipboard className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Plan Library</h1>
            <p className="text-muted-foreground">Standardized maintenance procedures and task templates</p>
          </div>
        </div>
        <Button onClick={() => navigate("/job-plans/create")} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Job Plan
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Job Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats?.active || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats?.draft || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats?.underReview || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search job plans..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-4 py-2 rounded-md border border-border bg-background text-foreground"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="under_review">Under Review</option>
          <option value="archived">Archived</option>
        </select>
        
        {/* Job Type Filter */}
        <select
          value={jobTypeFilter}
          onChange={(e) => handleJobTypeFilterChange(e.target.value)}
          className="px-4 py-2 rounded-md border border-border bg-background text-foreground"
        >
          <option value="all">All Types</option>
          <option value="preventive">Preventive</option>
          <option value="corrective">Corrective</option>
          <option value="predictive">Predictive</option>
          <option value="emergency">Emergency</option>
          <option value="shutdown">Shutdown</option>
        </select>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Job Plans Display */}
      {viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gradient-card border-border/50">
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : paginatedJobPlans.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Clipboard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No job plans found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first job plan"}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate("/job-plans/create")} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Job Plan
                </Button>
              )}
            </div>
          ) : (
            paginatedJobPlans.map((jobPlan) => (
              <JobPlanCard key={jobPlan.id} jobPlan={jobPlan} />
            ))
          )}
        </div>
      ) : (
        /* List View */
        <Card className="bg-gradient-card border-border/50">
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Plan Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration (hrs)</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading job plans...
                    </TableCell>
                  </TableRow>
                ) : paginatedJobPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Clipboard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No job plans found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first job plan"}
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => navigate("/job-plans/create")} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Create Job Plan
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedJobPlans.map((jobPlan) => (
                    <TableRow 
                      key={jobPlan.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/job-plans/${jobPlan.id}`)}
                    >
                      <TableCell className="font-medium">{jobPlan.job_plan_number}</TableCell>
                      <TableCell>{jobPlan.title}</TableCell>
                      <TableCell>{getJobTypeBadge(jobPlan.job_type)}</TableCell>
                      <TableCell>{getStatusBadge(jobPlan.status)}</TableCell>
                      <TableCell>{jobPlan.estimated_duration_hours || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{jobPlan.tasks?.length || 0} tasks</Badge>
                      </TableCell>
                      <TableCell>
                        {jobPlan.updated_at 
                          ? new Date(jobPlan.updated_at).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/job-plans/${jobPlan.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/job-plans/${jobPlan.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {filteredJobPlans.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredJobPlans.length)} of {filteredJobPlans.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Pagination for Grid View */}
      {viewMode === "grid" && filteredJobPlans.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredJobPlans.length)} of {filteredJobPlans.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobPlansPage;