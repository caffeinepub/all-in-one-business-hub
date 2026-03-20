import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Edit2, Loader2, Plus, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../backend.d";
import {
  useAddEmployee,
  useGetAllEmployees,
  useGetDepartments,
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

const FALLBACK_DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Operations",
  "Finance",
  "HR",
  "Marketing",
];

function StatusBadge({ status }: { status: string }) {
  if (status === "Active")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium success-badge">
        {status}
      </span>
    );
  if (status === "On Leave")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium warning-badge">
        {status}
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      {status}
    </span>
  );
}

export default function HRManagement() {
  const { data: employees = [] } = useGetAllEmployees();
  const { data: departments = [] } = useGetDepartments();
  const addEmployee = useAddEmployee();

  const displayEmployees =
    employees.length > 0 ? employees : FALLBACK_EMPLOYEES;
  const displayDepartments =
    departments.length > 0 ? departments : FALLBACK_DEPARTMENTS;

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
    salary: "",
  });

  const filtered = useMemo(() => {
    return displayEmployees.filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === "all" || e.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [displayEmployees, search, deptFilter]);

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.department ||
      !form.role ||
      !form.salary
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await addEmployee.mutateAsync({
        name: form.name,
        email: form.email,
        department: form.department,
        role: form.role,
        salary: Number.parseFloat(form.salary),
      });
      toast.success("Employee added successfully");
      setIsOpen(false);
      setForm({ name: "", email: "", department: "", role: "", salary: "" });
    } catch {
      toast.error("Failed to add employee");
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
              Employee Directory
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} employees
            </p>
          </div>
          <Button
            data-ocid="hr.add_employee.open_modal_button"
            onClick={() => setIsOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="hr.search.input"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger
                  data-ocid="hr.department.select"
                  className="w-44"
                >
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {displayDepartments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table data-ocid="hr.employees.table">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs font-semibold text-muted-foreground pl-6">
                    Name
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
                    Hire Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                      data-ocid="hr.employees.empty_state"
                    >
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((emp, i) => (
                    <TableRow
                      key={String(emp.id)}
                      data-ocid={`hr.employees.item.${i + 1}`}
                      className="border-border"
                    >
                      <TableCell className="pl-6">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {emp.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {emp.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {emp.department}
                      </TableCell>
                      <TableCell className="text-sm">{emp.role}</TableCell>
                      <TableCell className="text-sm font-medium">
                        ₹{emp.salary.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(
                          Number(emp.hireDate) / 1_000_000,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={emp.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          data-ocid={`hr.employees.edit_button.${i + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Employee Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          data-ocid="hr.add_employee.dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="emp-name">Full Name</Label>
                <Input
                  id="emp-name"
                  data-ocid="hr.name.input"
                  placeholder="Priya Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emp-email">Email</Label>
                <Input
                  id="emp-email"
                  data-ocid="hr.email.input"
                  type="email"
                  placeholder="priya@uparjanam.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) => setForm({ ...form, department: v })}
                >
                  <SelectTrigger data-ocid="hr.department_form.select">
                    <SelectValue placeholder="Select dept" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayDepartments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emp-role">Role</Label>
                <Input
                  id="emp-role"
                  data-ocid="hr.role.input"
                  placeholder="Software Engineer"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-salary">Annual Salary (₹)</Label>
              <Input
                id="emp-salary"
                data-ocid="hr.salary.input"
                type="number"
                placeholder="75000"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="hr.add_employee.cancel_button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="hr.add_employee.submit_button"
              onClick={handleSubmit}
              disabled={addEmployee.isPending}
            >
              {addEmployee.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Employee"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
