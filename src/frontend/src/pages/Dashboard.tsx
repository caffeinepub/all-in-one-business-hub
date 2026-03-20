import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Page } from "../App";
import {
  useGetAllEmployees,
  useGetAllLoanApplications,
  useGetAllTransactions,
} from "../hooks/useQueries";

const PIPELINE_DATA = [
  { month: "Aug", disbursed: 42, approved: 25 },
  { month: "Sep", disbursed: 55, approved: 31 },
  { month: "Oct", disbursed: 48, approved: 28 },
  { month: "Nov", disbursed: 63, approved: 35 },
  { month: "Dec", disbursed: 71, approved: 40 },
  { month: "Jan", disbursed: 58, approved: 33 },
  { month: "Feb", disbursed: 85, approved: 48 },
];

const STATUS_BREAKDOWN = [
  { status: "Disbursed", count: 85 },
  { status: "Approved", count: 48 },
  { status: "Pending", count: 32 },
  { status: "Rejected", count: 14 },
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
  return <Badge variant="secondary">{status}</Badge>;
}

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: employees = [] } = useGetAllEmployees();
  const { data: loans = [] } = useGetAllLoanApplications();
  const { data: transactions = [] } = useGetAllTransactions();

  const stats = useMemo(() => {
    const pendingLoans = loans.filter(
      (l) => l.status.toLowerCase() === "pending",
    ).length;
    const totalIncome = transactions
      .filter((t) => t.transactionType === "income")
      .reduce((s, t) => s + t.amount, 0);
    const pendingPayouts = loans
      .filter((l) => l.status.toLowerCase() === "approved")
      .reduce((s, l) => s + l.amount, 0);
    return {
      totalEmployees: employees.length || 142,
      totalLoans: loans.length || 179,
      pendingLoans: pendingLoans || 18,
      totalRevenue: totalIncome || 1_284_500,
      pendingPayouts: pendingPayouts || 342_000,
    };
  }, [employees, loans, transactions]);

  const recentLoans = loans.length > 0 ? loans.slice(0, 8) : FALLBACK_LOANS;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-foreground">
          Welcome Back, Sarah! 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KPICard
          icon={<Users className="w-4 h-4" />}
          label="Total Employees"
          value={stats.totalEmployees.toLocaleString()}
          trend="+5 this month"
          ocid="dashboard.employees.card"
        />
        <KPICard
          icon={<FileText className="w-4 h-4" />}
          label="Loan Applications"
          value={stats.totalLoans.toLocaleString()}
          badge={`${stats.pendingLoans} Pending`}
          ocid="dashboard.loans.card"
        />
        <KPICard
          icon={<DollarSign className="w-4 h-4" />}
          label="Total Revenue"
          value={`₹${(stats.totalRevenue / 1000).toFixed(0)}K`}
          trend="+12.4% vs last month"
          ocid="dashboard.revenue.card"
        />
        <KPICard
          icon={<Clock className="w-4 h-4" />}
          label="Pending Payouts"
          value={`₹${(stats.pendingPayouts / 1000).toFixed(0)}K`}
          trend="18 approved loans"
          ocid="dashboard.payouts.card"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              DSA Loan Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Monthly Loan Activity
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={PIPELINE_DATA}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorDisbursed"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.39 0.1 231)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.39 0.1 231)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorApproved"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.6 0.12 187)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.6 0.12 187)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.91 0.006 82)"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "oklch(0.508 0.016 264)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "oklch(0.508 0.016 264)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid oklch(0.91 0.006 82)",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Area
                      type="monotone"
                      dataKey="disbursed"
                      name="Disbursed"
                      stroke="oklch(0.39 0.1 231)"
                      fill="url(#colorDisbursed)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="approved"
                      name="Approved"
                      stroke="oklch(0.6 0.12 187)"
                      fill="url(#colorApproved)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Loan Status Breakdown
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={STATUS_BREAKDOWN}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="oklch(0.91 0.006 82)"
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: "oklch(0.508 0.016 264)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="status"
                      tick={{ fontSize: 12, fill: "oklch(0.508 0.016 264)" }}
                      axisLine={false}
                      tickLine={false}
                      width={72}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid oklch(0.91 0.006 82)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Count"
                      fill="oklch(0.39 0.1 231)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Recent Loan Applications
            </CardTitle>
            <button
              type="button"
              data-ocid="dashboard.loans.link"
              onClick={() => onNavigate("loans")}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <Table data-ocid="dashboard.loans.table">
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
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLoans.map((loan, i) => (
                  <TableRow
                    key={String(loan.id)}
                    data-ocid={`dashboard.loans.item.${i + 1}`}
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
                    <TableCell>
                      <StatusPill status={loan.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              HR Overview
            </CardTitle>
            <button
              type="button"
              data-ocid="dashboard.hr.link"
              onClick={() => onNavigate("hr")}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              Manage team <ArrowUpRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {HR_DEPT_STATS.map((dept) => (
                <div key={dept.dept} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{dept.dept}</p>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {dept.count}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {dept.active} active
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  trend,
  badge,
  ocid,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  badge?: string;
  ocid: string;
}) {
  return (
    <Card className="shadow-card border-border" data-ocid={ocid}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-accent" />
            {trend}
          </p>
        )}
        {badge && (
          <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium warning-badge">
            {badge}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

const FALLBACK_LOANS = [
  {
    id: 1n,
    applicantName: "Rajesh Kumar",
    loanType: "Home Loan",
    amount: 2500000,
    agentName: "Priya Sharma",
    status: "Approved",
    date: BigInt(Date.now()),
    notes: "",
  },
  {
    id: 2n,
    applicantName: "Anita Desai",
    loanType: "Business Loan",
    amount: 750000,
    agentName: "Vikram Singh",
    status: "Pending",
    date: BigInt(Date.now()),
    notes: "",
  },
  {
    id: 3n,
    applicantName: "Suresh Patel",
    loanType: "Personal Loan",
    amount: 150000,
    agentName: "Meena Joshi",
    status: "Disbursed",
    date: BigInt(Date.now()),
    notes: "",
  },
  {
    id: 4n,
    applicantName: "Kavitha Nair",
    loanType: "Car Loan",
    amount: 450000,
    agentName: "Arjun Rao",
    status: "Approved",
    date: BigInt(Date.now()),
    notes: "",
  },
  {
    id: 5n,
    applicantName: "Mohammed Ali",
    loanType: "Education Loan",
    amount: 350000,
    agentName: "Priya Sharma",
    status: "Rejected",
    date: BigInt(Date.now()),
    notes: "",
  },
  {
    id: 6n,
    applicantName: "Deepika Menon",
    loanType: "Home Loan",
    amount: 3200000,
    agentName: "Vikram Singh",
    status: "Disbursed",
    date: BigInt(Date.now()),
    notes: "",
  },
];

const HR_DEPT_STATS = [
  { dept: "Engineering", count: 38, active: 35 },
  { dept: "Sales", count: 42, active: 40 },
  { dept: "Operations", count: 28, active: 27 },
  { dept: "Finance", count: 18, active: 18 },
];
