import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HierarchyStats } from "@/components/hierarchy/shared/HierarchyStats";
import { useHierarchyLevels, useHierarchyNodes } from "@/hooks/useHierarchyData";
import { Layers, Network, Eye, ArrowRight, Settings } from "lucide-react";

/**
 * HierarchyOverviewPage
 * 
 * Main dashboard for asset hierarchy management.
 * Displays KPI cards, quick actions, and navigation to detailed management pages.
 */

const HierarchyOverviewPage = () => {
  const { levels, loading: levelsLoading } = useHierarchyLevels();
  const { nodes, loading: nodesLoading } = useHierarchyNodes();

  // Calculate stats
  const stats = {
    totalLevels: levels.length,
    totalNodes: nodes.length,
    maxDepth: Math.max(...levels.map(l => l.level_order), 0),
    coverage: 75, // This should be calculated from actual asset assignments
    activeNodes: nodes.filter(n => n.status === 'active').length,
    inactiveNodes: nodes.filter(n => n.status !== 'active').length,
  };

  const navigationCards = [
    {
      title: "Manage Levels",
      description: "Configure hierarchy levels with drag-and-drop reordering",
      icon: Layers,
      href: "/assets/hierarchy/levels",
      color: "text-blue-600",
    },
    {
      title: "Manage Nodes",
      description: "Edit hierarchy nodes with split-screen interface",
      icon: Network,
      href: "/assets/hierarchy/nodes",
      color: "text-green-600",
    },
    {
      title: "Visualize Hierarchy",
      description: "Interactive canvas view of your entire hierarchy",
      icon: Eye,
      href: "/assets/hierarchy/visualizer",
      color: "text-purple-600",
    },
  ];

  if (levelsLoading || nodesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading hierarchy data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Hierarchy Management</h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage your organization's asset hierarchy structure
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/assets">
            <ArrowRight className="h-4 w-4 mr-2" />
            Back to Assets
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <HierarchyStats stats={stats} />

      {/* Navigation Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {navigationCards.map((card) => (
          <Card key={card.href} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <card.icon className={`h-8 w-8 ${card.color}`} />
                <Button asChild variant="ghost" size="sm">
                  <Link to={card.href}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CardTitle className="mt-4">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to={card.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Button asChild variant="outline" className="justify-start">
            <Link to="/assets/hierarchy/levels">
              <Layers className="h-4 w-4 mr-2" />
              Add New Level
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/assets/hierarchy/nodes">
              <Network className="h-4 w-4 mr-2" />
              Add New Node
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Level "Location" was created</p>
            <p>• 3 nodes moved to different parents</p>
            <p>• Hierarchy structure validated successfully</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HierarchyOverviewPage;
