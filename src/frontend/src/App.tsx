import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useActor } from "./hooks/useActor";
import { useSeedData } from "./hooks/useQueries";
import Accounting from "./pages/Accounting";
import DSAConnectors from "./pages/DSAConnectors";
import DSAPartners from "./pages/DSAPartners";
import Dashboard from "./pages/Dashboard";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeLocations from "./pages/EmployeeLocations";
import HRDocuments from "./pages/HRDocuments";
import HRManagement from "./pages/HRManagement";
import LoanManagement from "./pages/LoanManagement";

export type Page =
  | "dashboard"
  | "hr"
  | "hr-attendance"
  | "hr-locations"
  | "hr-docs"
  | "loans"
  | "dsa-partners"
  | "dsa-connectors"
  | "accounting";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const { actor, isFetching } = useActor();
  const seedData = useSeedData();
  const seeded = useRef(false);

  useEffect(() => {
    if (actor && !isFetching && !seeded.current) {
      seeded.current = true;
      seedData.mutate();
    }
  }, [actor, isFetching, seedData]);

  const pageTitle: Record<Page, string> = {
    dashboard: "Dashboard Overview",
    hr: "HR Management",
    "hr-attendance": "Employee Attendance",
    "hr-locations": "Employee Locations",
    "hr-docs": "HR Documents",
    loans: "Loan Management",
    "dsa-partners": "DSA Partners",
    "dsa-connectors": "DSA Connectors",
    accounting: "Accounting",
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitle[currentPage]} />
        <main className="flex-1 overflow-auto bg-background p-6">
          {currentPage === "dashboard" && (
            <Dashboard onNavigate={setCurrentPage} />
          )}
          {currentPage === "hr" && <HRManagement />}
          {currentPage === "hr-attendance" && <EmployeeAttendance />}
          {currentPage === "hr-locations" && <EmployeeLocations />}
          {currentPage === "hr-docs" && <HRDocuments />}
          {currentPage === "loans" && <LoanManagement />}
          {currentPage === "dsa-partners" && <DSAPartners />}
          {currentPage === "dsa-connectors" && <DSAConnectors />}
          {currentPage === "accounting" && <Accounting />}
        </main>
        <footer className="bg-card border-t border-border px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </span>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground">Terms</span>
            <span className="cursor-pointer hover:text-foreground">
              Privacy
            </span>
            <span className="cursor-pointer hover:text-foreground">
              Support
            </span>
          </div>
        </footer>
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
