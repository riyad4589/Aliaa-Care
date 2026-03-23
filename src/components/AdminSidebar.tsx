import { Package, TrendingUp, ArrowLeft, FolderOpen, Gift, Tag, BoxSelect } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { title: "Catalogue", url: "/admin/products", icon: Package },
  { title: "Catégories", url: "/admin/categories", icon: FolderOpen },
  { title: "Packs", url: "/admin/packs", icon: Gift },
  { title: "Codes Promo", url: "/admin/promo-codes", icon: Tag },
  { title: "Emballages", url: "/admin/packaging", icon: BoxSelect },
  { title: "Finances", url: "/admin/finances", icon: TrendingUp },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs tracking-[0.15em] uppercase">
            {!collapsed && "Administration"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                        location.pathname === item.url
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50 mt-4">
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Retour au site</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
