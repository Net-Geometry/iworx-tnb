import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus, Briefcase } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  existingMemberIds: string[];
}

interface AvailablePerson {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  job_title: string | null;
  department: string | null;
}

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  teamId,
  existingMemberIds,
}: AddTeamMemberDialogProps) {
  const { currentOrganization, hasCrossProjectAccess } = useAuth();
  const { addTeamMember } = useTeams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<'leader' | 'member' | 'supervisor'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available people (Engineers and Technicians only, excluding existing members)
  const { data: availablePeople = [], isLoading } = useQuery({
    queryKey: ["available-team-members", teamId, currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from("people")
        .select("id, employee_number, first_name, last_name, email, job_title, department")
        .eq("is_active", true)
        .in("job_title", ["Engineer", "Technician"])
        .order("last_name");

      // Filter by organization
      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out existing team members
      return (data as AvailablePerson[]).filter(
        (person) => !existingMemberIds.includes(person.id)
      );
    },
    enabled: open && (!!currentOrganization || hasCrossProjectAccess),
  });

  // Filter people based on search query
  const filteredPeople = availablePeople.filter((person) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      person.first_name.toLowerCase().includes(searchLower) ||
      person.last_name.toLowerCase().includes(searchLower) ||
      person.employee_number.toLowerCase().includes(searchLower) ||
      person.email?.toLowerCase().includes(searchLower) ||
      person.job_title?.toLowerCase().includes(searchLower) ||
      person.department?.toLowerCase().includes(searchLower)
    );
  });

  const handleSubmit = async () => {
    if (!selectedPersonId) return;

    setIsSubmitting(true);
    try {
      await addTeamMember.mutateAsync({
        team_id: teamId,
        person_id: selectedPersonId,
        role_in_team: selectedRole,
      });

      // Reset form and close dialog
      setSelectedPersonId("");
      setSelectedRole('member');
      setSearchQuery("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding team member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPerson = availablePeople.find((p) => p.id === selectedPersonId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Team Member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 inline mr-1" />
              Only <strong>Engineers</strong> and <strong>Technicians</strong> can be assigned to teams.
            </p>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search People</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, employee number, email..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Available People List */}
          <div className="space-y-2">
            <Label>Available People ({filteredPeople.length})</Label>
            <ScrollArea className="h-[300px] border rounded-md">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Loading available people...
                </div>
              ) : filteredPeople.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? "No people found matching your search."
                    : "No available Engineers or Technicians to add."}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredPeople.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setSelectedPersonId(person.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedPersonId === person.id
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-border hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {person.first_name} {person.last_name}
                            </p>
                            {person.job_title && (
                              <Badge
                                variant={person.job_title === "Engineer" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {person.job_title}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{person.employee_number}</span>
                            {person.department && (
                              <>
                                <span>•</span>
                                <span>{person.department}</span>
                              </>
                            )}
                          </div>
                          {person.email && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {person.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Role Selection */}
          {selectedPersonId && (
            <div className="space-y-2 p-4 bg-accent/50 rounded-lg border">
              <Label htmlFor="role">
                Assign Role for{" "}
                <span className="font-semibold">
                  {selectedPerson?.first_name} {selectedPerson?.last_name}
                </span>
              </Label>
              <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="leader">Leader</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the role this person will have in the team.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedPersonId("");
                setSelectedRole('member');
                setSearchQuery("");
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedPersonId || isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add to Team"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
