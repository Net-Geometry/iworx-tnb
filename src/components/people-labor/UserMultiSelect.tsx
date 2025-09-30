import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Person } from "@/hooks/usePeople";

interface UserMultiSelectProps {
  people: Person[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Searchable multi-select component for assigning users
 * Handles large datasets efficiently with search functionality
 */
export function UserMultiSelect({
  people,
  selectedIds,
  onChange,
  placeholder = "Select users...",
  disabled = false,
}: UserMultiSelectProps) {
  const [open, setOpen] = useState(false);

  // Get selected people objects for displaying badges
  const selectedPeople = people.filter((person) =>
    selectedIds.includes(person.id)
  );

  // Toggle selection
  const togglePerson = (personId: string) => {
    if (selectedIds.includes(personId)) {
      onChange(selectedIds.filter((id) => id !== personId));
    } else {
      onChange([...selectedIds, personId]);
    }
  };

  // Remove a specific person
  const removePerson = (personId: string) => {
    onChange(selectedIds.filter((id) => id !== personId));
  };

  // Clear all selections
  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedIds.length === 0
                ? placeholder
                : `${selectedIds.length} user${selectedIds.length > 1 ? "s" : ""} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search users by name, employee #..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {people.map((person) => {
                  const isSelected = selectedIds.includes(person.id);
                  const displayName = `${person.first_name} ${person.last_name}`;
                  const subtitle = [
                    person.employee_number,
                    person.job_title,
                    person.department,
                  ]
                    .filter(Boolean)
                    .join(" • ");

                  return (
                    <CommandItem
                      key={person.id}
                      value={`${displayName} ${person.employee_number} ${person.job_title} ${person.department}`}
                      onSelect={() => togglePerson(person.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{displayName}</span>
                        {subtitle && (
                          <span className="text-xs text-muted-foreground">
                            {subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected users badges */}
      {selectedPeople.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPeople.map((person) => (
            <Badge
              key={person.id}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <span>
                {person.first_name} {person.last_name}
              </span>
              <button
                type="button"
                onClick={() => removePerson(person.id)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedPeople.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={disabled}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
