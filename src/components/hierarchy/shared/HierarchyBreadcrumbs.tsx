import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * HierarchyBreadcrumbs Component
 * 
 * Displays breadcrumb navigation for hierarchy paths with clickable links.
 * Shows the full path from root to current location.
 */

interface BreadcrumbNode {
  id: string;
  name: string;
  level?: string;
}

interface HierarchyBreadcrumbsProps {
  path: BreadcrumbNode[];
  onNavigate?: (nodeId: string) => void;
  showHome?: boolean;
}

export const HierarchyBreadcrumbs = ({ 
  path, 
  onNavigate,
  showHome = true 
}: HierarchyBreadcrumbsProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {showHome && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/assets/hierarchy" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>Hierarchy</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {path.length > 0 && <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>}
          </>
        )}
        
        {path.map((node, index) => {
          const isLast = index === path.length - 1;
          
          return (
            <BreadcrumbItem key={node.id}>
              {isLast ? (
                <BreadcrumbPage className="font-medium">
                  {node.name}
                  {node.level && <span className="ml-1 text-muted-foreground text-xs">({node.level})</span>}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink 
                    onClick={() => onNavigate?.(node.id)}
                    className="cursor-pointer hover:text-primary"
                  >
                    {node.name}
                    {node.level && <span className="ml-1 text-muted-foreground text-xs">({node.level})</span>}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
