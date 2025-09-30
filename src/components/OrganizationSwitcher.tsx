import { Building2, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export const OrganizationSwitcher = () => {
  const { 
    currentOrganization, 
    userOrganizations, 
    switchOrganization,
    hasCrossProjectAccess 
  } = useAuth();

  if (!currentOrganization) {
    return null;
  }

  const showSwitcher = userOrganizations.length > 1 || hasCrossProjectAccess;

  if (!showSwitcher) {
    // Single organization - just show a badge
    return (
      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
        <Building2 className="h-4 w-4" />
        <span className="font-medium">{currentOrganization.name}</span>
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="font-medium">{currentOrganization.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Switch Vertical
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {userOrganizations.map((userOrg) => {
          const org = userOrg.organization;
          if (!org) return null;
          
          const isActive = currentOrganization.id === org.id;
          
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => switchOrganization(org.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{org.name}</span>
              {isActive && (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
        
        {hasCrossProjectAccess && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => switchOrganization('all')}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="font-medium">All Projects</span>
              {currentOrganization.id === 'all' && (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
