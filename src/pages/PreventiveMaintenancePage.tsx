import { useState } from "react";
import { Calendar, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PMKPICards from "@/components/pm/PMKPICards";
import PMScheduleCard from "@/components/pm/PMScheduleCard";
import PMScheduleForm from "@/components/pm/PMScheduleForm";
import { usePMSchedules, useDeletePMSchedule, usePausePMSchedule, PMSchedule } from "@/hooks/usePMSchedules";

/**
 * PreventiveMaintenancePage
 * Main page for managing preventive maintenance schedules
 * Features: KPI tracking, schedule creation, list/calendar views, automation
 */
const PreventiveMaintenancePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PMSchedule | undefined>();
  const { toast } = useToast();

  // Fetch PM schedules
  const { data: schedules, isLoading } = usePMSchedules();
  const deletePMSchedule = useDeletePMSchedule();
  const pausePMSchedule = usePausePMSchedule();

  // Filter schedules based on search query
  const filteredSchedules = schedules?.filter((schedule) =>
    schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.schedule_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.asset?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle create new PM schedule
  const handleCreate = () => {
    setSelectedSchedule(undefined);
    setIsFormOpen(true);
  };

  // Handle edit PM schedule
  const handleEdit = (schedule: PMSchedule) => {
    setSelectedSchedule(schedule);
    setIsFormOpen(true);
  };

  // Handle delete PM schedule
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

  // Handle pause/resume PM schedule
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

  // Handle view schedule details
  const handleView = (schedule: PMSchedule) => {
    // For now, open edit form - can be extended to a details view
    handleEdit(schedule);
  };

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

      {/* KPI Metrics */}
      <PMKPICards />

      {/* Search and Filters */}
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

      {/* Tabs for different views */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="by-asset">By Asset</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredSchedules && filteredSchedules.length > 0 ? (
            // PM Schedule Cards
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

        <TabsContent value="calendar" className="py-6">
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
            <p className="text-muted-foreground">
              Calendar view coming soon - visualize PM schedules on a calendar
            </p>
          </div>
        </TabsContent>

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

      {/* PM Schedule Form Dialog */}
      <PMScheduleForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        schedule={selectedSchedule}
      />
    </div>
  );
};

export default PreventiveMaintenancePage;