import { LayoutDashboard, Building2, Wrench, Hammer, RotateCcw } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ConfirmDialog } from "@/components/shared";
import { isOpenStatus } from "@/lib/constants";
import { useStore, useIssues, useProperties, useVendors } from "@/store/useStore";

interface NavItem {
  title: string;
  to: string;
  icon: typeof LayoutDashboard;
  /** Active when the path starts with one of these prefixes. */
  match: string[];
  badge?: number;
}

export function AppSidebar() {
  const location = useLocation();
  const issues = useIssues();
  const properties = useProperties();
  const vendors = useVendors();
  const resetData = useStore((s) => s.resetData);

  const openCount = issues.filter((i) => isOpenStatus(i.status)).length;

  const operations: NavItem[] = [
    {
      title: "Dashboard",
      to: "/",
      icon: LayoutDashboard,
      match: ["/", "/issues"],
      badge: openCount,
    },
  ];

  const setup: NavItem[] = [
    {
      title: "Properties",
      to: "/properties",
      icon: Building2,
      match: ["/properties"],
      badge: properties.length,
    },
    {
      title: "Vendors",
      to: "/vendors",
      icon: Wrench,
      match: ["/vendors"],
      badge: vendors.length,
    },
  ];

  const isActive = (item: NavItem) =>
    item.match.some((m) =>
      m === "/" ? location.pathname === "/" : location.pathname.startsWith(m),
    );

  const renderItem = (item: NavItem) => (
    <SidebarMenuItem key={item.to}>
      <SidebarMenuButton asChild isActive={isActive(item)} tooltip={item.title}>
        <NavLink to={item.to}>
          <item.icon />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
      {item.badge != null && item.badge > 0 && (
        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Hammer className="size-5" />
          </div>
          <div className="grid leading-tight">
            <span className="text-sm font-semibold tracking-tight">REMI</span>
            <span className="text-xs text-muted-foreground">Operator Portal</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{operations.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Setup</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{setup.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ConfirmDialog
              trigger={
                <SidebarMenuButton>
                  <RotateCcw />
                  <span>Reset demo data</span>
                </SidebarMenuButton>
              }
              title="Reset demo data?"
              description="This restores the original sample properties, vendors, and issues, discarding any changes you've made."
              confirmText="Reset"
              destructive
              onConfirm={() => {
                resetData();
                toast.success("Demo data restored");
              }}
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
              <div className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                AV
              </div>
              <div className="grid min-w-0 leading-tight">
                <span className="truncate text-sm font-medium">Aye Aye Host</span>
                <span className="truncate text-xs text-muted-foreground">
                  host@ayeaye.co
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
