import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SidebarTrigger } from "@/components/ui/sidebar";

const Header = () => {
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
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;