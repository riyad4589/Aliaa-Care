import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "../AdminSidebar";
import { Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4">
            <SidebarTrigger />
            <span className="font-serif text-lg text-foreground">ALIAA Admin</span>
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto max-w-full">
            <div className="overflow-x-auto"><Outlet /></div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
