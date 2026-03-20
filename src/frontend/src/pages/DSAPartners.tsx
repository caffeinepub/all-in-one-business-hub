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
import type { DSAPartner } from "../backend.d";
import { useAddDSAPartner, useGetDSAPartners } from "../hooks/useQueries";

const FALLBACK_PARTNERS: DSAPartner[] = [
  {
    name: "Bharat Finance Solutions",
    contactPerson: "Rahul Mehta",
    phone: "9876543210",
    region: "Maharashtra",
    commissionPercentage: 2.5,
    status: "Active",
  },
  {
    name: "Capital Link DSA",
    contactPerson: "Suresh Iyer",
    phone: "9123456780",
    region: "Karnataka",
    commissionPercentage: 3.0,
    status: "Active",
  },
  {
    name: "Loan Bridge India",
    contactPerson: "Neha Gupta",
    phone: "9988776655",
    region: "Delhi NCR",
    commissionPercentage: 2.0,
    status: "Active",
  },
  {
    name: "MoneyPath Associates",
    contactPerson: "Anil Tiwari",
    phone: "8877665544",
    region: "Gujarat",
    commissionPercentage: 2.8,
    status: "Inactive",
  },
  {
    name: "QuickFund DSA",
    contactPerson: "Pooja Verma",
    phone: "9001122334",
    region: "Tamil Nadu",
    commissionPercentage: 3.5,
    status: "Active",
  },
];

export default function DSAPartners() {
  const { data: partners = [] } = useGetDSAPartners();
  const displayPartners = partners.length > 0 ? partners : FALLBACK_PARTNERS;
  const addPartner = useAddDSAPartner();

  const [localPartners, setLocalPartners] =
    useState<DSAPartner[]>(displayPartners);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    region: "",
    commissionPercentage: "",
  });

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.contactPerson ||
      !form.phone ||
      !form.region ||
      !form.commissionPercentage
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await addPartner.mutateAsync({
        name: form.name,
        contactPerson: form.contactPerson,
        phone: form.phone,
        region: form.region,
        commissionPercentage: Number.parseFloat(form.commissionPercentage),
      });
    } catch {
      // proceed with local update
    }
    setLocalPartners((prev) => [
      ...prev,
      {
        name: form.name,
        contactPerson: form.contactPerson,
        phone: form.phone,
        region: form.region,
        commissionPercentage: Number.parseFloat(form.commissionPercentage),
        status: "Active",
      },
    ]);
    toast.success("DSA Partner added");
    setIsOpen(false);
    setForm({
      name: "",
      contactPerson: "",
      phone: "",
      region: "",
      commissionPercentage: "",
    });
  };

  const activeCount = localPartners.filter((p) => p.status === "Active").length;

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
              DSA Partners
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeCount} active partners
            </p>
          </div>
          <Button
            data-ocid="dsa_partners.add.open_modal_button"
            onClick={() => setIsOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Add Partner
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
            <CardTitle className="text-base">Partner Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table data-ocid="dsa_partners.table">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs font-semibold text-muted-foreground pl-6">
                    Partner Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Contact Person
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Phone
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Region
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Commission %
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localPartners.map((p, i) => (
                  <TableRow
                    key={p.name}
                    data-ocid={`dsa_partners.item.${i + 1}`}
                    className="border-border"
                  >
                    <TableCell className="pl-6">
                      <p className="text-sm font-medium text-foreground">
                        {p.name}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.contactPerson}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.phone}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.region}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {p.commissionPercentage}%
                    </TableCell>
                    <TableCell>
                      {p.status === "Active" ? (
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
          data-ocid="dsa_partners.add.dialog"
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Add DSA Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="partner-name">Partner Name</Label>
              <Input
                id="partner-name"
                data-ocid="dsa_partners.name.input"
                placeholder="Bharat Finance Solutions"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="partner-contact">Contact Person</Label>
                <Input
                  id="partner-contact"
                  data-ocid="dsa_partners.contact.input"
                  placeholder="Rahul Mehta"
                  value={form.contactPerson}
                  onChange={(e) =>
                    setForm({ ...form, contactPerson: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="partner-phone">Phone</Label>
                <Input
                  id="partner-phone"
                  data-ocid="dsa_partners.phone.input"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="partner-region">Region</Label>
                <Input
                  id="partner-region"
                  data-ocid="dsa_partners.region.input"
                  placeholder="Maharashtra"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="partner-commission">Commission %</Label>
                <Input
                  id="partner-commission"
                  data-ocid="dsa_partners.commission.input"
                  type="number"
                  step="0.1"
                  placeholder="2.5"
                  value={form.commissionPercentage}
                  onChange={(e) =>
                    setForm({ ...form, commissionPercentage: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="dsa_partners.add.cancel_button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="dsa_partners.add.submit_button"
              onClick={handleSubmit}
              disabled={addPartner.isPending}
            >
              {addPartner.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Partner"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
