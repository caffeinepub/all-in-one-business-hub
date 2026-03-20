import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useSeedData } from "./hooks/useQueries";
import Accounting from "./pages/Accounting";
import DSAConnectors from "./pages/DSAConnectors";
import DSAPartners from "./pages/DSAPartners";
import Dashboard from "./pages/Dashboard";
import DigitalLeads from "./pages/DigitalLeads";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeLocations from "./pages/EmployeeLocations";
import HRDocuments from "./pages/HRDocuments";
import HRManagement from "./pages/HRManagement";
import LoanManagement from "./pages/LoanManagement";
import Settings from "./pages/Settings";

export type Page =
  | "dashboard"
  | "hr"
  | "hr-attendance"
  | "hr-locations"
  | "hr-docs"
  | "loans"
  | "dsa-partners"
  | "dsa-connectors"
  | "digital-leads"
  | "accounting"
  | "settings";

export const ALL_THEME_CLASSES = [
  "theme-red",
  "theme-blue",
  "theme-green",
  "theme-purple",
  "theme-dark",
  "theme-orange",
];

export function applyTheme(themeName: string) {
  const root = document.documentElement;
  for (const cls of ALL_THEME_CLASSES) {
    root.classList.remove(cls);
  }
  root.classList.add(themeName);
  localStorage.setItem("app_theme", themeName);
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [companyName, setCompanyName] = useState("Uparjanam");

  useEffect(() => {
    const saved = localStorage.getItem("company_name");
    if (saved) setCompanyName(saved);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-2xl">
              {companyName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {companyName}
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Integrated Business Management Platform
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to access your dashboard
            </p>
          </div>
          <button
            type="button"
            data-ocid="login.primary_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-3 px-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isLoggingIn ? "Signing in..." : "Login with Internet Identity"}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using uparjanam
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const { actor, isFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const seedData = useSeedData();
  const seeded = useRef(false);

  // Apply saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme") || "theme-red";
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (actor && !isFetching && !seeded.current) {
      seeded.current = true;
      seedData.mutate();
    }
  }, [actor, isFetching, seedData]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="app.loading_state"
        />
      </div>
    );
  }

  if (!identity) {
    return <LoginScreen />;
  }

  const pageTitle: Record<Page, string> = {
    dashboard: "Dashboard Overview",
    hr: "HR Management",
    "hr-attendance": "Employee Attendance",
    "hr-locations": "Employee Locations",
    "hr-docs": "HR Documents",
    loans: "Loan Management",
    "dsa-partners": "DSA Partners",
    "dsa-connectors": "DSA Connectors",
    "digital-leads": "Digital Leads",
    accounting: "Accounting",
    settings: "Settings",
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitle[currentPage]} onNavigate={setCurrentPage} />
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
          {currentPage === "digital-leads" && <DigitalLeads />}
          {currentPage === "accounting" && <Accounting />}
          {currentPage === "settings" && <Settings />}
        </main>
        <footer className="bg-card border-t border-border px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()}. Built with love using uparjanam
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
