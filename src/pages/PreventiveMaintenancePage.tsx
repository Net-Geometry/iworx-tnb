import { useState } from "react";
import { Calendar, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PMKPICards from "@/components/pm/PMKPICards";
import PMScheduleCard from "@/components/pm/PMScheduleCard";
import PMScheduleForm from "@/components/pm/PMScheduleForm";
import { usePMSchedules, useDeletePMSchedule, usePausePMSchedule, PMSchedule } from "@/hooks/usePMSchedules";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PreventiveMaintenancePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PMSchedule | undefined>();
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<string>("list");

  const { data: schedules, isLoading } = usePMSchedules();
  const deletePMSchedule = useDeletePMSchedule();
  const pausePMSchedule = usePausePMSchedule();

  // Filter schedules based on search query
  const filteredSchedules = schedules?.filter((schedule) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      schedule.title.toLowerCase().includes(searchLower) ||
      schedule.schedule_number.toLowerCase().includes(searchLower) ||
      schedule.asset?.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (schedule: PMSchedule) => {
    setSelectedSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteScheduleId(id);
  };

  const confirmDelete = async () => {
    if (deleteScheduleId) {
      await deletePMSchedule.mutateAsync(deleteScheduleId);
      setDeleteScheduleId(null);
    }
  };

  const handlePause = async (id: string, pause: boolean) => {
    await pausePMSchedule.mutateAsync({ id, pause });
  };

  const handleView = (schedule: PMSchedule) => {
    // TODO: Implement details modal
    console.log("View schedule:", schedule);
  };

  const handleCreateNew = () => {
    setSelectedSchedule(undefined);
    setIsFormOpen(true);
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
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create PM Schedule
        </Button>
      </div>

      {/* KPI Cards */}
      <PMKPICards />

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by schedule name, asset, or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="asset">Asset View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredSchedules && filteredSchedules.length > 0 ? (
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
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No PM schedules found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No schedules match your search criteria"
                  : "Get started by creating your first PM schedule"}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create PM Schedule
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
            <p className="text-muted-foreground">Calendar view coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="asset" className="mt-6">
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Asset View</h3>
            <p className="text-muted-foreground">Asset view coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* PM Schedule Form Dialog */}
      <PMScheduleForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        schedule={selectedSchedule}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteScheduleId} onOpenChange={() => setDeleteScheduleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete PM Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this PM schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PreventiveMaintenancePage;