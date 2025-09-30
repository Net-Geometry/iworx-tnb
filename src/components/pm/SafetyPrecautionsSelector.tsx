/**
 * SafetyPrecautionsSelector Component
 * 
 * Provides a multi-select interface for choosing safety precautions to associate with PM schedules.
 * 
 * Features:
 * - Displays active safety precautions with search/filter functionality
 * - Shows precaution details (code, title, severity, category)
 * - Visual badges for selected items with remove functionality
 * - Empty state when no precautions are available
 * - Color-coded severity levels for quick identification
 */

import { useState } from "react";
import { Check, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePrecautions } from "@/hooks/usePrecautions";
import { cn } from "@/lib/utils";

interface SafetyPrecautionsSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * SafetyPrecautionsSelector Component
 * Multi-select component for choosing safety precautions
 */
const SafetyPrecautionsSelector = ({ value, onChange }: SafetyPrecautionsSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { precautions, loading } = usePrecautions();

  // Filter to show only active precautions
  const activePrecautions = precautions.filter(p => p.status === 'active');

  // Get selected precaution details for display
  const selectedPrecautions = activePrecautions.filter(p => value.includes(p.id));

  /**
   * Toggle precaution selection
   */
  const togglePrecaution = (precautionId: string) => {
    const newValue = value.includes(precautionId)
      ? value.filter(id => id !== precautionId)
      : [...value, precautionId];
    onChange(newValue);
  };

  /**
   * Remove a single precaution from selection
   */
  const removePrecaution = (precautionId: string) => {
    onChange(value.filter(id => id !== precautionId));
  };

  /**
   * Get severity badge variant based on level
   */
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-3">
      {/* Precaution Selector Dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>
                {value.length === 0
                  ? "Select safety precautions..."
                  : `${value.length} precaution${value.length > 1 ? 's' : ''} selected`}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search safety precautions..." />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading precautions..." : "No precautions found."}
              </CommandEmpty>
              <CommandGroup>
                {activePrecautions.map((precaution) => (
                  <CommandItem
                    key={precaution.id}
                    value={`${precaution.precaution_code} ${precaution.title}`}
                    onSelect={() => togglePrecaution(precaution.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {/* Selection checkbox */}
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        value.includes(precaution.id)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50"
                      )}
                    >
                      {value.includes(precaution.id) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>

                    {/* Precaution details */}
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{precaution.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {precaution.precaution_code}
                          {precaution.category && ` • ${precaution.category}`}
                        </span>
                      </div>
                      <Badge variant={getSeverityVariant(precaution.severity_level)}>
                        {precaution.severity_level}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Precautions Display */}
      {selectedPrecautions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPrecautions.map((precaution) => (
            <Badge
              key={precaution.id}
              variant="secondary"
              className="flex items-center gap-2 pr-1"
            >
              <Shield className="h-3 w-3" />
              <span className="text-xs">
                {precaution.precaution_code}: {precaution.title}
              </span>
              <Badge variant={getSeverityVariant(precaution.severity_level)} className="text-xs px-1">
                {precaution.severity_level}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removePrecaution(precaution.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SafetyPrecautionsSelector;
