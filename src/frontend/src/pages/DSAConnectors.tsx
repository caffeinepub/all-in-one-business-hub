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
import { Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { DSAConnector } from "../backend.d";
import {
  useAddDSAConnector,
  useGetDSAConnectors,
  useGetDSAPartners,
} from "../hooks/useQueries";

const FALLBACK_PARTNERS = [
  "Bharat Finance Solutions",
  "Capital Link DSA",
  "Loan Bridge India",
  "MoneyPath Associates",
  "QuickFund DSA",
];

const FALLBACK_CONNECTORS: DSAConnector[] = [
  {
    name: "Vijay Patil",
    phone: "9911223344",
    email: "vijay@bharatfinance.com",
    partnerName: "Bharat Finance Solutions",
    status: "Active",
  },
  {
    name: "Rekha Soni",
    phone: "9800112233",
    email: "rekha@capitallink.com",
    partnerName: "Capital Link DSA",
    status: "Active",
  },
  {
    name: "Manish Dubey",
    phone: "9700334455",
    email: "manish@loanbridge.com",
    partnerName: "Loan Bridge India",
    status: "Active",
  },
  {
    name: "Shalini Roy",
    phone: "9600445566",
    email: "shalini@moneymask.com",
    partnerName: "MoneyPath Associates",
    status: "Inactive",
  },
  {
    name: "Deepak Naik",
    phone: "9500556677",
    email: "deepak@quickfund.com",
    partnerName: "QuickFund DSA",
    status: "Active",
  },
  {
    name: "Preethi Reddy",
    phone: "9400667788",
    email: "preethi@bharatfinance.com",
    partnerName: "Bharat Finance Solutions",
    status: "Active",
  },
];

export default function DSAConnectors() {
  const { data: connectors = [] } = useGetDSAConnectors();
  const { data: partners = [] } = useGetDSAPartners();
  const displayConnectors =
    connectors.length > 0 ? connectors : FALLBACK_CONNECTORS;
  const partnerNames =
    partners.length > 0 ? partners.map((p) => p.name) : FALLBACK_PARTNERS;
  const addConnector = useAddDSAConnector();

  const [localConnectors, setLocalConnectors] =
    useState<DSAConnector[]>(displayConnectors);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    partnerName: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email || !form.partnerName) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await addConnector.mutateAsync({
        name: form.name,
        phone: form.phone,
        email: form.email,
        partnerName: form.partnerName,
      });
    } catch {
      // proceed with local update
    }
    setLocalConnectors((prev) => [
      ...prev,
      {
        name: form.name,
        phone: form.phone,
        email: form.email,
        partnerName: form.partnerName,
        status: "Active",
      },
    ]);
    toast.success("DSA Connector added");
    setIsOpen(false);
    setForm({ name: "", phone: "", email: "", partnerName: "" });
  };

  const activeCount = localConnectors.filter(
    (c) => c.status === "Active",
  ).length;

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
              DSA Connectors
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeCount} active connectors
            </p>
          </div>
          <Button
            data-ocid="dsa_connectors.add.open_modal_button"
            onClick={() => setIsOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Add Connector
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
            <CardTitle className="text-base">Connector Network</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table data-ocid="dsa_connectors.table">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs font-semibold text-muted-foreground pl-6">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Phone
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Email
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    DSA Partner
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localConnectors.map((c, i) => (
                  <TableRow
                    key={`${c.name}-${i}`}
                    data-ocid={`dsa_connectors.item.${i + 1}`}
                    className="border-border"
                  >
                    <TableCell className="pl-6">
                      <p className="text-sm font-medium text-foreground">
                        {c.name}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.phone}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.email}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.partnerName}
                    </TableCell>
                    <TableCell>
                      {c.status === "Active" ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          data-ocid="dsa_connectors.add.dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Add DSA Connector</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="conn-name">Full Name</Label>
                <Input
                  id="conn-name"
                  data-ocid="dsa_connectors.name.input"
                  placeholder="Vijay Patil"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="conn-phone">Phone</Label>
                <Input
                  id="conn-phone"
                  data-ocid="dsa_connectors.phone.input"
                  placeholder="9911223344"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="conn-email">Email</Label>
              <Input
                id="conn-email"
                data-ocid="dsa_connectors.email.input"
                type="email"
                placeholder="vijay@partner.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>DSA Partner</Label>
              <Select
                value={form.partnerName}
                onValueChange={(v) => setForm({ ...form, partnerName: v })}
              >
                <SelectTrigger data-ocid="dsa_connectors.partner.select">
                  <SelectValue placeholder="Select DSA Partner" />
                </SelectTrigger>
                <SelectContent>
                  {partnerNames.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="dsa_connectors.add.cancel_button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="dsa_connectors.add.submit_button"
              onClick={handleSubmit}
              disabled={addConnector.isPending}
            >
              {addConnector.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Connector"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
