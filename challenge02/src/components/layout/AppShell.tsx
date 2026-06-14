import { Outlet } from "react-router-dom";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./AppSidebar";

/**
 * App-wide layout: persistent sidebar + a sticky top bar, with routed pages
 * rendered into the inset via <Outlet/>.
 */
export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 !h-5" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">REMI</span>
            <span className="text-muted-foreground">Maintenance Operations</span>
          </div>
        </header>
        <main className="flex-1 bg-muted/20">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
