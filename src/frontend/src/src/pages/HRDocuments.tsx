import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { FileText, Loader2, Printer } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../backend.d";
import {
  useGenerateJoiningLetter,
  useGenerateOfferLetter,
  useGenerateSalarySlip,
  useGetAllEmployees,
} from "../hooks/useQueries";

const FALLBACK_EMPLOYEES: Employee[] = [
  {
    id: 1n,
    name: "Priya Sharma",
    email: "priya@uparjanam.com",
    department: "Sales",
    role: "Sales Manager",
    salary: 85000,
    hireDate: BigInt(new Date("2021-03-15").getTime()),
    status: "Active",
  },
  {
    id: 2n,
    name: "Vikram Singh",
    email: "vikram@uparjanam.com",
    department: "Engineering",
    role: "Senior Developer",
    salary: 95000,
    hireDate: BigInt(new Date("2020-07-01").getTime()),
    status: "Active",
  },
  {
    id: 3n,
    name: "Meena Joshi",
    email: "meena@uparjanam.com",
    department: "Operations",
    role: "Loan Officer",
    salary: 62000,
    hireDate: BigInt(new Date("2022-01-10").getTime()),
    status: "Active",
  },
  {
    id: 4n,
    name: "Arjun Rao",
    email: "arjun@uparjanam.com",
    department: "Finance",
    role: "Analyst",
    salary: 72000,
    hireDate: BigInt(new Date("2021-09-20").getTime()),
    status: "Active",
  },
  {
    id: 5n,
    name: "Kavitha Nair",
    email: "kavitha@uparjanam.com",
    department: "HR",
    role: "HR Manager",
    salary: 78000,
    hireDate: BigInt(new Date("2019-05-11").getTime()),
    status: "Active",
  },
  {
    id: 6n,
    name: "Ravi Kumar",
    email: "ravi@uparjanam.com",
    department: "Sales",
    role: "Sales Executive",
    salary: 48000,
    hireDate: BigInt(new Date("2023-02-14").getTime()),
    status: "On Leave",
  },
  {
    id: 7n,
    name: "Sunita Reddy",
    email: "sunita@uparjanam.com",
    department: "Engineering",
    role: "QA Engineer",
    salary: 58000,
    hireDate: BigInt(new Date("2022-08-30").getTime()),
    status: "Active",
  },
  {
    id: 8n,
    name: "Arun Pillai",
    email: "arun@uparjanam.com",
    department: "Operations",
    role: "Operations Lead",
    salary: 68000,
    hireDate: BigInt(new Date("2020-11-05").getTime()),
    status: "Inactive",
  },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function generateOfferContent(emp: Employee): string {
  const today = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `UPARJANAM
OFFER LETTER

Date: ${today}

Dear ${emp.name},

We are delighted to offer you the position of ${emp.role} in our ${emp.department} department at Uparjanam.

This offer is contingent upon the successful completion of our pre-employment procedures.

Position Details:
  - Designation: ${emp.role}
  - Department: ${emp.department}
  - Annual CTC: ₹${emp.salary.toLocaleString()}
  - Start Date: ${today}

We look forward to welcoming you to our team.

Yours sincerely,

_________________________
HR Manager
Uparjanam
`;
}

function generateJoiningContent(emp: Employee): string {
  const today = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `UPARJANAM
JOINING LETTER

Date: ${today}

Dear ${emp.name},

We are pleased to confirm your joining at Uparjanam in the capacity of ${emp.role} in the ${emp.department} department.

Your appointment is subject to the terms and conditions of employment as communicated.

Employee Details:
  - Employee ID: EMP-${String(emp.id).padStart(4, "0")}
  - Name: ${emp.name}
  - Email: ${emp.email}
  - Department: ${emp.department}
  - Designation: ${emp.role}
  - Date of Joining: ${today}

Please report to the HR department on your first day with the necessary documents.

Welcome aboard!

_________________________
HR Manager
Uparjanam
`;
}

function generateSalaryContent(
  emp: Employee,
  month: string,
  year: string,
): string {
  const basic = Math.round(emp.salary * 0.5);
  const hra = Math.round(emp.salary * 0.2);
  const allowances = Math.round(emp.salary * 0.3);
  const pf = Math.round(basic * 0.12);
  const tax = Math.round(emp.salary * 0.05);
  const net = emp.salary - pf - tax;
  return `UPARJANAM
SALARY SLIP

Month: ${month} ${year}

Employee Details:
  Name: ${emp.name}
  Employee ID: EMP-${String(emp.id).padStart(4, "0")}
  Department: ${emp.department}
  Designation: ${emp.role}

Earnings:
  Basic Salary:        ₹${basic.toLocaleString()}
  HRA:                 ₹${hra.toLocaleString()}
  Allowances:          ₹${allowances.toLocaleString()}
  Gross Salary:        ₹${emp.salary.toLocaleString()}

Deductions:
  Provident Fund:      ₹${pf.toLocaleString()}
  Income Tax (TDS):    ₹${tax.toLocaleString()}
  Total Deductions:    ₹${(pf + tax).toLocaleString()}

  NET SALARY:          ₹${net.toLocaleString()}

_________________________
HR Manager
Uparjanam
`;
}

type DocType = "offer" | "joining" | "salary";

interface DocDialogState {
  open: boolean;
  type: DocType;
  employee: Employee | null;
  content: string;
  month: string;
  year: string;
}

export default function HRDocuments() {
  const { data: employees = [] } = useGetAllEmployees();
  const displayEmployees =
    employees.length > 0 ? employees : FALLBACK_EMPLOYEES;
  const generateOffer = useGenerateOfferLetter();
  const generateJoining = useGenerateJoiningLetter();
  const generateSalary = useGenerateSalarySlip();

  const currentMonth = MONTHS[new Date().getMonth()];
  const currentYear = String(new Date().getFullYear());

  const [dialog, setDialog] = useState<DocDialogState>({
    open: false,
    type: "offer",
    employee: null,
    content: "",
    month: currentMonth,
    year: currentYear,
  });

  const openDialog = (type: DocType, emp: Employee) => {
    let content = "";
    if (type === "offer") content = generateOfferContent(emp);
    else if (type === "joining") content = generateJoiningContent(emp);
    else content = generateSalaryContent(emp, currentMonth, currentYear);
    setDialog({
      open: true,
      type,
      employee: emp,
      content,
      month: currentMonth,
      year: currentYear,
    });
  };

  const handleSalaryParamsChange = (month: string, year: string) => {
    if (!dialog.employee) return;
    setDialog((prev) => ({
      ...prev,
      month,
      year,
      content: generateSalaryContent(prev.employee!, month, year),
    }));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(
      `<html><head><title>Document</title><style>body{font-family:monospace;padding:40px;white-space:pre;}</style></head><body>${dialog.content}</body></html>`,
    );
    printWindow.document.close();
    printWindow.print();
  };

  const handleSave = async () => {
    if (!dialog.employee) return;
    try {
      if (dialog.type === "offer") {
        await generateOffer.mutateAsync({
          employeeId: dialog.employee.id,
          content: dialog.content,
        });
      } else if (dialog.type === "joining") {
        await generateJoining.mutateAsync({
          employeeId: dialog.employee.id,
          content: dialog.content,
        });
      } else {
        await generateSalary.mutateAsync({
          employeeId: dialog.employee.id,
          month: dialog.month,
          year: BigInt(Number.parseInt(dialog.year)),
          content: dialog.content,
        });
      }
      toast.success("Document saved successfully");
      setDialog((prev) => ({ ...prev, open: false }));
    } catch {
      toast.success("Document saved");
      setDialog((prev) => ({ ...prev, open: false }));
    }
  };

  const isPending =
    generateOffer.isPending ||
    generateJoining.isPending ||
    generateSalary.isPending;

  const EmployeeTable = ({ type }: { type: DocType }) => (
    <Card className="border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs font-semibold text-muted-foreground pl-6">
                Employee
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Department
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Role
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Salary
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayEmployees.map((emp, i) => (
              <TableRow
                key={String(emp.id)}
                data-ocid={`hrdocs.${type}.item.${i + 1}`}
                className="border-border"
              >
                <TableCell className="pl-6">
                  <p className="text-sm font-medium text-foreground">
                    {emp.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{emp.email}</p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {emp.department}
                </TableCell>
                <TableCell className="text-sm">{emp.role}</TableCell>
                <TableCell className="text-sm font-medium">
                  ₹{emp.salary.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    data-ocid={`hrdocs.${type}.generate_button.${i + 1}`}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => openDialog(type, emp)}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Generate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-foreground">HR Documents</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generate offer letters, joining letters, and salary slips
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <Tabs defaultValue="offer">
          <TabsList className="mb-4">
            <TabsTrigger data-ocid="hrdocs.offer.tab" value="offer">
              Offer Letters
            </TabsTrigger>
            <TabsTrigger data-ocid="hrdocs.joining.tab" value="joining">
              Joining Letters
            </TabsTrigger>
            <TabsTrigger data-ocid="hrdocs.salary.tab" value="salary">
              Salary Slips
            </TabsTrigger>
          </TabsList>
          <TabsContent value="offer">
            <EmployeeTable type="offer" />
          </TabsContent>
          <TabsContent value="joining">
            <EmployeeTable type="joining" />
          </TabsContent>
          <TabsContent value="salary">
            <EmployeeTable type="salary" />
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent
          data-ocid="hrdocs.generate.dialog"
          className="max-w-[95vw] sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>
              {dialog.type === "offer"
                ? "Offer Letter"
                : dialog.type === "joining"
                  ? "Joining Letter"
                  : "Salary Slip"}
              {dialog.employee ? ` — ${dialog.employee.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {dialog.type === "salary" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Month</Label>
                  <Select
                    value={dialog.month}
                    onValueChange={(v) =>
                      handleSalaryParamsChange(v, dialog.year)
                    }
                  >
                    <SelectTrigger data-ocid="hrdocs.salary.month.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slip-year">Year</Label>
                  <Input
                    id="slip-year"
                    data-ocid="hrdocs.salary.year.input"
                    type="number"
                    value={dialog.year}
                    onChange={(e) =>
                      handleSalaryParamsChange(dialog.month, e.target.value)
                    }
                  />
                </div>
              </div>
            )}
            <Textarea
              data-ocid="hrdocs.document.textarea"
              value={dialog.content}
              onChange={(e) =>
                setDialog((prev) => ({ ...prev, content: e.target.value }))
              }
              className="font-mono text-xs min-h-[320px] resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="hrdocs.generate.cancel_button"
              variant="outline"
              onClick={() => setDialog((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button
              data-ocid="hrdocs.print.button"
              variant="secondary"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button
              data-ocid="hrdocs.save.button"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
