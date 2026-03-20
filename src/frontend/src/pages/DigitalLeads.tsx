import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Download, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Dropped";
type LeadSource =
  | "Facebook"
  | "Instagram"
  | "LinkedIn"
  | "WhatsApp"
  | "Google Ads"
  | "Twitter/X"
  | "YouTube"
  | "Website";
type LoanType =
  | "Home Loan"
  | "Personal Loan"
  | "Business Loan"
  | "Car Loan"
  | "Education Loan";

interface Lead {
  id: string;
  name: string;
  mobile: string;
  email: string;
  source: LeadSource;
  loanType: LoanType;
  notes: string;
  status: LeadStatus;
  date: string;
}

const SAMPLE_LEADS: Lead[] = [
  {
    id: "1",
    name: "Rohit Sharma",
    mobile: "9876543210",
    email: "rohit@example.com",
    source: "Facebook",
    loanType: "Home Loan",
    notes: "Looking for ₹50L home loan in Pune",
    status: "Qualified",
    date: "2026-03-01",
  },
  {
    id: "2",
    name: "Priya Patel",
    mobile: "9812345678",
    email: "priya@example.com",
    source: "Instagram",
    loanType: "Personal Loan",
    notes: "Needs ₹5L urgently for medical",
    status: "Contacted",
    date: "2026-03-02",
  },
  {
    id: "3",
    name: "Amit Verma",
    mobile: "9988776655",
    email: "amit@example.com",
    source: "LinkedIn",
    loanType: "Business Loan",
    notes: "Expanding manufacturing unit",
    status: "Converted",
    date: "2026-03-03",
  },
  {
    id: "4",
    name: "Sunita Mehta",
    mobile: "9765432100",
    email: "sunita@example.com",
    source: "WhatsApp",
    loanType: "Car Loan",
    notes: "New Maruti Suzuki purchase",
    status: "New",
    date: "2026-03-04",
  },
  {
    id: "5",
    name: "Karan Singh",
    mobile: "9654321098",
    email: "karan@example.com",
    source: "Google Ads",
    loanType: "Home Loan",
    notes: "First-time home buyer in Mumbai",
    status: "Qualified",
    date: "2026-03-05",
  },
  {
    id: "6",
    name: "Deepa Nair",
    mobile: "9543210987",
    email: "deepa@example.com",
    source: "Twitter/X",
    loanType: "Education Loan",
    notes: "MBA abroad, needs ₹30L",
    status: "Contacted",
    date: "2026-03-06",
  },
  {
    id: "7",
    name: "Vijay Kumar",
    mobile: "9432109876",
    email: "vijay@example.com",
    source: "YouTube",
    loanType: "Personal Loan",
    notes: "Home renovation project",
    status: "Dropped",
    date: "2026-03-07",
  },
  {
    id: "8",
    name: "Meena Joshi",
    mobile: "9321098765",
    email: "meena@example.com",
    source: "Website",
    loanType: "Business Loan",
    notes: "Small bakery expansion",
    status: "New",
    date: "2026-03-08",
  },
  {
    id: "9",
    name: "Arjun Reddy",
    mobile: "9210987654",
    email: "arjun@example.com",
    source: "Facebook",
    loanType: "Car Loan",
    notes: "Electric vehicle purchase",
    status: "Qualified",
    date: "2026-03-10",
  },
  {
    id: "10",
    name: "Kavita Rao",
    mobile: "9109876543",
    email: "kavita@example.com",
    source: "Instagram",
    loanType: "Home Loan",
    notes: "2BHK flat in Bangalore",
    status: "Converted",
    date: "2026-03-12",
  },
  {
    id: "11",
    name: "Suresh Gupta",
    mobile: "9098765432",
    email: "suresh@example.com",
    source: "LinkedIn",
    loanType: "Business Loan",
    notes: "Franchise expansion plan",
    status: "Contacted",
    date: "2026-03-14",
  },
  {
    id: "12",
    name: "Anjali Das",
    mobile: "8987654321",
    email: "anjali@example.com",
    source: "Google Ads",
    loanType: "Education Loan",
    notes: "Engineering college in Pune",
    status: "New",
    date: "2026-03-15",
  },
];

const SOURCES: LeadSource[] = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "WhatsApp",
  "Google Ads",
  "Twitter/X",
  "YouTube",
  "Website",
];

const LOAN_TYPES: LoanType[] = [
  "Home Loan",
  "Personal Loan",
  "Business Loan",
  "Car Loan",
  "Education Loan",
];

const SOURCE_STYLES: Record<
  LeadSource,
  { bg: string; text: string; label: string }
> = {
  Facebook: { bg: "bg-blue-600", text: "text-white", label: "FB" },
  Instagram: { bg: "bg-pink-500", text: "text-white", label: "IG" },
  LinkedIn: { bg: "bg-sky-700", text: "text-white", label: "LI" },
  WhatsApp: { bg: "bg-green-500", text: "text-white", label: "WA" },
  "Google Ads": { bg: "bg-yellow-400", text: "text-gray-900", label: "GA" },
  "Twitter/X": { bg: "bg-gray-900", text: "text-white", label: "X" },
  YouTube: { bg: "bg-red-600", text: "text-white", label: "YT" },
  Website: { bg: "bg-gray-400", text: "text-white", label: "WEB" },
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-blue-100 text-blue-700 border-blue-200",
  Contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Qualified: "bg-green-100 text-green-700 border-green-200",
  Converted: "bg-primary/10 text-primary border-primary/20",
  Dropped: "bg-red-100 text-red-700 border-red-200",
};

