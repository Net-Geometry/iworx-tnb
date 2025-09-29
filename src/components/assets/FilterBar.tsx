import { useState } from "react";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface FilterState {
  search: string;
  status: string[];
  criticality: string[];
  type: string[];
  location: string;
}

interface FilterBarProps {
  onFiltersChange?: (filters: FilterState) => void;
}

const statusOptions = [
  { value: "operational", label: "Operational", color: "bg-green-500" },
  { value: "warning", label: "Warning", color: "bg-yellow-500" },
  { value: "critical", label: "Critical", color: "bg-red-500" },
  { value: "offline", label: "Offline", color: "bg-gray-500" },
];

const criticalityOptions = [
  { value: "high", label: "High", color: "bg-red-500" },
  { value: "medium", label: "Medium", color: "bg-orange-500" },
  { value: "low", label: "Low", color: "bg-green-500" },
];

const typeOptions = [
  "Conveyor", "Press", "Compressor", "Robot", "Cooling", "Pump", "Motor", "Valve"
];

export function FilterBar({ onFiltersChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    criticality: [],
    type: [],
    location: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const toggleArrayFilter = (key: 'status' | 'criticality' | 'type', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [key]: newArray });
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      status: [],
      criticality: [],
      type: [],
      location: "",
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return (
      (filters.search ? 1 : 0) +
      filters.status.length +
      filters.criticality.length +
      filters.type.length +
      (filters.location ? 1 : 0)
    );
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets, IDs, locations..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>

        {/* Quick Status Filters */}
        <div className="flex items-center gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={filters.status.includes(status.value) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayFilter('status', status.value)}
              className="h-8"
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${status.color}`} />
              {status.label}
            </Button>
          ))}
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant={showAdvanced ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Criticality Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Criticality
              </label>
              <div className="space-y-2">
                {criticalityOptions.map((crit) => (
                  <Button
                    key={crit.value}
                    variant={filters.criticality.includes(crit.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('criticality', crit.value)}
                    className="w-full h-8 justify-start"
                  >
                    <div className={`w-2 h-2 rounded-full mr-2 ${crit.color}`} />
                    {crit.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Asset Type Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Asset Type
              </label>
              <Select
                value={filters.type[0] || ""}
                onValueChange={(value) => 
                  updateFilters({ 
                    type: value === "all" ? [] : [value] 
                  })
                }
              >
                <SelectTrigger className="bg-background border-border/50">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="all">All Types</SelectItem>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Location
              </label>
              <Select
                value={filters.location}
                onValueChange={(value) => updateFilters({ location: value === "all" ? "" : value })}
              >
                <SelectTrigger className="bg-background border-border/50">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="plant1">Plant 1</SelectItem>
                  <SelectItem value="production">Production Floor</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range (placeholder) */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Installation Date
              </label>
              <Select>
                <SelectTrigger className="bg-background border-border/50">
                  <SelectValue placeholder="Any Date" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="older">Older than 1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}