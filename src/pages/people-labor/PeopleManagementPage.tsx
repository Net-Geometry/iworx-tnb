import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Shield } from "lucide-react";
import { usePeople } from "@/hooks/usePeople";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { AddPersonDialog } from "@/components/people-labor/AddPersonDialog";
import { ImportUsersDialog } from "@/components/people-labor/ImportUsersDialog";
import { useBusinessAreas } from "@/hooks/useBusinessAreas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PeopleManagementPage = () => {
  const navigate = useNavigate();
  const { people, isLoading } = usePeople();
  const { data: businessAreas } = useBusinessAreas();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [systemAccessFilter, setSystemAccessFilter] = useState<string>('all');

  const filteredPeople = people
    .filter((person) =>
      `${person.first_name} ${person.last_name} ${person.employee_number}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((person) => {
      if (systemAccessFilter === 'with-access') return person.user_id;
      if (systemAccessFilter === 'without-access') return !person.user_id;
      return true;
    });

  const existingUserIds = people
    .filter((p) => p.user_id)
    .map((p) => p.user_id as string);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'on_leave': return 'outline';
      case 'terminated': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">People Management</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Import Users
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or employee number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={systemAccessFilter} onValueChange={setSystemAccessFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All People</SelectItem>
              <SelectItem value="with-access">With System Access</SelectItem>
              <SelectItem value="without-access">Without System Access</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Business Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>System Access</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredPeople.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No people found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPeople.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.employee_number}</TableCell>
                    <TableCell>{`${person.first_name} ${person.last_name}`}</TableCell>
                    <TableCell>{person.job_title || '-'}</TableCell>
                    <TableCell>{person.department || '-'}</TableCell>
                    <TableCell>
                      {person.business_areas && person.business_areas.length > 0
                        ? person.business_areas
                            .filter(ba => ba.is_primary)
                            .map(ba => ba.business_area?.business_area)
                            .filter(Boolean)
                            .join(', ') || person.business_areas[0]?.business_area?.business_area || '-'
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(person.employment_status)}>
                        {person.employment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {person.user_id ? (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="w-3 h-3" />
                          System User
                        </Badge>
                      ) : (
                        <Badge variant="outline">No Access</Badge>
                      )}
                    </TableCell>
                    <TableCell>{person.hire_date || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/people-labor/people/${person.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddPersonDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <ImportUsersDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        existingUserIds={existingUserIds}
      />
    </>
  );
};

export default PeopleManagementPage;
