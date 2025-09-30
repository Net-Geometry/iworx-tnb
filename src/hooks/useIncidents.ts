import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Incident interface matching database schema
export interface Incident {
  id: string;
  incident_number: string;
  incident_date: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  title: string;
  description: string;
  root_cause: string | null;
  corrective_actions: string | null;
  reporter_name: string;
  reporter_email: string | null;
  investigator_name: string | null;
  investigation_notes: string | null;
  cost_estimate: number | null;
  regulatory_reporting_required: boolean;
  regulatory_report_number: string | null;
  asset_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  organization_id: string;
}

export interface IncidentStats {
  total: number;
  critical: number;
  investigating: number;
  resolvedThisMonth: number;
}

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentStats>({
    total: 0,
    critical: 0,
    investigating: 0,
    resolvedThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const { currentOrganization, hasCrossProjectAccess } = useAuth();
  const { toast } = useToast();

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("safety_incidents")
        .select("*")
        .order("incident_date", { ascending: false });

      // Apply organization filter unless user has cross-project access
      if (!hasCrossProjectAccess && currentOrganization) {
        query = query.eq("organization_id", currentOrganization.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setIncidents(data || []);

      // Calculate statistics
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const newStats: IncidentStats = {
        total: data?.length || 0,
        critical: data?.filter(i => i.severity === 'critical').length || 0,
        investigating: data?.filter(i => i.status === 'investigating').length || 0,
        resolvedThisMonth: data?.filter(i => 
          i.status === 'resolved' && 
          new Date(i.updated_at) >= firstDayOfMonth
        ).length || 0,
      };

      setStats(newStats);
    } catch (error: any) {
      console.error("Error fetching incidents:", error);
      toast({
        title: "Error",
        description: "Failed to load incidents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [currentOrganization, hasCrossProjectAccess]);

  const createIncident = async (incidentData: Partial<Incident>) => {
    try {
      if (!currentOrganization) {
        throw new Error("No organization selected");
      }

      // Generate incident number
      const incidentNumber = `INC-${Date.now().toString().slice(-8)}`;

      const { data, error } = await supabase
        .from("safety_incidents")
        .insert({
          incident_number: incidentNumber,
          incident_date: incidentData.incident_date!,
          location: incidentData.location!,
          severity: incidentData.severity!,
          status: incidentData.status || 'reported',
          title: incidentData.title!,
          description: incidentData.description!,
          reporter_name: incidentData.reporter_name!,
          reporter_email: incidentData.reporter_email || null,
          asset_id: incidentData.asset_id || null,
          regulatory_reporting_required: incidentData.regulatory_reporting_required || false,
          corrective_actions: incidentData.corrective_actions || null,
          root_cause: incidentData.root_cause || null,
          investigator_name: incidentData.investigator_name || null,
          investigation_notes: incidentData.investigation_notes || null,
          cost_estimate: incidentData.cost_estimate || null,
          regulatory_report_number: incidentData.regulatory_report_number || null,
          organization_id: currentOrganization.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Incident report created successfully",
      });

      await fetchIncidents();
      return data;
    } catch (error: any) {
      console.error("Error creating incident:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create incident report",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    try {
      const { error } = await supabase
        .from("safety_incidents")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Incident updated successfully",
      });

      await fetchIncidents();
    } catch (error: any) {
      console.error("Error updating incident:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update incident",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteIncident = async (id: string) => {
    try {
      const { error } = await supabase
        .from("safety_incidents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Incident deleted successfully",
      });

      await fetchIncidents();
    } catch (error: any) {
      console.error("Error deleting incident:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete incident",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    incidents,
    stats,
    loading,
    createIncident,
    updateIncident,
    deleteIncident,
    refetch: fetchIncidents,
  };
};
