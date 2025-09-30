import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
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

const PeopleManagementPage = () => {
  const navigate = useNavigate();
  const { people, isLoading } = usePeople();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPeople = people.filter((person) =>
    `${person.first_name} ${person.last_name} ${person.employee_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">People Management</h1>
        <Button onClick={() => navigate("/people-labor/people/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
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
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredPeople.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
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
                    <Badge variant={getStatusColor(person.employment_status)}>
                      {person.employment_status}
                    </Badge>
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
  );
};

export default PeopleManagementPage;