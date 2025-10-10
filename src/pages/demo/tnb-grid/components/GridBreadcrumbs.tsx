/**
 * Grid Breadcrumbs Component
 * 
 * Visual breadcrumb trail showing navigation path
 */

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { NavigationNode } from '../hooks/useGridNavigation';

interface GridBreadcrumbsProps {
  navigationStack: NavigationNode[];
  onNavigate: (levelIndex: number) => void;
}

export function GridBreadcrumbs({ navigationStack, onNavigate }: GridBreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {navigationStack.map((node, index) => {
          const isLast = index === navigationStack.length - 1;
          return (
            <BreadcrumbItem key={node.id}>
              {isLast ? (
                <BreadcrumbPage>{node.name}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink 
                    onClick={() => onNavigate(index)}
                    className="cursor-pointer"
                  >
                    {node.name}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
