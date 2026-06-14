import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { IssueDetailPage } from "@/pages/IssueDetailPage";
import { PropertiesPage } from "@/pages/PropertiesPage";
import { VendorsPage } from "@/pages/VendorsPage";

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="issues/:issueId" element={<IssueDetailPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors closeButton />
    </TooltipProvider>
  );
}
