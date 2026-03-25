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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart2,
  Download,
  FileText,
  Loader2,
  Plus,
  Printer,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
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

// ─── Invoice Types ────────────────────────────────────────────────────────────
interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
}
interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientAddress: string;
  clientGST: string;
  items: InvoiceItem[];
  taxPercent: number;
  notes: string;
  total: number;
}

const todayStr = new Date().toISOString().split("T")[0];

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-001",
    date: "2026-03-01",
    dueDate: "2026-03-15",
    clientName: "Rajesh Enterprises",
    clientAddress: "45, MG Road, Pune, Maharashtra 411001",
    clientGST: "27AABCE1234F1Z5",
    items: [{ description: "DSA Service Fee", qty: 1, rate: 25000 }],
    taxPercent: 18,
    notes: "Thank you for your continued business.",
    total: 29500,
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-002",
    date: "2026-03-10",
    dueDate: "2026-03-25",
    clientName: "Mehta & Co.",
    clientAddress: "12, Nariman Point, Mumbai, Maharashtra 400021",
    clientGST: "27AACCM5678G1Z2",
    items: [{ description: "Loan Processing Charges", qty: 3, rate: 8000 }],
    taxPercent: 18,
    notes: "Payment due within 15 days.",
    total: 28320,
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-003",
    date: "2026-03-15",
    dueDate: "2026-03-30",
    clientName: "Sunita Finance",
    clientAddress: "8, Connaught Place, New Delhi 110001",
    clientGST: "07AABCS9012H1Z4",
    items: [
      { description: "Consulting Fee", qty: 1, rate: 15000 },
      { description: "Documentation Charges", qty: 1, rate: 5000 },
    ],
    taxPercent: 18,
    notes: "GST invoice as per applicable rates.",
    total: 23600,
  },
];

