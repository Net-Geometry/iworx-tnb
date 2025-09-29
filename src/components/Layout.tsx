import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-dashboard">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <main className="flex-1 p-6 space-y-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}