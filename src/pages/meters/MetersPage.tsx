import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Layout } from '@/components/Layout';
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
} from '@/components/ui/dialog';
import { MeterForm } from '@/components/meters/MeterForm';

/**
 * MetersPage - Main page for meter registration and management
 * Displays all meters with filtering and CRUD operations
 */
export default function MetersPage() {
  const { meters, loading } = useMeters();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter meters based on search
  const filteredMeters = meters.filter(meter =>
    meter.meter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <Layout>
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
                placeholder="Search by meter number, serial, or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <TableHead>Serial Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health Score</TableHead>
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
              ) : filteredMeters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No meters found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMeters.map((meter) => (
                  <TableRow key={meter.id}>
                    <TableCell className="font-medium">
                      {meter.meter_number}
                    </TableCell>
                    <TableCell>{meter.serial_number}</TableCell>
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
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${meter.health_score}%` }}
                          />
                        </div>
                        <span className="text-sm">{meter.health_score}%</span>
                      </div>
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
        </Card>
      </div>

      {/* Meter Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMeter ? 'Edit Meter' : 'Register New Meter'}
            </DialogTitle>
          </DialogHeader>
          <MeterForm
            meter={selectedMeter}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedMeter(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}