// ─── Invoice Preview Dialog ────────────────────────────────────────────────────
function InvoicePreviewDialog({
  invoice,
  open,
  onClose,
}: { invoice: Invoice | null; open: boolean; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);
  if (!invoice) return null;

  const companyName = localStorage.getItem("company_name") || "Uparjanam";
  const subtotal = invoice.items.reduce(
    (s, item) => s + item.qty * item.rate,
    0,
  );
  const taxAmount = (subtotal * invoice.taxPercent) / 100;
  const total = subtotal + taxAmount;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${invoice.invoiceNumber}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #111; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-size: 12px; text-transform: uppercase; }
        td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        .total-row td { font-weight: bold; font-size: 15px; border-bottom: none; }
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  const handleDownload = () => {
    const subtotalLine = invoice.items
      .map(
        (it) =>
          `  ${it.description} | Qty: ${it.qty} | Rate: \u20B9${it.rate} | Amount: \u20B9${it.qty * it.rate}`,
      )
      .join("\n");
    const text = [
      "INVOICE",
      `Company: ${companyName}`,
      `Invoice No: ${invoice.invoiceNumber}`,
      `Date: ${invoice.date}`,
      `Due Date: ${invoice.dueDate}`,
      "",
      "BILL TO:",
      invoice.clientName,
      invoice.clientAddress,
      `GST: ${invoice.clientGST}`,
      "",
      "ITEMS:",
      subtotalLine,
      "",
      `Subtotal: \u20B9${subtotal.toLocaleString()}`,
      `Tax (${invoice.taxPercent}%): \u20B9${taxAmount.toLocaleString()}`,
      `TOTAL: \u20B9${total.toLocaleString()}`,
      "",
      `Notes: ${invoice.notes}`,
      "",
      "Thank you for your business!",
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="invoice.preview.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" /> {invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>
        <div ref={printRef} className="space-y-5 py-2">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {companyName}
              </h2>
              <p className="text-sm text-muted-foreground">
                DSA & Financial Services
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">INVOICE</p>
              <p className="text-sm font-semibold">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="h-px bg-border" />
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase font-semibold">
                Invoice Date
              </p>
              <p>{invoice.date}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase font-semibold">
                Due Date
              </p>
              <p>{invoice.dueDate}</p>
            </div>
          </div>
          {/* Bill To */}
          <div className="bg-muted/40 rounded-lg p-4">
            <p className="text-xs uppercase font-semibold text-muted-foreground mb-2">
              Bill To
            </p>
            <p className="font-semibold text-foreground">
              {invoice.clientName}
            </p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {invoice.clientAddress}
            </p>
            {invoice.clientGST && (
              <p className="text-sm text-muted-foreground">
                GST: {invoice.clientGST}
              </p>
            )}
          </div>
          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Description
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Qty
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Rate (₹)
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr
                    key={`item-${item.description}-${i}`}
                    className="border-b border-border"
                  >
                    <td className="px-3 py-2">{item.description}</td>
                    <td className="text-right px-3 py-2">{item.qty}</td>
                    <td className="text-right px-3 py-2">
                      {item.rate.toLocaleString()}
                    </td>
                    <td className="text-right px-3 py-2 font-medium">
                      {(item.qty * item.rate).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tax ({invoice.taxPercent}%)
                </span>
                <span>₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {/* Notes */}
          {invoice.notes && (
            <div className="text-sm">
              <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">
                Notes
              </p>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
          <div className="h-px bg-border" />
          <p className="text-center text-sm text-muted-foreground">
            Thank you for your business!
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            data-ocid="invoice.preview.close_button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            data-ocid="invoice.preview.download_button"
            variant="outline"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="w-4 h-4" /> Download
          </Button>
          <Button
            data-ocid="invoice.preview.print_button"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="w-4 h-4" /> Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Invoice Generator Tab ─────────────────────────────────────────────────────
function InvoiceGenerator() {
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const nextNumber = `INV-${String(invoices.length + 1).padStart(3, "0")}`;

  const [form, setForm] = useState({
    invoiceNumber: nextNumber,
    date: todayStr,
    dueDate: "",
    clientName: "",
    clientAddress: "",
    clientGST: "",
    taxPercent: 18,
    notes: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", qty: 1, rate: 0 },
  ]);

  const subtotal = items.reduce((s, it) => s + it.qty * it.rate, 0);
  const taxAmount = (subtotal * form.taxPercent) / 100;
  const total = subtotal + taxAmount;

  const updateItem = (
    idx: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );
  };

  const addItem = () =>
    setItems((prev) => [...prev, { description: "", qty: 1, rate: 0 }]);
  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSaveAndPreview = () => {
    if (!form.clientName || !form.date || items.some((it) => !it.description)) {
      toast.error("Please fill client name, date, and all item descriptions");
      return;
    }
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: form.invoiceNumber,
      date: form.date,
      dueDate: form.dueDate,
      clientName: form.clientName,
      clientAddress: form.clientAddress,
      clientGST: form.clientGST,
      items: [...items],
      taxPercent: form.taxPercent,
      notes: form.notes,
      total,
    };
    setInvoices((prev) => [invoice, ...prev]);
    setPreviewInvoice(invoice);
    setPreviewOpen(true);
    const newNum = `INV-${String(invoices.length + 2).padStart(3, "0")}`;
    setForm({
      invoiceNumber: newNum,
      date: todayStr,
      dueDate: "",
      clientName: "",
      clientAddress: "",
      clientGST: "",
      taxPercent: 18,
      notes: "",
    });
    setItems([{ description: "", qty: 1, rate: 0 }]);
    toast.success("Invoice saved!");
  };

  return (
    <div className="space-y-6">
      {/* Create Invoice Card */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Create Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Invoice Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Invoice Number</Label>
              <Input
                data-ocid="invoice.number.input"
                value={form.invoiceNumber}
                onChange={(e) =>
                  setForm({ ...form, invoiceNumber: e.target.value })
                }
                placeholder="INV-001"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Invoice Date</Label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                data-ocid="invoice.date.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                data-ocid="invoice.due_date.input"
              />
            </div>
          </div>

          {/* Client Details */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Bill To</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Client Name</Label>
                <Input
                  data-ocid="invoice.client_name.input"
                  value={form.clientName}
                  onChange={(e) =>
                    setForm({ ...form, clientName: e.target.value })
                  }
                  placeholder="Rajesh Enterprises"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Client GST Number</Label>
                <Input
                  data-ocid="invoice.client_gst.input"
                  value={form.clientGST}
                  onChange={(e) =>
                    setForm({ ...form, clientGST: e.target.value })
                  }
                  placeholder="27AABCE1234F1Z5"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Client Address</Label>
              <Textarea
                data-ocid="invoice.client_address.textarea"
                value={form.clientAddress}
                onChange={(e) =>
                  setForm({ ...form, clientAddress: e.target.value })
                }
                placeholder="45, MG Road, Pune, Maharashtra 411001"
                rows={2}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Line Items
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addItem}
                className="gap-1 h-8 text-xs"
                data-ocid="invoice.add_item.button"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground min-w-[200px]">
                      Description
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-20">
                      Qty
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-28">
                      Rate (₹)
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground w-28">
                      Amount (₹)
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr
                      key={`item-${item.description}-${i}`}
                      className="border-b border-border"
                    >
                      <td className="px-2 py-1.5">
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(i, "description", e.target.value)
                          }
                          placeholder="Service description"
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(i, "qty", Number(e.target.value))
                          }
                          className="h-8 text-xs text-right"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(i, "rate", Number(e.target.value))
                          }
                          className="h-8 text-xs text-right"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-right font-medium text-sm">
                        ₹{(item.qty * item.rate).toLocaleString()}
                      </td>
                      <td className="px-2 py-1.5">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive"
                            onClick={() => removeItem(i)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Tax %</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.taxPercent}
                    onChange={(e) =>
                      setForm({ ...form, taxPercent: Number(e.target.value) })
                    }
                    className="h-7 w-20 text-xs text-right"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Amount</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              data-ocid="invoice.notes.textarea"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Payment terms, thank you message..."
              rows={2}
            />
          </div>

          <div className="flex justify-end">
            <Button
              data-ocid="invoice.save_preview.button"
              onClick={handleSaveAndPreview}
              className="gap-2"
            >
              <FileText className="w-4 h-4" /> Save &amp; Preview Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Invoices */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Saved Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="invoice.list.table">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs font-semibold text-muted-foreground pl-6">
                    Invoice No.
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Client
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground"
                      data-ocid="invoice.list.empty_state"
                    >
                      No invoices yet
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv, i) => (
                    <TableRow
                      key={inv.id}
                      data-ocid={`invoice.list.item.${i + 1}`}
                      className="border-border"
                    >
                      <TableCell className="pl-6 font-medium text-sm">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.date}
                      </TableCell>
                      <TableCell className="text-sm">
                        {inv.clientName}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-right text-primary">
                        ₹{inv.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            data-ocid={`invoice.preview.button.${i + 1}`}
                            onClick={() => {
                              setPreviewInvoice(inv);
                              setPreviewOpen(true);
                            }}
                          >
                            <Printer className="w-3 h-3" /> Preview
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InvoicePreviewDialog
        invoice={previewInvoice}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Accounting() {
  const { data: transactions = [] } = useGetAllTransactions();
  const addTransaction = useAddTransaction();

  const [localTxns, setLocalTxns] = useState<Transaction[]>([]);
  const allTransactions = useMemo(
    () => [
      ...(transactions.length > 0 ? transactions : FALLBACK_TRANSACTIONS),
      ...localTxns,
    ],
    [transactions, localTxns],
  );

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [mainTab, setMainTab] = useState("transactions");
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    transactionType: "income",
  });

  const summary = useMemo(() => {
    const income = allTransactions
      .filter((t) => t.transactionType === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = allTransactions
      .filter((t) => t.transactionType === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [allTransactions]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of allTransactions)
      map[t.category] = (map[t.category] || 0) + t.amount;
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allTransactions]);

  const filtered = useMemo(() => {
    return allTransactions.filter((t) => {
      const matchSearch =
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchType =
        typeFilter === "all" || t.transactionType === typeFilter;
      return matchSearch && matchType;
    });
  }, [allTransactions, search, typeFilter]);

  const exportCSV = () => {
    const rows = [
      "Type,Category,Description,Date,Amount",
      ...filtered.map(
        (t) =>
          `${t.transactionType},${t.category},"${t.description}",${new Date(Number(t.date) / 1_000_000).toLocaleDateString()},${t.amount}`,
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.category || !form.description) {
      toast.error("Please fill in all fields");
      return;
    }
    const newTxn: Transaction = {
      id: BigInt(Date.now()),
      transactionType: form.transactionType,
      amount: Number.parseFloat(form.amount),
      category: form.category,
      description: form.description,
      date: BigInt(Date.now() * 1_000_000),
    };
    try {
      await addTransaction.mutateAsync({
        amount: newTxn.amount,
        category: form.category,
        description: form.description,
        transactionType: form.transactionType,
      });
    } catch {
      // fallback to local
    }
    setLocalTxns((prev) => [...prev, newTxn]);
    toast.success("Transaction recorded");
    setIsOpen(false);
    setForm({
      amount: "",
      category: "",
      description: "",
      transactionType: "income",
    });
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
              Accounting
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Transactions &amp; Invoice Management
            </p>
          </div>
          {mainTab === "transactions" && (
            <Button
              data-ocid="accounting.add_transaction.open_modal_button"
              onClick={() => setIsOpen(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add Transaction
            </Button>
          )}
        </div>
      </motion.div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger
            value="transactions"
            data-ocid="accounting.transactions.tab"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger value="invoices" data-ocid="accounting.invoices.tab">
            Invoice Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-5 space-y-5">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportCSV}
                      className="gap-2 h-9"
                      data-ocid="accounting.export.button"
                    >
                      <Download className="w-4 h-4" /> Export CSV
                    </Button>
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
        </TabsContent>

        <TabsContent value="invoices" className="mt-5">
          <InvoiceGenerator />
        </TabsContent>
      </Tabs>

      {/* Add Transaction Dialog */}
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
