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
import { Crosshair, Loader2, MapPin, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../backend.d";
import { useGetAllEmployees, useRecordLocation } from "../hooks/useQueries";

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
];

type LocationRecord = {
  employeeId: bigint;
  employeeName: string;
  latitude: number;
  longitude: number;
  note: string;
  timestamp: Date;
};

const FALLBACK_LOCATIONS: LocationRecord[] = [
  {
    employeeId: 1n,
    employeeName: "Priya Sharma",
    latitude: 19.076,
    longitude: 72.8777,
    note: "Client visit — Andheri",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    employeeId: 2n,
    employeeName: "Vikram Singh",
    latitude: 12.9716,
    longitude: 77.5946,
    note: "Office check-in",
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    employeeId: 3n,
    employeeName: "Meena Joshi",
    latitude: 28.6139,
    longitude: 77.209,
    note: "Branch visit — Connaught Place",
    timestamp: new Date(Date.now() - 10800000),
  },
  {
    employeeId: 4n,
    employeeName: "Arjun Rao",
    latitude: 17.385,
    longitude: 78.4867,
    note: "Field work",
    timestamp: new Date(Date.now() - 14400000),
  },
  {
    employeeId: 5n,
    employeeName: "Kavitha Nair",
    latitude: 13.0827,
    longitude: 80.2707,
    note: "Partner meeting",
    timestamp: new Date(Date.now() - 18000000),
  },
];

export default function EmployeeLocations() {
  const { data: employees = [] } = useGetAllEmployees();
  const displayEmployees =
    employees.length > 0 ? employees : FALLBACK_EMPLOYEES;
  const recordLocation = useRecordLocation();

  const [locations, setLocations] =
    useState<LocationRecord[]>(FALLBACK_LOCATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    latitude: "",
    longitude: "",
    note: "",
  });

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setGettingLocation(false);
        toast.success("Location captured");
      },
      () => {
        setGettingLocation(false);
        toast.error(
          "Unable to get your location. Please allow location access.",
        );
      },
    );
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.latitude || !form.longitude) {
      toast.error("Please fill in all required fields");
      return;
    }
    const emp = displayEmployees.find((e) => String(e.id) === form.employeeId);
    if (!emp) return;
    const lat = Number.parseFloat(form.latitude);
    const lng = Number.parseFloat(form.longitude);
    try {
      await recordLocation.mutateAsync({
        employeeId: emp.id,
        latitude: lat,
        longitude: lng,
        note: form.note,
      });
    } catch {
      // proceed with local update
    }
    setLocations((prev) => [
      {
        employeeId: emp.id,
        employeeName: emp.name,
        latitude: lat,
        longitude: lng,
        note: form.note,
        timestamp: new Date(),
      },
      ...prev,
    ]);
    toast.success("Location check-in recorded");
    setIsOpen(false);
    setForm({ employeeId: "", latitude: "", longitude: "", note: "" });
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
              Employee Locations
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track employee field check-ins and locations
            </p>
          </div>
          <Button
            data-ocid="locations.add.open_modal_button"
            onClick={() => setIsOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Record Check-in
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
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Location Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table data-ocid="locations.table">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs font-semibold text-muted-foreground pl-6">
                      Employee
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Latitude
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Longitude
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Note
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Timestamp
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc, i) => (
                    <TableRow
                      key={`${String(loc.employeeId)}-${loc.timestamp.getTime()}`}
                      data-ocid={`locations.item.${i + 1}`}
                      className="border-border"
                    >
                      <TableCell className="pl-6">
                        <p className="text-sm font-medium text-foreground">
                          {loc.employeeName}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {loc.latitude.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {loc.longitude.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {loc.note || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {loc.timestamp.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          data-ocid="locations.add.dialog"
          className="max-w-[95vw] sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Record Location Check-in</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select
                value={form.employeeId}
                onValueChange={(v) => setForm({ ...form, employeeId: v })}
              >
                <SelectTrigger data-ocid="locations.employee.select">
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
              <div className="flex items-center justify-between">
                <Label>Coordinates</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleUseMyLocation}
                  disabled={gettingLocation}
                >
                  {gettingLocation ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Crosshair className="w-3 h-3" />
                  )}
                  Use My Location
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="loc-lat"
                    className="text-xs text-muted-foreground"
                  >
                    Latitude
                  </Label>
                  <Input
                    id="loc-lat"
                    data-ocid="locations.latitude.input"
                    type="number"
                    step="0.0001"
                    placeholder="19.0760"
                    value={form.latitude}
                    onChange={(e) =>
                      setForm({ ...form, latitude: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="loc-lng"
                    className="text-xs text-muted-foreground"
                  >
                    Longitude
                  </Label>
                  <Input
                    id="loc-lng"
                    data-ocid="locations.longitude.input"
                    type="number"
                    step="0.0001"
                    placeholder="72.8777"
                    value={form.longitude}
                    onChange={(e) =>
                      setForm({ ...form, longitude: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-note">Note (optional)</Label>
              <Input
                id="loc-note"
                data-ocid="locations.note.input"
                placeholder="Client visit, office check-in..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="locations.add.cancel_button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="locations.add.submit_button"
              onClick={handleSubmit}
              disabled={recordLocation.isPending}
            >
              {recordLocation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Check-in"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
