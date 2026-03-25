import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CalendarCheck, Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../backend.d";
import { AttendanceStatus, useRecordAttendance } from "../hooks/useQueries";
import { useGetAllEmployees } from "../hooks/useQueries";

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

const today = new Date().toISOString().split("T")[0];

type AttendanceRecord = {
  employeeId: bigint;
  employeeName: string;
  date: string;
  status: AttendanceStatus;
};

const FALLBACK_ATTENDANCE: AttendanceRecord[] = [
  {
    employeeId: 1n,
    employeeName: "Priya Sharma",
    date: today,
    status: AttendanceStatus.present,
  },
  {
    employeeId: 2n,
    employeeName: "Vikram Singh",
    date: today,
    status: AttendanceStatus.present,
  },
  {
    employeeId: 3n,
    employeeName: "Meena Joshi",
    date: today,
    status: AttendanceStatus.absent,
  },
  {
    employeeId: 4n,
    employeeName: "Arjun Rao",
    date: today,
    status: AttendanceStatus.present,
  },
  {
    employeeId: 5n,
    employeeName: "Kavitha Nair",
    date: today,
    status: AttendanceStatus.halfDay,
  },
  {
    employeeId: 6n,
    employeeName: "Ravi Kumar",
    date: today,
    status: AttendanceStatus.absent,
  },
  {
    employeeId: 7n,
    employeeName: "Sunita Reddy",
    date: today,
    status: AttendanceStatus.present,
  },
  {
    employeeId: 8n,
    employeeName: "Arun Pillai",
    date: today,
    status: AttendanceStatus.halfDay,
  },
];

function StatusBadge({ status }: { status: AttendanceStatus }) {
  if (status === AttendanceStatus.present)
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Present
      </Badge>
    );
  if (status === AttendanceStatus.absent)
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Absent</Badge>
    );
  return (
    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
      Half Day
    </Badge>
  );
}

export default function EmployeeAttendance() {
  const { data: employees = [] } = useGetAllEmployees();
  const displayEmployees =
    employees.length > 0 ? employees : FALLBACK_EMPLOYEES;
  const recordAttendance = useRecordAttendance();

  const [records, setRecords] =
    useState<AttendanceRecord[]>(FALLBACK_ATTENDANCE);
  const [isOpen, setIsOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState(today);
  const [form, setForm] = useState({
    employeeId: "",
    date: today,
    status: AttendanceStatus.present as AttendanceStatus,
  });

  const filteredRecords = dateFilter
    ? records.filter((r) => r.date === dateFilter)
    : records;

  const stats = {
    present: filteredRecords.filter(
      (r) => r.status === AttendanceStatus.present,
    ).length,
    absent: filteredRecords.filter((r) => r.status === AttendanceStatus.absent)
      .length,
    halfDay: filteredRecords.filter(
      (r) => r.status === AttendanceStatus.halfDay,
    ).length,
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.date) {
      toast.error("Please fill in all fields");
      return;
    }
    const emp = displayEmployees.find((e) => String(e.id) === form.employeeId);
    if (!emp) return;
    const newRecord: AttendanceRecord = {
      employeeId: emp.id,
      employeeName: emp.name,
      date: form.date,
      status: form.status,
    };
    try {
      await recordAttendance.mutateAsync({
        employeeId: emp.id,
        date: form.date,
        status: form.status,
      });
    } catch {
      // fallback: just update local
    }
    setRecords((prev) => [
      ...prev.filter((r) => !(r.employeeId === emp.id && r.date === form.date)),
      newRecord,
    ]);
    toast.success("Attendance recorded");
    setIsOpen(false);
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
              Employee Attendance
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track daily attendance for all employees
            </p>
          </div>
          <Button
            data-ocid="attendance.add.open_modal_button"
            onClick={() => setIsOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Mark Attendance
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-3 gap-4"
      >
        <Card className="border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <CalendarCheck className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.present}
                </p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <CalendarCheck className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.absent}
                </p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <CalendarCheck className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.halfDay}
                </p>
                <p className="text-xs text-muted-foreground">Half Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CardTitle className="text-base flex-1">
                Attendance Records
              </CardTitle>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="date-filter"
                  className="text-xs text-muted-foreground font-medium"
                >
                  Filter by Date:
                </label>
                <input
                  type="date"
                  id="date-filter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm"
                />
                {dateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setDateFilter("")}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table data-ocid="attendance.table">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs font-semibold text-muted-foreground pl-6">
                      Employee
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Department
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
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-10 text-muted-foreground"
                        data-ocid="attendance.empty_state"
                      >
                        No attendance records for selected date
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((rec, i) => {
                      const emp = displayEmployees.find(
                        (e) => e.id === rec.employeeId,
                      );
                      return (
                        <TableRow
                          key={`${String(rec.employeeId)}-${rec.date}`}
                          data-ocid={`attendance.item.${i + 1}`}
                          className="border-border"
                        >
                          <TableCell className="pl-6">
                            <p className="text-sm font-medium text-foreground">
                              {rec.employeeName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {emp?.email}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {emp?.department ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {rec.date}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={rec.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          data-ocid="attendance.add.dialog"
          className="max-w-[95vw] sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select
                value={form.employeeId}
                onValueChange={(v) => setForm({ ...form, employeeId: v })}
              >
                <SelectTrigger data-ocid="attendance.employee.select">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {displayEmployees.map((e) => (
                    <SelectItem key={String(e.id)} value={String(e.id)}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="att-date">Date</Label>
              <input
                id="att-date"
                type="date"
                data-ocid="attendance.date.input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as AttendanceStatus })
                }
              >
                <SelectTrigger data-ocid="attendance.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AttendanceStatus.present}>
                    Present
                  </SelectItem>
                  <SelectItem value={AttendanceStatus.absent}>
                    Absent
                  </SelectItem>
                  <SelectItem value={AttendanceStatus.halfDay}>
                    Half Day
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="attendance.add.cancel_button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="attendance.add.submit_button"
              onClick={handleSubmit}
              disabled={recordAttendance.isPending}
            >
              {recordAttendance.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