function loadLeads(): Lead[] {
  try {
    const raw = localStorage.getItem("uparjanam_digital_leads");
    if (raw) return JSON.parse(raw) as Lead[];
  } catch {}
  return SAMPLE_LEADS;
}

function saveLeads(leads: Lead[]) {
  localStorage.setItem("uparjanam_digital_leads", JSON.stringify(leads));
}

const FILTER_TABS = [
  "All",
  "New",
  "Contacted",
  "Qualified",
  "Converted",
  "Dropped",
] as const;

export default function DigitalLeads() {
  const [leads, setLeads] = useState<Lead[]>(loadLeads);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] =
    useState<(typeof FILTER_TABS)[number]>("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    source: "" as LeadSource | "",
    loanType: "" as LoanType | "",
    notes: "",
    status: "New" as LeadStatus,
  });

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of SOURCES) counts[s] = 0;
    for (const l of leads) counts[l.source] = (counts[l.source] || 0) + 1;
    return counts;
  }, [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchStatus = filterTab === "All" || l.status === filterTab;
      const q = search.toLowerCase();
      const matchSearch =
        !q || l.name.toLowerCase().includes(q) || l.mobile.includes(q);
      return matchStatus && matchSearch;
    });
  }, [leads, filterTab, search]);

  const handleAddLead = () => {
    if (!form.name || !form.mobile || !form.source || !form.loanType) return;
    const newLead: Lead = {
      id: Date.now().toString(),
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      source: form.source as LeadSource,
      loanType: form.loanType as LoanType,
      notes: form.notes,
      status: form.status,
      date: new Date().toISOString().split("T")[0],
    };
    const updated = [newLead, ...leads];
    setLeads(updated);
    saveLeads(updated);
    setDialogOpen(false);
    setForm({
      name: "",
      mobile: "",
      email: "",
      source: "",
      loanType: "",
      notes: "",
      status: "New",
    });
  };

  const handleDelete = (id: string) => {
    const updated = leads.filter((l) => l.id !== id);
    setLeads(updated);
    saveLeads(updated);
  };

  const handleExportCSV = () => {
    const header = "Name,Mobile,Email,Source,Loan Type,Status,Date,Notes";
    const rows = leads.map(
      (l) =>
        `"${l.name}","${l.mobile}","${l.email}","${l.source}","${l.loanType}","${l.status}","${l.date}","${l.notes}"`,
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "digital_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Source Channel Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {SOURCES.map((source, i) => {
          const style = SOURCE_STYLES[source];
          return (
            <motion.div
              key={source}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  setFilterTab(filterTab === "All" ? "All" : "All")
                }
                data-ocid={`digital_leads.${source.toLowerCase().replace(/[^a-z0-9]/g, "_")}.card`}
              >
                <CardContent className="p-3 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full ${style.bg} ${style.text} flex items-center justify-center text-[10px] font-bold`}
                  >
                    {style.label}
                  </div>
                  <p className="text-[11px] font-medium text-center leading-tight">
                    {source}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {sourceCounts[source]}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
      >
        <Tabs
          value={filterTab}
          onValueChange={(v) => setFilterTab(v as (typeof FILTER_TABS)[number])}
        >
          <TabsList data-ocid="digital_leads.filter.tab">
            {FILTER_TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-xs px-2.5">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name / mobile…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
              data-ocid="digital_leads.search_input"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            data-ocid="digital_leads.export.button"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Export
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-ocid="digital_leads.add.open_modal_button">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-md"
              data-ocid="digital_leads.add.dialog"
            >
              <DialogHeader>
                <DialogTitle>Add Digital Lead</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Name *</Label>
                    <Input
                      placeholder="Full name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      data-ocid="digital_leads.name.input"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Mobile *</Label>
                    <Input
                      placeholder="10-digit number"
                      value={form.mobile}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, mobile: e.target.value }))
                      }
                      data-ocid="digital_leads.mobile.input"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    data-ocid="digital_leads.email.input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Source *</Label>
                    <Select
                      value={form.source}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, source: v as LeadSource }))
                      }
                    >
                      <SelectTrigger data-ocid="digital_leads.source.select">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Loan Interest *</Label>
                    <Select
                      value={form.loanType}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, loanType: v as LoanType }))
                      }
                    >
                      <SelectTrigger data-ocid="digital_leads.loan_type.select">
                        <SelectValue placeholder="Loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOAN_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, status: v as LeadStatus }))
                    }
                  >
                    <SelectTrigger data-ocid="digital_leads.status.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "New",
                          "Contacted",
                          "Qualified",
                          "Converted",
                          "Dropped",
                        ] as LeadStatus[]
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Any additional notes…"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={2}
                    data-ocid="digital_leads.notes.textarea"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  data-ocid="digital_leads.add.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddLead}
                  disabled={
                    !form.name || !form.mobile || !form.source || !form.loanType
                  }
                  data-ocid="digital_leads.add.submit_button"
                >
                  Add Lead
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Leads Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Loan Interest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                      data-ocid="digital_leads.table.empty_state"
                    >
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((lead, idx) => {
                    const srcStyle = SOURCE_STYLES[lead.source];
                    return (
                      <TableRow
                        key={lead.id}
                        data-ocid={`digital_leads.table.item.${idx + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {lead.name}
                        </TableCell>
                        <TableCell className="text-sm">{lead.mobile}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.email || "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${srcStyle.bg} ${srcStyle.text}`}
                          >
                            {srcStyle.label}
                            <span className="font-normal opacity-90">
                              {lead.source}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {lead.loanType}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={STATUS_STYLES[lead.status]}
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {lead.date}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(lead.id)}
                            data-ocid={`digital_leads.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-muted-foreground"
      >
        Showing {filtered.length} of {leads.length} leads
      </motion.p>
    </div>
  );
}
