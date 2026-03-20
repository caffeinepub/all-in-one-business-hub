import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Principal } from "@icp-sdk/core/principal";
import {
  Building2,
  Palette,
  Save,
  Shield,
  Trash2,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  principalId: string;
  role: "admin" | "user";
  addedAt: string;
}

export default function Settings() {
  const { actor } = useActor();
  const [companyName, setCompanyName] = useState(
    () => localStorage.getItem("company_name") || "Uparjanam",
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(() =>
    localStorage.getItem("company_logo"),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Team Members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("team_members") || "[]");
    } catch {
      return [];
    }
  });
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    principalId: "",
    role: "user" as "admin" | "user",
  });
  const [addingMember, setAddingMember] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const trimmed = companyName.trim() || "Uparjanam";
    localStorage.setItem("company_name", trimmed);
    if (logoUrl) {
      localStorage.setItem("company_logo", logoUrl);
    } else {
      localStorage.removeItem("company_logo");
    }
    toast.success("Settings saved successfully!");
  };

  const saveTeamMembers = (members: TeamMember[]) => {
    setTeamMembers(members);
    localStorage.setItem("team_members", JSON.stringify(members));
  };

  const handleAddMember = async () => {
    if (!newMember.name.trim()) {
      toast.error("Please enter a name for the team member.");
      return;
    }
    if (!newMember.principalId.trim()) {
      toast.error("Please enter the Principal ID.");
      return;
    }
    // Validate principal format
    let principal: Principal;
    try {
      principal = Principal.fromText(newMember.principalId.trim());
    } catch {
      toast.error("Invalid Principal ID format. Please check and try again.");
      return;
    }

    setAddingMember(true);
    try {
      if (actor) {
        const role =
          newMember.role === "admin" ? UserRole.admin : UserRole.user;
        await actor.assignCallerUserRole(principal, role);
      }
      const member: TeamMember = {
        id: Date.now().toString(),
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        principalId: newMember.principalId.trim(),
        role: newMember.role,
        addedAt: new Date().toLocaleDateString("en-IN"),
      };
      saveTeamMembers([...teamMembers, member]);
      setNewMember({ name: "", email: "", principalId: "", role: "user" });
      toast.success(
        `${member.name} added as ${member.role === "admin" ? "Admin" : "User"} successfully.`,
      );
    } catch {
      toast.error("Failed to assign role. Make sure you have admin access.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRoleChange = async (
    memberId: string,
    newRole: "admin" | "user",
  ) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return;
    try {
      if (actor) {
        const principal = Principal.fromText(member.principalId);
        const role = newRole === "admin" ? UserRole.admin : UserRole.user;
        await actor.assignCallerUserRole(principal, role);
      }
      const updated = teamMembers.map((m) =>
        m.id === memberId ? { ...m, role: newRole } : m,
      );
      saveTeamMembers(updated);
      toast.success(
        `Role updated to ${newRole === "admin" ? "Admin" : "User"}.`,
      );
    } catch {
      toast.error("Failed to update role.");
    }
  };

  const handleRemoveMember = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return;
    saveTeamMembers(teamMembers.filter((m) => m.id !== memberId));
    toast.success(`${member.name} removed from team.`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8" data-ocid="settings.page">
      {/* Company Settings */}
      <section
        className="bg-card rounded-xl border border-border p-6 space-y-5"
        data-ocid="settings.panel"
      >
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Company Settings</h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name"
            data-ocid="settings.company_name.input"
          />
        </div>

        <div className="space-y-2">
          <Label>Company Logo</Label>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Company logo preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary/40" />
              </div>
            )}
            <div className="space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="settings.logo.upload_button"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                {logoUrl ? "Change Logo" : "Upload Logo"}
              </Button>
              {logoUrl && (
                <button
                  type="button"
                  className="block text-xs text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => setLogoUrl(null)}
                  data-ocid="settings.logo.delete_button"
                >
                  Remove logo
                </button>
              )}
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 2MB
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>
      </section>

      {/* Team Members */}
      <section
        className="bg-card rounded-xl border border-border p-6 space-y-5"
        data-ocid="settings.team_members.section"
      >
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Team Members</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          Add team members and assign roles. Admins have full access to all
          modules.
        </p>

        {/* Add New Member Form */}
        <div className="bg-muted/40 rounded-lg p-4 space-y-3 border border-border">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-primary" />
            Add New Member
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="member-name" className="text-xs">
                Full Name *
              </Label>
              <Input
                id="member-name"
                placeholder="e.g. Rahul Sharma"
                value={newMember.name}
                onChange={(e) =>
                  setNewMember({ ...newMember, name: e.target.value })
                }
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="member-email" className="text-xs">
                Email (optional)
              </Label>
              <Input
                id="member-email"
                placeholder="e.g. rahul@company.com"
                value={newMember.email}
                onChange={(e) =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="member-principal" className="text-xs">
                Principal ID *
              </Label>
              <Input
                id="member-principal"
                placeholder="e.g. aaaaa-aa..."
                value={newMember.principalId}
                onChange={(e) =>
                  setNewMember({ ...newMember, principalId: e.target.value })
                }
                className="h-8 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Role *</Label>
              <Select
                value={newMember.role}
                onValueChange={(v) =>
                  setNewMember({ ...newMember, role: v as "admin" | "user" })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" /> Admin
                      (Full Access)
                    </span>
                  </SelectItem>
                  <SelectItem value="user">User (Standard Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleAddMember}
            disabled={addingMember}
            className="gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {addingMember ? "Adding..." : "Add Member"}
          </Button>
        </div>

        {/* Members List */}
        {teamMembers.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            No team members added yet. Add your first member above.
          </div>
        ) : (
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {member.name}
                    </p>
                    {member.role === "admin" && (
                      <span className="flex items-center gap-0.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    )}
                  </div>
                  {member.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {member.email}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                    {member.principalId}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <Select
                    value={member.role}
                    onValueChange={(v) =>
                      handleRoleChange(member.id, v as "admin" | "user")
                    }
                  >
                    <SelectTrigger className="h-7 text-xs w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Theme Settings */}
      <section
        className="bg-card rounded-xl border border-border p-6"
        data-ocid="settings.section"
      >
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Theme</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-primary border border-border" />
          <p className="text-sm text-muted-foreground">
            Current theme:{" "}
            <span className="font-medium text-foreground">
              Deep Red &amp; White
            </span>
          </p>
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          data-ocid="settings.save_button"
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
