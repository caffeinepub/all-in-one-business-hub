import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileSearch,
  FileText,
  Loader2,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { LoanApplication } from "../backend.d";
import {
  useApplyForLoan,
  useGetAllLoanApplications,
} from "../hooks/useQueries";

const FALLBACK_LOANS: LoanApplication[] = [
  {
    id: 1n,
    applicantName: "Rajesh Kumar",
    loanType: "Home Loan",
    amount: 2500000,
    agentName: "Priya Sharma",
    status: "Approved",
    date: BigInt(Date.now()),
    notes: "Strong credit history",
  },
  {
    id: 2n,
    applicantName: "Anita Desai",
    loanType: "Business Loan",
    amount: 750000,
    agentName: "Vikram Singh",
    status: "Pending",
    date: BigInt(Date.now()),
    notes: "Awaiting documents",
  },
  {
    id: 3n,
    applicantName: "Suresh Patel",
    loanType: "Personal Loan",
    amount: 150000,
    agentName: "Meena Joshi",
    status: "Disbursed",
    date: BigInt(Date.now()),
    notes: "Completed",
  },
  {
    id: 4n,
    applicantName: "Kavitha Nair",
    loanType: "Car Loan",
    amount: 450000,
    agentName: "Arjun Rao",
    status: "Approved",
    date: BigInt(Date.now()),
    notes: "Verified",
  },
  {
    id: 5n,
    applicantName: "Mohammed Ali",
    loanType: "Education Loan",
    amount: 350000,
    agentName: "Priya Sharma",
    status: "Rejected",
    date: BigInt(Date.now()),
    notes: "Insufficient income",
  },
  {
    id: 6n,
    applicantName: "Deepika Menon",
    loanType: "Home Loan",
    amount: 3200000,
    agentName: "Vikram Singh",
    status: "Disbursed",
    date: BigInt(Date.now()),
    notes: "Completed",
  },
  {
    id: 7n,
    applicantName: "Kiran Bose",
    loanType: "Business Loan",
    amount: 1200000,
    agentName: "Meena Joshi",
    status: "Pending",
    date: BigInt(Date.now()),
    notes: "Under review",
  },
  {
    id: 8n,
    applicantName: "Pooja Verma",
    loanType: "Personal Loan",
    amount: 80000,
    agentName: "Arjun Rao",
    status: "Approved",
    date: BigInt(Date.now()),
    notes: "Verified",
  },
];

const LOAN_TYPES = [
  "Home Loan",
  "Business Loan",
  "Personal Loan",
  "Car Loan",
  "Education Loan",
  "Mortgage Loan",
];

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "approved")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium success-badge">
        {status}
      </span>
    );
  if (s === "pending")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium warning-badge">
        {status}
      </span>
    );
  if (s === "rejected")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
        {status}
      </span>
    );
  if (s === "disbursed")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
        {status}
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      {status}
    </span>
  );
}

// ─── CIBIL helpers ───────────────────────────────────────────────────────────

function computeCibilScore(pan: string): number {
  let hash = 0;
  for (let i = 0; i < pan.length; i++) {
    hash = (hash * 31 + pan.charCodeAt(i)) >>> 0;
  }
  return 550 + (hash % 351);
}

function scoreCategory(score: number): {
  label: string;
  color: string;
  remarks: string;
} {
  if (score >= 800)
    return {
      label: "Excellent",
      color: "text-green-600",
      remarks:
        "Excellent credit profile. Eligible for best interest rates and highest loan amounts. Lenders consider this applicant very low risk.",
    };
  if (score >= 750)
    return {
      label: "Good",
      color: "text-green-500",
      remarks:
        "Good credit standing. Eligible for most loan products at competitive rates. Minor improvements can unlock premium offers.",
    };
  if (score >= 650)
    return {
      label: "Fair",
      color: "text-amber-500",
      remarks:
        "Fair credit score. Loan approvals possible with standard terms. Recommend clearing outstanding dues and maintaining timely repayments to improve score.",
    };
  return {
    label: "Poor",
    color: "text-red-600",
    remarks:
      "Poor credit score. High risk profile for lenders. Loan approval may require collateral or co-applicant. Strongly advise immediate credit repair steps.",
  };
}

