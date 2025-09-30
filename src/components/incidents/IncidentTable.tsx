import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { Incident } from "@/hooks/useIncidents";
import { format } from "date-fns";

interface IncidentTableProps {
  incidents: Incident[];
  onViewDetails: (incident: Incident) => void;
}

export const IncidentTable = ({ incidents, onViewDetails }: IncidentTableProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "outline";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported":
        return "secondary";
      case "investigating":
        return "outline";
      case "resolved":
        return "default";
      case "closed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Incident #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No incidents reported yet
              </TableCell>
            </TableRow>
          ) : (
            incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell className="font-medium">
                  {incident.incident_number}
                </TableCell>
                <TableCell>
                  {format(new Date(incident.incident_date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {incident.title}
                </TableCell>
                <TableCell>{incident.location}</TableCell>
                <TableCell>
                  <Badge variant={getSeverityColor(incident.severity)}>
                    {incident.severity.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(incident.status)}>
                    {incident.status}
                  </Badge>
                </TableCell>
                <TableCell>{incident.reporter_name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(incident)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
