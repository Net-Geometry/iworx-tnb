import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TeamsManagementPage = () => {
  const navigate = useNavigate();
  const { teams, isLoading, createTeam } = useTeams();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    team_name: "",
    team_code: "",
    description: "",
    department: "",
    shift: "day" as any,
  });

  const filteredTeams = teams.filter((team) =>
    `${team.team_name} ${team.team_code} ${team.department}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTeam.mutateAsync(formData);
    setOpen(false);
    setFormData({
      team_name: "",
      team_code: "",
      description: "",
      department: "",
      shift: "day",
    });
  };

  const getShiftBadge = (shift?: string) => {
    const colors: Record<string, string> = {
      day: "default",
      night: "secondary",
      swing: "outline",
      rotating: "destructive",
    };
    return colors[shift || "day"] || "default";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team_name">Team Name</Label>
                <Input
                  id="team_name"
                  value={formData.team_name}
                  onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team_code">Team Code</Label>
                <Input
                  id="team_code"
                  value={formData.team_code}
                  onChange={(e) => setFormData({ ...formData, team_code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select
                  value={formData.shift}
                  onValueChange={(value) => setFormData({ ...formData, shift: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                    <SelectItem value="swing">Swing</SelectItem>
                    <SelectItem value="rotating">Rotating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Create Team</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <Card 
              key={team.id} 
              className="hover:shadow-lg transition-all cursor-pointer hover:border-primary"
              onClick={() => navigate(`/people-labor/teams/${team.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{team.team_name}</span>
                  <Badge variant={getShiftBadge(team.shift) as any}>
                    {team.shift || 'day'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Code:</span> {team.team_code}
                  </div>
                  <div>
                    <span className="font-medium">Department:</span> {team.department || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <Badge variant={team.is_active ? 'default' : 'secondary'}>
                      {team.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {team.description && (
                    <p className="text-muted-foreground mt-2">{team.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredTeams.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No teams found</div>
      )}
    </div>
  );
};

export default TeamsManagementPage;