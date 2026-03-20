import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  CalendarCheck,
  Camera,
  Check,
  FileText,
  HandshakeIcon,
  LayoutDashboard,
  LogOut,
  MapPin,
  Network,
  Pencil,
  Settings,
  Share2,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navGroups = [
  {
    label: "Overview",
    items: [
      { id: "dashboard" as Page, icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "HR Management",
    items: [
      { id: "hr" as Page, icon: Users, label: "Employees" },
      { id: "hr-attendance" as Page, icon: CalendarCheck, label: "Attendance" },
      { id: "hr-locations" as Page, icon: MapPin, label: "Locations" },
      { id: "hr-docs" as Page, icon: FileText, label: "Documents" },
    ],
  },
  {
    label: "DSA Loan Management",
    items: [
      { id: "loans" as Page, icon: FileText, label: "Loan Applications" },
      {
        id: "dsa-partners" as Page,
        icon: HandshakeIcon,
        label: "DSA Partners",
      },
      { id: "dsa-connectors" as Page, icon: Network, label: "DSA Connectors" },
      { id: "digital-leads" as Page, icon: Share2, label: "Digital Leads" },
    ],
  },
  {
    label: "Accounting",
    items: [
      { id: "accounting" as Page, icon: BookOpen, label: "Transactions" },
    ],
  },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("Uparjanam");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("Uparjanam");
  const [logoHover, setLogoHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { clear } = useInternetIdentity();

  useEffect(() => {
    const savedLogo = localStorage.getItem("company_logo");
    const savedName = localStorage.getItem("company_name");
    if (savedLogo) setLogoUrl(savedLogo);
    if (savedName) {
      setCompanyName(savedName);
      setNameInput(savedName);
    }
  }, []);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoUrl(dataUrl);
      localStorage.setItem("company_logo", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleNameSave = () => {
    const trimmed = nameInput.trim() || "Uparjanam";
    setCompanyName(trimmed);
    localStorage.setItem("company_name", trimmed);
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleNameSave();
    if (e.key === "Escape") {
      setNameInput(companyName);
      setIsEditingName(false);
    }
  };

  const handleLogoClick = () => fileInputRef.current?.click();
  const handleLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
  };

  const handleLogoutConfirm = () => {
    clear();
  };

  return (
    <aside className="sidebar-gradient w-64 flex-shrink-0 flex flex-col h-full">
      {/* Logo & Company Name */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <button
          type="button"
          className="relative flex-shrink-0 cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-white/40"
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
          onClick={handleLogoClick}
          onKeyDown={handleLogoKeyDown}
          data-ocid="sidebar.logo.upload_button"
          title="Click to change logo"
          aria-label="Change company logo"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Company logo"
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
          )}
          {logoHover && (
            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />

        <div className="flex-1 min-w-0 flex items-center gap-1">
          {isEditingName ? (
            <div className="flex items-center gap-1 w-full">
              <input
                ref={nameInputRef}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleNameSave}
                data-ocid="sidebar.company_name.input"
                className="flex-1 min-w-0 bg-white/10 text-white text-sm font-semibold rounded px-1.5 py-0.5 outline-none border border-white/30 focus:border-white/60"
                style={{ fontSize: "14px" }}
              />
              <button
                type="button"
                onClick={handleNameSave}
                className="text-white/70 hover:text-white flex-shrink-0"
                data-ocid="sidebar.company_name.save_button"
                aria-label="Save company name"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-white font-semibold text-sm tracking-tight truncate">
                {companyName}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors ml-0.5"
                data-ocid="sidebar.company_name.edit_button"
                title="Edit company name"
                aria-label="Edit company name"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p
              className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "oklch(0.55 0.02 225)" }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    data-ocid={`nav.${item.id}.link`}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-sidebar-foreground hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4 space-y-0.5">
        <button
          type="button"
          data-ocid="nav.settings.link"
          onClick={() => onNavigate("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
            currentPage === "settings"
              ? "bg-white/10 text-white font-medium"
              : "text-sidebar-foreground hover:bg-white/6 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              data-ocid="nav.logout.button"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-white/6 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="logout.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to logout?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You will be signed out and redirected to the login screen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="logout.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="logout.confirm_button"
                onClick={handleLogoutConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