interface CibilResult {
  pan: string;
  name: string;
  mobile: string;
  score: number;
  date: string;
}

function CibilCheck() {
  const [form, setForm] = useState({ pan: "", name: "", mobile: "" });
  const [result, setResult] = useState<CibilResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = () => {
    if (!form.pan || !form.name || !form.mobile) {
      toast.error("Please fill all fields");
      return;
    }
    if (form.pan.length < 10) {
      toast.error("Please enter a valid 10-character PAN number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const score = computeCibilScore(form.pan.toUpperCase());
      setResult({
        pan: form.pan.toUpperCase(),
        name: form.name,
        mobile: form.mobile,
        score,
        date: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      });
      setLoading(false);
      toast.success("CIBIL score fetched successfully");
    }, 1200);
  };

  const handleDownload = () => {
    if (!result) return;
    const cat = scoreCategory(result.score);
    const lines = [
      "============================================================",
      "             CIBIL CREDIT REPORT - UPARJANAM",
      "============================================================",
      "",
      `Report Generated : ${result.date}`,
      "",
      "-- APPLICANT DETAILS ---------------------------------------",
      `Name             : ${result.name}`,
      `PAN Number       : ${result.pan}`,
      `Mobile           : ${result.mobile}`,
      "",
      "-- CREDIT SCORE --------------------------------------------",
      `CIBIL Score      : ${result.score} / 900`,
      `Category         : ${cat.label}`,
      "Score Range      : 300 - 900",
      "",
      "-- REMARKS -------------------------------------------------",
      cat.remarks,
      "",
      "-- DISCLAIMER ----------------------------------------------",
      "This report is simulated for demonstration purposes only.",
      "For official CIBIL reports, visit www.cibil.com",
      "============================================================",
    ];
    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CIBIL_Report_${result.pan}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CIBIL report downloaded");
  };

  const progressValue = result ? ((result.score - 300) / 600) * 100 : 0;

  return (
    <div className="space-y-5">
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-primary" />
            Check CIBIL Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1.5">
              <Label htmlFor="cibil-pan">PAN Number</Label>
              <Input
                id="cibil-pan"
                data-ocid="cibil.pan.input"
                placeholder="ABCDE1234F"
                value={form.pan}
                maxLength={10}
                onChange={(e) =>
                  setForm({ ...form, pan: e.target.value.toUpperCase() })
                }
                className="uppercase font-mono tracking-wider"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cibil-name">Applicant Name</Label>
              <Input
                id="cibil-name"
                data-ocid="cibil.name.input"
                placeholder="Rajesh Kumar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cibil-mobile">Mobile Number</Label>
              <Input
                id="cibil-mobile"
                data-ocid="cibil.mobile.input"
                placeholder="9876543210"
                value={form.mobile}
                maxLength={10}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mobile: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </div>
          </div>
          <Button
            data-ocid="cibil.check.primary_button"
            onClick={handleCheck}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching Score...
              </>
            ) : (
              <>
                <FileSearch className="w-4 h-4" />
                Check CIBIL Score
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result &&
        (() => {
          const cat = scoreCategory(result.score);
          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card
                className="shadow-card border-border"
                data-ocid="cibil.result.card"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="text-base">
                      CIBIL Score Report
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      data-ocid="cibil.download.button"
                      onClick={handleDownload}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-center">
                      <p
                        className={`text-6xl font-bold tabular-nums ${cat.color}`}
                      >
                        {result.score}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        out of 900
                      </p>
                    </div>
                    <div className="flex-1 min-w-[180px] space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold px-2 py-0.5 rounded ${
                            result.score >= 800
                              ? "bg-green-100 text-green-700"
                              : result.score >= 750
                                ? "bg-green-50 text-green-600"
                                : result.score >= 650
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {cat.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Range: 300 &ndash; 900
                        </span>
                      </div>
                      <div
                        className={`h-3 rounded-full overflow-hidden bg-muted ${
                          result.score >= 750
                            ? "[&>div]:bg-green-500"
                            : result.score >= 650
                              ? "[&>div]:bg-amber-400"
                              : "[&>div]:bg-red-500"
                        }`}
                      >
                        <Progress
                          value={progressValue}
                          className="h-3"
                          data-ocid="cibil.score.progress"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>300 Poor</span>
                        <span>550 Fair</span>
                        <span>750 Good</span>
                        <span>800+ Excellent</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Applicant</p>
                      <p className="text-sm font-medium">{result.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        PAN Number
                      </p>
                      <p className="text-sm font-mono font-medium">
                        {result.pan}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Mobile</p>
                      <p className="text-sm font-medium">{result.mobile}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Date Checked
                      </p>
                      <p className="text-sm font-medium">{result.date}</p>
                    </div>
                  </div>

                  <div
                    className={`flex gap-3 p-4 rounded-lg border ${
                      result.score >= 750
                        ? "bg-green-50 border-green-200 text-green-800"
                        : result.score >= 650
                          ? "bg-amber-50 border-amber-200 text-amber-800"
                          : "bg-red-50 border-red-200 text-red-800"
                    }`}
                    data-ocid="cibil.remarks.card"
                  >
                    {result.score >= 750 ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm">{cat.remarks}</p>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    * This score is simulated for demonstration. For official
                    CIBIL reports, visit{" "}
                    <a
                      href="https://www.cibil.com"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      www.cibil.com
                    </a>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LoanManagement() {
  const { data: loans = [] } = useGetAllLoanApplications();
  const applyForLoan = useApplyForLoan();

  const displayLoans = loans.length > 0 ? loans : FALLBACK_LOANS;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [mainTab, setMainTab] = useState("applications");
  const [form, setForm] = useState({
    applicantName: "",
    loanType: "",
    amount: "",
    agentName: "",
    notes: "",
  });

  const stats = useMemo(
    () => ({
      total: displayLoans.length,
      pending: displayLoans.filter((l) => l.status.toLowerCase() === "pending")
        .length,
      approved: displayLoans.filter(
        (l) => l.status.toLowerCase() === "approved",
      ).length,
      disbursed: displayLoans.filter(
        (l) => l.status.toLowerCase() === "disbursed",
      ).length,
      rejected: displayLoans.filter(
        (l) => l.status.toLowerCase() === "rejected",
      ).length,
    }),
    [displayLoans],
  );

  const filtered = useMemo(() => {
    return displayLoans.filter((l) => {
      const matchSearch =
        l.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        l.loanType.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" || l.status.toLowerCase() === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [displayLoans, search, statusFilter]);

  const handleSubmit = async () => {
    if (
      !form.applicantName ||
      !form.loanType ||
      !form.amount ||
      !form.agentName
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await applyForLoan.mutateAsync({
        applicantName: form.applicantName,
        loanType: form.loanType,
        amount: Number.parseFloat(form.amount),
        agentName: form.agentName,
        notes: form.notes,
      });
      toast.success("Loan application submitted");
      setIsOpen(false);
      setForm({
        applicantName: "",
        loanType: "",
        amount: "",
        agentName: "",
        notes: "",
      });
    } catch {
      toast.error("Failed to submit application");
    }
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              DSA Loan Management
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {displayLoans.length} total applications
            </p>
          </div>
          {mainTab === "applications" && (
            <Button
              data-ocid="loans.new_application.open_modal_button"
              onClick={() => setIsOpen(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> New Application
            </Button>
          )}
        </div>
      </motion.div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="mb-2">
          <TabsTrigger
            data-ocid="loans.main.applications.tab"
            value="applications"
          >
            Loan Applications
          </TabsTrigger>
          <TabsTrigger data-ocid="loans.main.cibil.tab" value="cibil">
            CIBIL Check
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-5 mt-0">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <PipelineCard
              label="Pending"
              value={stats.pending}
              icon={<Clock className="w-4 h-4" />}
              color="warning"
              ocid="loans.pending.card"
            />
            <PipelineCard
              label="Approved"
              value={stats.approved}
              icon={<CheckCircle className="w-4 h-4" />}
              color="success"
              ocid="loans.approved.card"
            />
            <PipelineCard
              label="Disbursed"
              value={stats.disbursed}
              icon={<FileText className="w-4 h-4" />}
              color="primary"
              ocid="loans.disbursed.card"
            />
            <PipelineCard
              label="Rejected"
              value={stats.rejected}
              icon={<XCircle className="w-4 h-4" />}
              color="destructive"
              ocid="loans.rejected.card"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      data-ocid="loans.search.input"
                      placeholder="Search applicants..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList className="h-9">
                      <TabsTrigger
                        data-ocid="loans.all.tab"
                        value="all"
                        className="text-xs"
                      >
                        All
                      </TabsTrigger>
                      <TabsTrigger
                        data-ocid="loans.pending.tab"
                        value="pending"
                        className="text-xs"
                      >
                        Pending
                      </TabsTrigger>
                      <TabsTrigger
                        data-ocid="loans.approved.tab"
                        value="approved"
                        className="text-xs"
                      >
                        Approved
                      </TabsTrigger>
                      <TabsTrigger
                        data-ocid="loans.disbursed.tab"
                        value="disbursed"
                        className="text-xs"
                      >
                        Disbursed
                      </TabsTrigger>
                      <TabsTrigger
                        data-ocid="loans.rejected.tab"
                        value="rejected"
                        className="text-xs"
                      >
                        Rejected
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table data-ocid="loans.applications.table">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs font-semibold text-muted-foreground pl-6">
                        Applicant
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Loan Type
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Amount
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Agent
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-10 text-muted-foreground"
                          data-ocid="loans.applications.empty_state"
                        >
                          No applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((loan, i) => (
                        <TableRow
                          key={String(loan.id)}
                          data-ocid={`loans.applications.item.${i + 1}`}
                          className="border-border"
                        >
                          <TableCell className="font-medium text-sm pl-6">
                            {loan.applicantName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {loan.loanType}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            ₹{loan.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {loan.agentName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(
                              Number(loan.date) / 1_000_000,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <StatusPill status={loan.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="cibil" className="mt-0">
          <CibilCheck />
        </TabsContent>
      </Tabs>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          data-ocid="loans.new_application.dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>New Loan Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="loan-applicant">Applicant Name</Label>
                <Input
                  id="loan-applicant"
                  data-ocid="loans.applicant_name.input"
                  placeholder="Rajesh Kumar"
                  value={form.applicantName}
                  onChange={(e) =>
                    setForm({ ...form, applicantName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Loan Type</Label>
                <Select
                  value={form.loanType}
                  onValueChange={(v) => setForm({ ...form, loanType: v })}
                >
                  <SelectTrigger data-ocid="loans.loan_type.select">
                    <SelectValue placeholder="Select type" />
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="loan-amount">Amount (&#8377;)</Label>
                <Input
                  id="loan-amount"
                  data-ocid="loans.amount.input"
                  type="number"
                  placeholder="500000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loan-agent">Agent Name</Label>
                <Input
                  id="loan-agent"
                  data-ocid="loans.agent_name.input"
                  placeholder="Priya Sharma"
                  value={form.agentName}
                  onChange={(e) =>
                    setForm({ ...form, agentName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loan-notes">Notes</Label>
              <Textarea
                id="loan-notes"
                data-ocid="loans.notes.textarea"
                placeholder="Additional information..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="loans.new_application.cancel_button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="loans.new_application.submit_button"
              onClick={handleSubmit}
              disabled={applyForLoan.isPending}
            >
              {applyForLoan.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PipelineCard({
  label,
  value,
  icon,
  color,
  ocid,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  ocid: string;
}) {
  const colorMap: Record<string, string> = {
    warning: "warning-badge",
    success: "success-badge",
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <Card className="shadow-card border-border" data-ocid={ocid}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <span className={`p-1.5 rounded-md text-xs ${colorMap[color]}`}>
            {icon}
          </span>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
