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
import {
  BarChart2,
  Loader2,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import type { Transaction } from "../backend.d";
import { useAddTransaction, useGetAllTransactions } from "../hooks/useQueries";

const FALLBACK_TRANSACTIONS: Transaction[] = [
  {
    id: 1n,
    transactionType: "income",
    amount: 285000,
    category: "Loan Disbursement Fee",
    description: "Processing fees from Q4 disbursements",
    date: BigInt(new Date("2026-03-01").getTime() * 1_000_000),
  },
  {
    id: 2n,
    transactionType: "expense",
    amount: 45000,
    category: "Operational",
    description: "Office rent and utilities - March",
    date: BigInt(new Date("2026-03-02").getTime() * 1_000_000),
  },
  {
    id: 3n,
    transactionType: "income",
    amount: 125000,
    category: "Interest Income",
    description: "Monthly interest collection",
    date: BigInt(new Date("2026-03-05").getTime() * 1_000_000),
  },
  {
    id: 4n,
    transactionType: "expense",
    amount: 32000,
    category: "Payroll",
    description: "Sales team bonuses",
    date: BigInt(new Date("2026-03-07").getTime() * 1_000_000),
  },
  {
    id: 5n,
    transactionType: "income",
    amount: 98000,
    category: "Processing Fee",
    description: "Home loan application fees",
    date: BigInt(new Date("2026-03-10").getTime() * 1_000_000),
  },
  {
    id: 6n,
    transactionType: "expense",
    amount: 18500,
    category: "Marketing",
    description: "Digital marketing campaign",
    date: BigInt(new Date("2026-03-12").getTime() * 1_000_000),
  },
  {
    id: 7n,
    transactionType: "income",
    amount: 340000,
    category: "Loan Disbursement Fee",
    description: "Business loan fees Q1",
    date: BigInt(new Date("2026-03-15").getTime() * 1_000_000),
  },
  {
    id: 8n,
    transactionType: "expense",
    amount: 56000,
    category: "Payroll",
    description: "Monthly payroll processing",
    date: BigInt(new Date("2026-03-18").getTime() * 1_000_000),
  },
];

const CATEGORIES = [
  "Loan Disbursement Fee",
  "Interest Income",
  "Processing Fee",
  "Payroll",
  "Operational",
  "Marketing",
  "Miscellaneous",
];
const PIE_COLORS = [
  "oklch(0.39 0.1 231)",
  "oklch(0.6 0.12 187)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.627 0.265 303.9)",
  "oklch(0.645 0.246 16.439)",
];

export default function Accounting() {
  const { data: transactions = [] } = useGetAllTransactions();
  const addTransaction = useAddTransaction();

  const displayTransactions =
    transactions.length > 0 ? transactions : FALLBACK_TRANSACTIONS;

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    transactionType: "income",
  });

  const summary = useMemo(() => {
    const income = displayTransactions
      .filter((t) => t.transactionType === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = displayTransactions
      .filter((t) => t.transactionType === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [displayTransactions]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of displayTransactions) {
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [displayTransactions]);

  const filtered = useMemo(() => {
    return displayTransactions.filter((t) => {
      const matchSearch =
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchType =
        typeFilter === "all" || t.transactionType === typeFilter;
      return matchSearch && matchType;
    });
  }, [displayTransactions, search, typeFilter]);

  const handleSubmit = async () => {
    if (!form.amount || !form.category || !form.description) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await addTransaction.mutateAsync({
        amount: Number.parseFloat(form.amount),
        category: form.category,
        description: form.description,
        transactionType: form.transactionType,
      });
      toast.success("Transaction recorded");
      setIsOpen(false);
      setForm({
        amount: "",
        category: "",
        description: "",
        transactionType: "income",
      });
    } catch {
      toast.error("Failed to add transaction");
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
              Transaction Ledger
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {displayTransactions.length} transactions
            </p>
          </div>
          <Button
            data-ocid="accounting.add_transaction.open_modal_button"
            onClick={() => setIsOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card
          className="shadow-card border-border"
          data-ocid="accounting.income.card"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Income
              </p>
              <div className="p-1.5 rounded-md success-badge">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ₹{(summary.income / 1000).toFixed(0)}K
            </p>
          </CardContent>
        </Card>
        <Card
          className="shadow-card border-border"
          data-ocid="accounting.expense.card"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Expenses
              </p>
              <div className="p-1.5 rounded-md bg-destructive/10 text-destructive">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ₹{(summary.expense / 1000).toFixed(0)}K
            </p>
          </CardContent>
        </Card>
        <Card
          className="shadow-card border-border"
          data-ocid="accounting.balance.card"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Net Balance
              </p>
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <BarChart2 className="w-4 h-4" />
              </div>
            </div>
            <p
              className={`text-2xl font-bold ${summary.net >= 0 ? "text-foreground" : "text-destructive"}`}
            >
              ₹{(summary.net / 1000).toFixed(0)}K
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
                  contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    data-ocid="accounting.search.input"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                  <TabsList className="h-9">
                    <TabsTrigger
                      data-ocid="accounting.all.tab"
                      value="all"
                      className="text-xs"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      data-ocid="accounting.income.tab"
                      value="income"
                      className="text-xs"
                    >
                      Income
                    </TabsTrigger>
                    <TabsTrigger
                      data-ocid="accounting.expense.tab"
                      value="expense"
                      className="text-xs"
                    >
                      Expenses
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table data-ocid="accounting.transactions.table">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs font-semibold text-muted-foreground pl-6">
                        Description
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Category
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground text-right pr-6">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-10 text-muted-foreground"
                          data-ocid="accounting.transactions.empty_state"
                        >
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((txn, i) => (
                        <TableRow
                          key={String(txn.id)}
                          data-ocid={`accounting.transactions.item.${i + 1}`}
                          className="border-border"
                        >
                          <TableCell className="pl-6">
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                              {txn.description}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {txn.category}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(
                              Number(txn.date) / 1_000_000,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell
                            className={`text-sm font-semibold text-right pr-6 ${txn.transactionType === "income" ? "text-accent" : "text-destructive"}`}
                          >
                            {txn.transactionType === "income" ? "+" : "-"}₹
                            {txn.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          data-ocid="accounting.add_transaction.dialog"
          className="max-w-[95vw] sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.transactionType}
                  onValueChange={(v) =>
                    setForm({ ...form, transactionType: v })
                  }
                >
                  <SelectTrigger data-ocid="accounting.transaction_type.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="txn-amount">Amount (₹)</Label>
                <Input
                  id="txn-amount"
                  data-ocid="accounting.amount.input"
                  type="number"
                  placeholder="50000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger data-ocid="accounting.category.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="txn-desc">Description</Label>
              <Textarea
                id="txn-desc"
                data-ocid="accounting.description.textarea"
                placeholder="Transaction details..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="accounting.add_transaction.cancel_button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="accounting.add_transaction.submit_button"
              onClick={handleSubmit}
              disabled={addTransaction.isPending}
            >
              {addTransaction.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Transaction"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
