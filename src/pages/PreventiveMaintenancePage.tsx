/**
 * PreventiveMaintenancePage
 * 
 * This is the main page for managing preventive maintenance schedules.
 * It provides an overview of all PM schedules, KPI metrics, and navigation
 * to create or edit schedules.
 * 
 * Features:
 * - KPI cards showing schedule statistics
 * - Search and filter functionality
 * - List view of all PM schedules
 * - Navigation to create/edit pages
 * - Delete and pause/resume actions
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PMKPICards from "@/components/pm/PMKPICards";
import PMScheduleCard from "@/components/pm/PMScheduleCard";
import { usePMSchedules, useDeletePMSchedule, usePausePMSchedule, PMSchedule } from "@/hooks/usePMSchedules";

// ============================================================================
// Main Component
// ============================================================================

const PreventiveMaintenancePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Data hooks
  const { data: schedules, isLoading } = usePMSchedules();
  const deletePMSchedule = useDeletePMSchedule();
  const pausePMSchedule = usePausePMSchedule();

  // ============================================================================
  // Navigation Handlers
  // ============================================================================

  /**
   * Navigate to create PM schedule page
   */
  const handleCreate = () => {
    navigate("/preventive-maintenance/create");
  };

  /**
   * Navigate to edit PM schedule page
   * @param schedule - The schedule to edit
   */
  const handleEdit = (schedule: PMSchedule) => {
    navigate(`/preventive-maintenance/edit/${schedule.id}`);
  };

  // ============================================================================
  // Action Handlers
  // ============================================================================

  /**
   * Delete a PM schedule
   * @param id - Schedule ID to delete
   */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this PM schedule?")) return;
    
    try {
      await deletePMSchedule.mutateAsync(id);
      toast({
        title: "Success",
        description: "PM schedule deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PM schedule",
        variant: "destructive",
      });
    }
  };

  /**
   * Pause or resume a PM schedule
   * @param id - Schedule ID
   * @param pause - Whether to pause (true) or resume (false)
   */
  const handlePause = async (id: string, pause: boolean) => {
    try {
      await pausePMSchedule.mutateAsync({ id, pause });
      toast({
        title: "Success",
        description: pause ? "PM schedule paused" : "PM schedule resumed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update PM schedule status",
        variant: "destructive",
      });
    }
  };

  /**
   * View schedule details (redirects to edit for now)
   * @param schedule - The schedule to view
   */
  const handleView = (schedule: PMSchedule) => {
    handleEdit(schedule);
  };

  // ============================================================================
  // Data Filtering
  // ============================================================================

  /**
   * Filter schedules based on search query
   * Searches in: schedule number, title, description, and asset name
   */
  const filteredSchedules = schedules?.filter((schedule) =>
    schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.schedule_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.asset?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Preventive Maintenance</h1>
            <p className="text-muted-foreground">PM schedule management, automation & tracking</p>
          </div>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Create PM Schedule
        </Button>
      </div>

      {/* KPI Metrics Section */}
      <PMKPICards />

      {/* Search Bar and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search PM schedules by title, number, or asset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* View Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="by-asset">By Asset</TabsTrigger>
        </TabsList>

        {/* List View Tab Content */}
        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            // Loading state with skeletons
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredSchedules && filteredSchedules.length > 0 ? (
            // Render schedule cards
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSchedules.map((schedule) => (
                <PMScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPause={handlePause}
                  onView={handleView}
                />
              ))}
            </div>
          ) : (
            // Empty state
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No PM Schedules Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No schedules match your search criteria"
                  : "Get started by creating your first PM schedule"}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create PM Schedule
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Calendar View Tab Content (Coming Soon) */}
        <TabsContent value="calendar" className="py-6">
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
            <p className="text-muted-foreground">
              Calendar view coming soon - visualize PM schedules on a calendar
            </p>
          </div>
        </TabsContent>

        {/* By Asset Tab Content (Coming Soon) */}
        <TabsContent value="by-asset" className="py-6">
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Asset View</h3>
            <p className="text-muted-foreground">
              Asset-grouped view coming soon - see all PM schedules organized by asset
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PreventiveMaintenancePage;
