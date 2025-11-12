import { useState } from 'react';
import { Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMeters, Meter } from '@/hooks/useMeters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MeterForm } from '@/components/meters/MeterForm';

/**
 * MetersPage - Main page for meter registration and management
 * Displays all meters with filtering and CRUD operations
 */
export default function MetersPage() {
  const { meters, loading, refetch } = useMeters();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter meters based on search
  const filteredMeters = meters.filter(meter =>
    meter.meter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredMeters.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMeters = filteredMeters.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getMeterTypeColor = (type: string) => {
    const colors = {
      revenue: 'bg-primary',
      monitoring: 'bg-secondary',
      protection: 'bg-destructive',
      power_quality: 'bg-accent',
    };
    return colors[type as keyof typeof colors] || 'bg-muted';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      inactive: 'bg-gray-500',
      faulty: 'bg-red-500',
      retired: 'bg-muted',
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  const handleEdit = (meter: Meter) => {
    setSelectedMeter(meter);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedMeter(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meter Registration</h1>
            <p className="text-muted-foreground">
              Register and manage electricity meters
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Register Meter
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by meter number, description, or manufacturer..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Meters Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meter Number</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Unit of Measure</TableHead>
                <TableHead>Next Calibration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Loading meters...
                  </TableCell>
                </TableRow>
              ) : paginatedMeters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No meters found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMeters.map((meter) => (
                  <TableRow key={meter.id}>
                    <TableCell className="font-medium">
                      {meter.meter_number}
                    </TableCell>
                    <TableCell>{meter.description || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getMeterTypeColor(meter.meter_type)}>
                        {meter.meter_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{meter.manufacturer || '-'}</TableCell>
                    <TableCell>{meter.model || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(meter.status)}>
                        {meter.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {meter.unit ? (
                        <span>{meter.unit.name} ({meter.unit.abbreviation})</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {meter.next_calibration_date || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(meter)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {filteredMeters.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredMeters.length)} of {filteredMeters.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Meter Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMeter ? 'Edit Meter' : 'Register New Meter'}
            </DialogTitle>
            <DialogDescription>
              {selectedMeter 
                ? 'Update the meter information below' 
                : 'Fill in the details to register a new meter'}
            </DialogDescription>
          </DialogHeader>
          <MeterForm
            meter={selectedMeter}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedMeter(null);
              refetch(); // Refresh the list after form closes
            }}
          />
        </DialogContent>
        </Dialog>
      </div>
  );
}