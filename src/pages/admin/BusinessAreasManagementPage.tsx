import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBusinessAreas } from "@/hooks/useBusinessAreas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Business Areas Management Page
 * Allows administrators to view and manage business areas, regions, and stations
 */
const BusinessAreasManagementPage = () => {
  const navigate = useNavigate();
  const { data: businessAreas = [], isLoading } = useBusinessAreas();
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  // Filter business areas based on search term and region
  const filteredBusinessAreas = businessAreas.filter((area) => {
    const matchesSearch =
      area.business_area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.station?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.label?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = regionFilter === "all" || area.region === regionFilter;
    
    return matchesSearch && matchesRegion;
  });

  // Get unique regions for filter dropdown
  const uniqueRegions = Array.from(
    new Set(businessAreas.map((area) => area.region).filter(Boolean))
  ).sort();

  return (
    <div className="container mx-auto p-6">
      {/* Page Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/reference-data")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reference Data
        </Button>
        <h1 className="text-3xl font-bold">Business Areas Management</h1>
        <p className="text-muted-foreground mt-2">
          View and manage business areas, regions, and stations across the organization
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search business areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {uniqueRegions.map((region) => (
              <SelectItem key={region} value={region!}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Business Areas Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>BA Number</TableHead>
              <TableHead>Business Area</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>PPB Zone</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredBusinessAreas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No business areas found
                </TableCell>
              </TableRow>
            ) : (
              filteredBusinessAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.ba_number || '-'}</TableCell>
                  <TableCell>{area.business_area || '-'}</TableCell>
                  <TableCell>{area.region || '-'}</TableCell>
                  <TableCell>{area.state || '-'}</TableCell>
                  <TableCell>{area.station || '-'}</TableCell>
                  <TableCell>{area.ppb_zone || '-'}</TableCell>
                  <TableCell>{area.label || '-'}</TableCell>
                  <TableCell>
                    {area.status ? (
                      <Badge variant={area.status === 'active' ? 'default' : 'secondary'}>
                        {area.status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Business Areas</div>
          <div className="text-2xl font-bold">{businessAreas.length}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Regions</div>
          <div className="text-2xl font-bold">{uniqueRegions.length}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Filtered Results</div>
          <div className="text-2xl font-bold">{filteredBusinessAreas.length}</div>
        </div>
      </div>
    </div>
  );
};

export default BusinessAreasManagementPage;
