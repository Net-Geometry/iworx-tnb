import { Bell, Settings, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUserRoles } from "@/hooks/useCurrentUserRoles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OrganizationSwitcher } from "@/components/OrganizationSwitcher";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { primaryRole } = useCurrentUserRoles();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="bg-gradient-card border-b border-border shadow-card sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Sidebar Trigger and Brand */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="h-8 w-8" />
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">iW</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">iWorx</h1>
              <p className="text-xs text-muted-foreground">Enterprise Asset Management</p>
            </div>
          </div>
          <OrganizationSwitcher />
        </div>


        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></span>
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || 'User'} />
                  <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.display_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {primaryRole && (
                    <Badge variant="secondary" className="w-fit mt-1">
                      <Shield className="mr-1 h-3 w-3" />
                      {primaryRole.role_display_name}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;