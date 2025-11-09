import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobPlanCard } from "@/components/job-plans/JobPlanCard";
import { useJobPlans, useJobPlanStats } from "@/hooks/useJobPlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const JobPlansPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
          onChange={(e) => setJobTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-md border border-border bg-background text-foreground"
        >
          <option value="all">All Types</option>
          <option value="preventive">Preventive</option>
          <option value="corrective">Corrective</option>
          <option value="predictive">Predictive</option>
          <option value="emergency">Emergency</option>
          <option value="shutdown">Shutdown</option>
        </select>
      </div>

      {/* Job Plans Grid */}
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
        ) : filteredJobPlans.length === 0 ? (
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
          filteredJobPlans.map((jobPlan) => (
            <JobPlanCard key={jobPlan.id} jobPlan={jobPlan} />
          ))
        )}
      </div>

    </div>
  );
};

export default JobPlansPage;