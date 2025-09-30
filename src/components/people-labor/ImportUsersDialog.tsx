import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface ImportUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingUserIds: string[];
}

export function ImportUsersDialog({ open, onOpenChange, existingUserIds }: ImportUsersDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();
  const [importing, setImporting] = useState<string | null>(null);
  const [employeeNumbers, setEmployeeNumbers] = useState<Record<string, string>>({});

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profiles-for-import"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const availableProfiles = profiles.filter(
    (profile) => !existingUserIds.includes(profile.id)
  );

  const handleImport = async (userId: string) => {
    const employeeNumber = employeeNumbers[userId];
    if (!employeeNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an employee number",
      });
      return;
    }

    setImporting(userId);
    try {
      const { error } = await (supabase.rpc as any)("import_user_as_person", {
        _user_id: userId,
        _employee_number: employeeNumber,
        _organization_id: currentOrganization?.id,
      });

      if (error) throw error;

      toast({
        title: "User Imported",
        description: "User has been successfully imported as a person.",
      });

      queryClient.invalidateQueries({ queryKey: ["people"] });
      setEmployeeNumbers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to import user.",
      });
    } finally {
      setImporting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import Users as People</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : availableProfiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              All users have already been imported
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Employee Number</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.display_name || "No Name"}
                      </TableCell>
                      <TableCell>
                        {new Date(profile.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="EMP-001"
                          value={employeeNumbers[profile.id] || ""}
                          onChange={(e) =>
                            setEmployeeNumbers((prev) => ({
                              ...prev,
                              [profile.id]: e.target.value,
                            }))
                          }
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleImport(profile.id)}
                          disabled={importing === profile.id}
                        >
                          {importing === profile.id ? (
                            "Importing..."
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Import
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
