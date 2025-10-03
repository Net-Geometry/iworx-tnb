/**
 * Utility functions for incident management
 */

export function formatPriorityAssessment(assessment: string): string {
  const labels: Record<string, string> = {
    'can_wait': 'Can Wait - Schedule during maintenance',
    'should_schedule': 'Should Schedule - Plan within week',
    'urgent': 'Urgent - Address within 24-48h',
    'critical': 'Critical - Immediate action required',
  };
  return labels[assessment] || assessment;
}

export function getPriorityVariant(assessment: string): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, any> = {
    'can_wait': 'outline',
    'should_schedule': 'secondary',
    'urgent': 'default',
    'critical': 'destructive',
  };
  return variants[assessment] || 'default';
}

export function calculateTotalEstimate(
  materialCost?: number,
  laborCost?: number
): number {
  return (materialCost || 0) + (laborCost || 0);
}

/**
 * Derive work order priority from incident severity and priority assessment
 */
export function derivePriority(
  severity: string,
  priorityAssessment?: string
): string {
  // Critical assessment always results in high/critical priority
  if (priorityAssessment === 'critical') return 'critical';
  if (priorityAssessment === 'urgent') return 'high';
  
  // Otherwise, map from severity
  const severityMap: Record<string, string> = {
    critical: 'high',
    high: 'high',
    medium: 'medium',
    low: 'low',
  };
  
  // Upgrade priority if business assessment is more severe
  const basePriority = severityMap[severity] || 'medium';
  if (priorityAssessment === 'should_schedule' && basePriority === 'low') {
    return 'medium';
  }
  
  return basePriority;
}

/**
 * Build comprehensive work order notes from incident data
 */
export function buildWorkOrderNotes(incident: any): string {
  const sections = [];
  
  sections.push(`**Incident Reference**: ${incident.incident_number}`);
  sections.push(`**Severity**: ${incident.severity.toUpperCase()}`);
  
  if (incident.immediate_actions) {
    sections.push(`\n**Immediate Actions Taken**:\n${incident.immediate_actions}`);
  }
  
  if (incident.root_cause) {
    sections.push(`\n**Root Cause Analysis**:\n${incident.root_cause}`);
  }
  
  if (incident.corrective_actions) {
    sections.push(`\n**Recommended Corrective Actions**:\n${incident.corrective_actions}`);
  }
  
  if (incident.priority_assessment) {
    sections.push(`\n**Business Impact**: ${formatPriorityAssessment(incident.priority_assessment)}`);
  }
  
  return sections.join('\n');
}
