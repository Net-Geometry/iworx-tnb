export interface Organization {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  created_at: string;
  organization?: Organization;
}
