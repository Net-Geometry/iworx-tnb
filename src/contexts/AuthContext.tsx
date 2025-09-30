import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Organization, UserOrganization } from '@/types/organization';

interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  currentOrganization: Organization | null;
  userOrganizations: UserOrganization[];
  hasCrossProjectAccess: boolean;
  switchOrganization: (orgId: string) => void;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [hasCrossProjectAccess, setHasCrossProjectAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and organizations
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            fetchUserOrganizations(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserOrganizations([]);
          setCurrentOrganization(null);
          setHasCrossProjectAccess(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserOrganizations(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserOrganizations = async (userId: string) => {
    try {
      // Fetch user's organizations
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select('*, organization:organizations(*)')
        .eq('user_id', userId);

      if (userOrgsError) {
        console.error('Error fetching user organizations:', userOrgsError);
        return;
      }

      setUserOrganizations(userOrgs || []);

      // Check if user has cross-project access
      const { data: hasAccess, error: accessError } = await supabase
        .rpc('has_cross_project_access', { _user_id: userId });

      if (!accessError) {
        setHasCrossProjectAccess(hasAccess || false);
      }

      // Set current organization from localStorage or default to first org
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      if (savedOrgId && userOrgs?.some(uo => uo.organization?.id === savedOrgId)) {
        const org = userOrgs.find(uo => uo.organization?.id === savedOrgId)?.organization;
        if (org) {
          setCurrentOrganization(org);
          return;
        }
      }

      // Default to first organization
      if (userOrgs && userOrgs.length > 0 && userOrgs[0].organization) {
        setCurrentOrganization(userOrgs[0].organization);
        localStorage.setItem('currentOrganizationId', userOrgs[0].organization.id);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const switchOrganization = (orgId: string) => {
    if (orgId === 'all' && hasCrossProjectAccess) {
      // Special case for "All Projects" view
      setCurrentOrganization({
        id: 'all',
        name: 'All Projects',
        code: 'ALL',
        description: 'Cross-project view',
        is_active: true,
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      localStorage.setItem('currentOrganizationId', 'all');
      return;
    }

    const userOrg = userOrganizations.find(uo => uo.organization?.id === orgId);
    if (userOrg?.organization) {
      setCurrentOrganization(userOrg.organization);
      localStorage.setItem('currentOrganizationId', orgId);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration."
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update profile. Please try again."
      });
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    currentOrganization,
    userOrganizations,
    hasCrossProjectAccess,
    switchOrganization,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};