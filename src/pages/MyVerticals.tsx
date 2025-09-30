import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MyVerticals() {
  const { userOrganizations, currentOrganization, switchOrganization } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Verticals</h1>
        </div>
        <p className="text-muted-foreground">
          Verticals you have access to
        </p>
      </div>

      {userOrganizations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Verticals Assigned</h3>
            <p className="text-muted-foreground">
              You are not assigned to any verticals yet. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userOrganizations.map((userOrg) => {
            const org = userOrg.organization;
            if (!org) return null;

            const isActive = currentOrganization?.id === org.id;

            return (
              <Card
                key={org.id}
                className={isActive ? "ring-2 ring-primary shadow-lg" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      <span className="truncate">{org.name}</span>
                    </div>
                    {isActive && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Code:</span>
                    <Badge variant="outline">{org.code}</Badge>
                  </div>

                  {org.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {org.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined: {new Date(userOrg.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {isActive ? (
                    <div className="text-center text-sm text-primary font-medium py-2">
                      Currently Active
                    </div>
                  ) : (
                    <Button
                      onClick={() => switchOrganization(org.id)}
                      className="w-full"
                      variant="outline"
                    >
                      Switch to This Vertical
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
