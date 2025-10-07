import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Package,
  Wrench,
  Calendar,
  Users,
  Settings,
  BarChart,
  Shield,
  HelpCircle,
  Search,
} from "lucide-react";

interface CommandPaletteDemoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandPaletteDemo = ({ open, onOpenChange }: CommandPaletteDemoProps) => {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (action: string) => {
    console.log("Selected:", action);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => handleSelect("create-work-order")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Create Work Order</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              Ctrl+N
            </Badge>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("create-asset")}>
            <Package className="mr-2 h-4 w-4" />
            <span>Create Asset</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("create-pm")}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Create PM Schedule</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect("go-assets")}>
            <Package className="mr-2 h-4 w-4" />
            <span>Go to Assets</span>
            <Badge variant="outline" className="ml-auto text-xs">
              Alt+A
            </Badge>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("go-work-orders")}>
            <Wrench className="mr-2 h-4 w-4" />
            <span>Go to Work Orders</span>
            <Badge variant="outline" className="ml-auto text-xs">
              Alt+W
            </Badge>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("go-pm")}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Go to PM Schedules</span>
            <Badge variant="outline" className="ml-auto text-xs">
              Alt+P
            </Badge>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("go-people")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Go to People & Labor</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("go-analytics")}>
            <BarChart className="mr-2 h-4 w-4" />
            <span>Go to Analytics</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="System">
          <CommandItem onSelect={() => handleSelect("settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <Badge variant="outline" className="ml-auto text-xs">
              Ctrl+,
            </Badge>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("help")}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help Center</span>
            <Badge variant="outline" className="ml-auto text-xs">
              F1
            </Badge>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("search")}>
            <Search className="mr-2 h-4 w-4" />
            <span>Global Search</span>
            <Badge variant="outline" className="ml-auto text-xs">
              Ctrl+/
            </Badge>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Admin">
          <CommandItem onSelect={() => handleSelect("admin-users")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Manage Users</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("admin-roles")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Manage Roles</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("admin-system")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>System Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      <div className="border-t border-border p-2 bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          Press{" "}
          <Badge variant="secondary" className="text-xs mx-1">
            Ctrl+K
          </Badge>
          to toggle • Use{" "}
          <Badge variant="secondary" className="text-xs mx-1">
            ↑↓
          </Badge>
          to navigate • Press{" "}
          <Badge variant="secondary" className="text-xs mx-1">
            Enter
          </Badge>
          to select
        </p>
      </div>
    </CommandDialog>
  );
};

export default CommandPaletteDemo;
