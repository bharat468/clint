import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShieldAlert,
  Trash2,
  Pencil,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  FileDown,
  FileSpreadsheet,
  MessageCircle,
  Zap,
  Droplets,
  Receipt,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { paymentService } from "@/services/payment.service";
import { tenantService } from "@/services/tenant.service";
import { propertyService } from "@/services/property.service";
import { rentalLifecycleService } from "@/services/rentalLifecycle.service";
import { useAppSelector } from "@/app/hooks";
import { generateRentInvoicePdf, UtilityDetail } from "@/lib/rentInvoicePdf";
import { shareRentOnWhatsApp } from "@/lib/whatsapp";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toast } from "@/components/ui/toast";
import { PageHeader, State } from "@/components/ui/page";
import { errMsg, formatINR, formatDateTime } from "@/lib/utils";
import { canAccess } from "@/lib/permissions";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { ReportsModal } from "@/features/reports/ReportsModal";
import type { Payment, Tenant, Property } from "@/types";

const schema = z.object({
  tenantId: z.string().min(1, "Please select a tenant"),
  amount: z.number({ invalid_type_error: "Enter valid amount" }).positive(),
  month: z.string().min(1, "Select billing month"),
  status: z.enum(["PAID", "PENDING", "OVERDUE"]),
});
type Form = z.infer<typeof schema>;

const tone = { PAID: "green", PENDING: "yellow", OVERDUE: "red" } as const;

export default function PaymentsPage() {
  const [searchParams] = useSearchParams();
  const user = useAppSelector((s) => s.auth.user);
  const canReadPayment = canAccess(user, "payment.read");
  const canCreatePayment = canAccess(user, "payment.create");
  const canUpdatePayment = canAccess(user, "payment.update");
  const canDeletePayment = canAccess(user, "payment.delete") || canAccess(user, "payment.update");

  const { data, setData, loading, error, reload } = useApi(paymentService.list, [] as Payment[]);
  const { data: tenants } = useApi(tenantService.list, [] as Tenant[]);
  const { data: properties, reload: reloadProperties } = useApi(propertyService.list, [] as Property[]);
  const [open, setOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [reportTab, setReportTab] = useState<"collections" | "defaulters" | "pnl">("collections");
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const urlStatus = searchParams.get("status")?.toUpperCase();
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING" | "OVERDUE">(
    urlStatus === "PAID" || urlStatus === "PENDING" || urlStatus === "OVERDUE" ? urlStatus : "ALL"
  );

  useEffect(() => {
    const s = searchParams.get("status")?.toUpperCase();
    if (s === "PAID" || s === "PENDING" || s === "OVERDUE") {
      setStatusFilter(s);
    } else if (s === "ALL") {
      setStatusFilter("ALL");
    }
  }, [searchParams]);

  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type?: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { status: "PENDING", month: currentMonth },
  });

  // Sub-Meter Utility state for billing
  const [baseRent, setBaseRent] = useState<number>(20000);
  const [includeUtilities, setIncludeUtilities] = useState<boolean>(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [elecPrev, setElecPrev] = useState<number>(0);
  const [elecCurrent, setElecCurrent] = useState<string>("");
  const [elecRate, setElecRate] = useState<number>(9);
  const [waterPrev, setWaterPrev] = useState<number>(0);
  const [waterCurrent, setWaterCurrent] = useState<string>("");
  const [waterRate, setWaterRate] = useState<number>(20);

  const selectedTenantId = watch("tenantId");

  const selectedTenant = useMemo(
    () => tenants.find((item) => item.id === selectedTenantId),
    [selectedTenantId, tenants]
  );

  const selectedProperty = useMemo(() => {
    if (!selectedTenant?.propertyId) return null;
    return properties.find((pr) => pr.id === selectedTenant.propertyId) || null;
  }, [selectedTenant, properties]);

  const availableUnits = useMemo(() => {
    return selectedProperty?.units || [];
  }, [selectedProperty]);

  // Sync unit selection when tenant or property changes
  useEffect(() => {
    if (!selectedTenant) {
      setSelectedUnitId("");
      return;
    }
    const units = selectedProperty?.units || [];
    const matchedUnit = units.find((u: any) => u.status === "OCCUPIED") || units[0];
    if (matchedUnit) {
      setSelectedUnitId(matchedUnit.id);
    } else {
      setSelectedUnitId("");
    }
  }, [selectedTenant, selectedProperty]);

  // Sync rent, utility tariffs, and previous readings when unit changes
  useEffect(() => {
    if (!selectedTenant) return;
    const unit = availableUnits.find((u: any) => u.id === selectedUnitId) || availableUnits[0];

    const rent = unit?.rentAmount || selectedProperty?.rent || 20000;
    setBaseRent(rent);

    const orgElec = selectedProperty?.organization?.electricityRate ?? 9;
    const orgWater = selectedProperty?.organization?.waterRate ?? 20;
    setElecRate(orgElec);
    setWaterRate(orgWater);

    if (unit) {
      const lastElec = unit.meterReadings?.find((r: any) => r.utilityType === "ELECTRICITY");
      const lastWater = unit.meterReadings?.find((r: any) => r.utilityType === "WATER");
      setElecPrev(lastElec ? lastElec.currentReading : 0);
      setWaterPrev(lastWater ? lastWater.currentReading : 0);
    } else {
      setElecPrev(0);
      setWaterPrev(0);
    }
  }, [selectedUnitId, availableUnits, selectedProperty, selectedTenant]);

  const parsedElec = parseFloat(elecCurrent) || 0;
  const elecConsumed = parsedElec >= elecPrev ? Math.round((parsedElec - elecPrev) * 100) / 100 : 0;
  const elecAmount = Math.round(elecConsumed * elecRate);

  const parsedWater = parseFloat(waterCurrent) || 0;
  const waterConsumed = parsedWater >= waterPrev ? Math.round((parsedWater - waterPrev) * 100) / 100 : 0;
  const waterAmount = Math.round(waterConsumed * waterRate);

  const totalUtility = includeUtilities ? elecAmount + waterAmount : 0;
  const calculatedTotal = (baseRent || 0) + totalUtility;

  useEffect(() => {
    if (calculatedTotal > 0 && !editingPayment) {
      setValue("amount", calculatedTotal);
    }
  }, [calculatedTotal, setValue, editingPayment]);

  const monthOptions = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = -6; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      list.push({ value: val, label });
    }
    return list;
  }, []);

  const tenantName = (id: string) => tenants.find((t) => t.id === id)?.name ?? "Tenant";

  const handleDownloadInvoice = (p: Payment) => {
    const tenant = tenants.find((t) => t.id === p.tenantId);
    const propId = p.propertyId || tenant?.propertyId;
    const property = properties.find((pr) => pr.id === propId) || p.property;

    // Locate matching unit for tenant/property
    const unit =
      property?.units?.find((u: any) => u.unitNumber === "101" || u.status === "OCCUPIED") ||
      property?.units?.[0];

    // Filter meter readings for this billing month (or fallback to recorded)
    const monthReadings =
      unit?.meterReadings?.filter(
        (r: any) => r.readingMonth === p.month || !r.readingMonth
      ) || unit?.meterReadings || [];

    const elecReading = monthReadings.find((r: any) => r.utilityType === "ELECTRICITY");
    const waterReading = monthReadings.find((r: any) => r.utilityType === "WATER");

    const utilities: UtilityDetail[] = [];
    let totalUtility = 0;

    if (elecReading && elecReading.amount > 0) {
      utilities.push({
        type: "ELECTRICITY",
        meterNo: `E-${unit?.unitNumber || "101"}`,
        previousReading: elecReading.previousReading,
        currentReading: elecReading.currentReading,
        consumedUnits: elecReading.consumedUnits,
        unitMeasure: "kWh",
        ratePerUnit: elecReading.ratePerUnit,
        amount: elecReading.amount,
      });
      totalUtility += elecReading.amount;
    }

    if (waterReading && waterReading.amount > 0) {
      utilities.push({
        type: "WATER",
        meterNo: `W-${unit?.unitNumber || "101"}`,
        previousReading: waterReading.previousReading,
        currentReading: waterReading.currentReading,
        consumedUnits: waterReading.consumedUnits,
        unitMeasure: "kL",
        ratePerUnit: waterReading.ratePerUnit,
        amount: waterReading.amount,
      });
      totalUtility += waterReading.amount;
    }

    const baseRent =
      totalUtility > 0 && p.amount >= totalUtility
        ? p.amount - totalUtility
        : property?.rent
        ? Math.min(property.rent, p.amount)
        : p.amount;

    generateRentInvoicePdf({
      paymentId: p.id,
      month: p.month,
      propertyName: property?.title || "Rental Residence",
      propertyAddress: property?.address || `${property?.city || "Metro Area"}`,
      unitNumber: unit?.unitNumber || "101",
      landlordName: user?.name || "Property Owner",
      landlordPhone: user?.mobile,
      landlordEmail: user?.email || undefined,
      tenantName: tenant?.name || "Tenant",
      tenantPhone: tenant?.phone,
      tenantEmail: tenant?.email || undefined,
      amount: p.amount,
      baseRent,
      utilityAmount: totalUtility > 0 ? totalUtility : undefined,
      utilities: utilities.length > 0 ? utilities : undefined,
      status: p.status,
      paidOn: p.paidOn,
    });
  };

  const handleWhatsAppShare = (p: Payment) => {
    const tenant = tenants.find((t) => t.id === p.tenantId);
    const propId = p.propertyId || tenant?.propertyId;
    const property = properties.find((pr) => pr.id === propId) || p.property;

    if (!tenant) {
      setToast({ show: true, type: "error", message: "Tenant details not found" });
      return;
    }

    const unit =
      property?.units?.find((u: any) => u.unitNumber === "101" || u.status === "OCCUPIED") ||
      property?.units?.[0];

    const monthReadings =
      unit?.meterReadings?.filter(
        (r: any) => r.readingMonth === p.month || !r.readingMonth
      ) || unit?.meterReadings || [];

    const elecReading = monthReadings.find((r: any) => r.utilityType === "ELECTRICITY");
    const waterReading = monthReadings.find((r: any) => r.utilityType === "WATER");
    const totalUtility = (elecReading?.amount || 0) + (waterReading?.amount || 0);

    const baseRent =
      totalUtility > 0 && p.amount >= totalUtility
        ? p.amount - totalUtility
        : property?.rent
        ? Math.min(property.rent, p.amount)
        : p.amount;

    shareRentOnWhatsApp({
      tenantPhone: tenant.phone || "",
      tenantName: tenant.name || "Tenant",
      propertyName: property?.title || "Rental Property",
      unitNumber: unit?.unitNumber || "101",
      month: p.month,
      amount: p.amount,
      baseRent: totalUtility > 0 ? baseRent : undefined,
      utilityAmount: totalUtility > 0 ? totalUtility : undefined,
      status: p.status,
      receiptNumber: `INV-${p.id.slice(-6).toUpperCase()}`,
      paidOn: p.paidOn ? formatDateTime(p.paidOn) : undefined,
    });
  };

  const handleOpenCreate = () => {
    setEditingPayment(null);
    setElecCurrent("");
    setWaterCurrent("");
    setIncludeUtilities(true);
    setSelectedUnitId("");
    reset({
      tenantId: "",
      amount: 20000,
      month: currentMonth,
      status: "PENDING",
    });
    setFormError(null);
    setOpen(true);
  };

  const handleOpenEdit = (p: Payment) => {
    setEditingPayment(p);
    reset({
      tenantId: p.tenantId,
      amount: p.amount,
      month: p.month,
      status: p.status,
    });
    setFormError(null);
    setOpen(true);
  };

  const onSubmit = async (v: Form) => {
    setFormError(null);
    const tenant = tenants.find((t) => t.id === v.tenantId);
    const propId = tenant?.propertyId ?? (editingPayment ? editingPayment.propertyId : "");
    const property = properties.find((pr) => pr.id === propId);
    const units = property?.units || [];
    const unit =
      units.find((u: any) => u.id === selectedUnitId) ||
      units.find((u: any) => u.status === "OCCUPIED") ||
      units[0];

    // Auto-record meter readings to the unit if entered during billing
    if (includeUtilities && unit) {
      if (parsedElec > 0 && parsedElec >= elecPrev) {
        try {
          await rentalLifecycleService.recordMeterReading(unit.id, {
            utilityType: "ELECTRICITY",
            readingMonth: v.month,
            previousReading: elecPrev,
            currentReading: parsedElec,
            customRate: elecRate,
            notes: `Recorded during billing for month ${v.month}`,
          });
        } catch (err) {
          console.warn("Could not save electricity meter reading", err);
        }
      }

      if (parsedWater > 0 && parsedWater >= waterPrev) {
        try {
          await rentalLifecycleService.recordMeterReading(unit.id, {
            utilityType: "WATER",
            readingMonth: v.month,
            previousReading: waterPrev,
            currentReading: parsedWater,
            customRate: waterRate,
            notes: `Recorded during billing for month ${v.month}`,
          });
        } catch (err) {
          console.warn("Could not save water meter reading", err);
        }
      }
    }

    try {
      if (editingPayment) {
        const updated = await paymentService.update(editingPayment.id, {
          ...v,
          propertyId: propId,
          paidOn: v.status === "PAID" ? new Date().toISOString().slice(0, 10) : null,
        });
        reset();
        setOpen(false);
        setEditingPayment(null);
        if (updated) {
          setData((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
        }
        setToast({ show: true, type: "success", message: "Bill and payment record updated successfully." });
        await reload();
        await reloadProperties();
      } else {
        const created = await paymentService.create({
          ...v,
          propertyId: propId,
          paidOn: v.status === "PAID" ? new Date().toISOString().slice(0, 10) : null,
        });
        reset();
        setOpen(false);
        setEditingPayment(null);
        if (created) {
          setData((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
        }
        const msg = totalUtility > 0
          ? `Bill created: Base Rent ₹${(baseRent || 0).toLocaleString()} + Utilities ₹${totalUtility.toLocaleString()} = Total ₹${v.amount.toLocaleString()}!`
          : "Monthly bill created successfully.";
        setToast({ show: true, type: "success", message: msg });
        await reload();
        await reloadProperties();
      }
    } catch (e) {
      setFormError(errMsg(e));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPayment) return;
    setIsDeleting(true);
    try {
      await paymentService.remove(deletingPayment.id);
      setData((prev) => prev.filter((p) => p.id !== deletingPayment.id));
      setDeletingPayment(null);
      setToast({ show: true, type: "success", message: "Payment record deleted successfully." });
      await reload();
    } catch (e) {
      setToast({ show: true, type: "error", message: errMsg(e) });
    } finally {
      setIsDeleting(false);
    }
  };

  const markStatus = async (id: string, newStatus: "PAID" | "PENDING" | "OVERDUE") => {
    try {
      setData((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
      await paymentService.update(id, {
        status: newStatus,
        paidOn: newStatus === "PAID" ? new Date().toISOString().slice(0, 10) : null,
      });
      setToast({ show: true, type: "success", message: `Payment status updated to ${newStatus}.` });
      await reload();
    } catch (e) {
      setToast({ show: true, type: "error", message: errMsg(e) });
      await reload();
    }
  };

  // Metrics
  const paidList = data.filter((p) => p.status === "PAID");
  const pendingList = data.filter((p) => p.status === "PENDING");
  const overdueList = data.filter((p) => p.status === "OVERDUE");

  const totalCollected = paidList.reduce((acc, p) => acc + p.amount, 0);
  const totalPending = pendingList.reduce((acc, p) => acc + p.amount, 0);
  const totalOverdue = overdueList.reduce((acc, p) => acc + p.amount, 0);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return data.filter((p) => {
      const name = tenantName(p.tenantId).toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || p.month.includes(searchTerm);
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter, tenants]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, page, pageSize]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (!canReadPayment) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Rent & Payments"
          subtitle="Track rent invoices, payment statuses, and overdue collections"
        />
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Access Restricted</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Your role does not have permission (<code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">payment.read</code>) to view the Rent & Payments ledger. Please contact your property administrator to request access.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Rent & Payments"
        subtitle="Track rent invoices, payment statuses, and overdue collections"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReportTab("collections");
                setReportsOpen(true);
              }}
              className="gap-2 text-slate-700 font-semibold border-slate-300 hover:bg-slate-50"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export Reports</span>
            </Button>
            {canCreatePayment && (
              <Button onClick={handleOpenCreate} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                <Receipt className="h-4 w-4" /> Generate Bill / Payment
              </Button>
            )}
          </div>
        }
      />

      {/* Top 3 Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 border-emerald-100 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Total Collected
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-800">{formatINR(totalCollected)}</div>
            <div className="mt-1 text-xs text-emerald-700">
              {paidList.length} payments marked as paid
            </div>
          </div>
        </Card>

        <Card className="p-5 border-amber-100 bg-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Pending Dues
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-800">{formatINR(totalPending)}</div>
            <div className="mt-1 text-xs text-amber-700">
              {pendingList.length} invoices awaiting payment
            </div>
          </div>
        </Card>

        <Card className="p-5 border-rose-100 bg-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">
              Overdue Amount
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-800">{formatINR(totalOverdue)}</div>
            <div className="mt-1 text-xs text-rose-700">
              {overdueList.length} invoices critically delayed
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by tenant name or YYYY-MM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200/60 self-start sm:self-auto">
          {(["ALL", "PAID", "PENDING", "OVERDUE"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === filter
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <State
        loading={loading}
        error={error}
        empty={!loading && !error && data.length === 0}
        emptyMessage="No payment records found. Log monthly rental invoices to track payment history."
        emptyAction={
          canCreatePayment ? (
            <Button onClick={handleOpenCreate} size="sm" className="gap-2">
              <Receipt className="h-4 w-4" /> Generate Bill / Payment
            </Button>
          ) : undefined
        }
      />

      {!loading && !error && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card className="overflow-hidden border border-slate-200/80 bg-white rounded-2xl shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Tenant</th>
                    <th className="px-5 py-3.5">Billing Month</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Payment / Recorded Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {paginatedPayments.map((p) => {
                    const name = tenantName(p.tenantId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Tenant */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                              {getInitials(name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{name}</p>
                              <span className="text-[11px] font-medium text-slate-400">
                                ID: #{p.id.slice(-6)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Month */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{p.month}</span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-900 text-sm">
                            {formatINR(p.amount)}
                          </span>
                        </td>

                        {/* Interactive Status Badge (Click to toggle status if permitted) */}
                        <td className="px-5 py-4">
                          {canUpdatePayment ? (
                            <button
                              type="button"
                              onClick={() =>
                                markStatus(
                                  p.id,
                                  p.status === "PAID"
                                    ? "PENDING"
                                    : p.status === "PENDING"
                                    ? "OVERDUE"
                                    : "PAID"
                                )
                              }
                              title="Click to advance status (Paid -> Pending -> Overdue -> Paid)"
                              className="transition-transform active:scale-95"
                            >
                              <Badge tone={tone[p.status]} dot className="cursor-pointer">
                                {p.status}
                              </Badge>
                            </button>
                          ) : (
                            <Badge tone={tone[p.status]} dot>
                              {p.status}
                            </Badge>
                          )}
                        </td>

                        {/* Payment Date & Time */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {p.paidOn
                                ? formatDateTime(p.paidOn)
                                : p.createdAt
                                ? formatDateTime(p.createdAt)
                                : "—"}
                            </span>
                          </div>
                          {p.paidOn && (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-5">
                              Settled
                            </span>
                          )}
                        </td>

                        {/* Actions: Download Bill + Mark Paid + Edit + Delete */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInvoice(p)}
                              title="Download Official Rent Bill / Receipt PDF"
                              className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 h-8 text-xs font-semibold px-2"
                            >
                              <FileDown className="h-3.5 w-3.5 text-blue-600" />
                              <span>Bill PDF</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWhatsAppShare(p)}
                              title="Share Notice or Receipt directly on WhatsApp (Zero API)"
                              className="gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8 text-xs font-semibold px-2"
                            >
                              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </Button>
                            {p.status !== "PAID" && canUpdatePayment && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markStatus(p.id, "PAID")}
                                className="gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8 text-xs font-semibold px-2"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Paid</span>
                              </Button>
                            )}
                            {canUpdatePayment && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(p)}
                                aria-label="Edit payment"
                                className="text-slate-500 hover:bg-blue-50 hover:text-blue-600 h-8 w-8 p-1.5"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {canDeletePayment && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingPayment(p)}
                                aria-label="Delete payment"
                                className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 h-8 w-8 p-1.5"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Mobile Card View (Optimized for Phones) */}
          <div className="grid gap-4 md:hidden">
            {paginatedPayments.map((p) => {
              const name = tenantName(p.tenantId);
              return (
                <Card key={p.id} className="p-4 space-y-3 border-slate-200/80">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                        {getInitials(name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{p.month}</span>
                        </div>
                      </div>
                    </div>
                    <Badge tone={tone[p.status]} dot>
                      {p.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Rent Amount</span>
                      <span className="text-base font-bold text-slate-900">
                        {formatINR(p.amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(p)}
                        className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 h-8 text-xs font-semibold px-2"
                      >
                        <FileDown className="h-3.5 w-3.5 text-blue-600" />
                        <span>PDF</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWhatsAppShare(p)}
                        title="Share on WhatsApp"
                        className="gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8 text-xs font-semibold px-2"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </Button>
                      {p.status !== "PAID" && canUpdatePayment && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markStatus(p.id, "PAID")}
                          className="gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8 text-xs font-semibold px-2"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Paid</span>
                        </Button>
                      )}
                      {canUpdatePayment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                          aria-label="Edit payment"
                          className="text-slate-500 hover:text-blue-600 h-8 w-8 p-1.5"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canDeletePayment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingPayment(p)}
                          aria-label="Delete payment"
                          className="text-slate-400 hover:text-rose-600 h-8 w-8 p-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <DataTablePagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={filteredPayments.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50]}
            apiEndpoint="GET /api/v1/payments"
            className="rounded-2xl border border-slate-200 bg-white mt-4"
          />
        </>
      )}

      {/* Generate Bill / Record Payment Modal */}
      <Modal
        open={open}
        maxWidth="max-w-2xl"
        title={editingPayment ? "Edit Rent Bill & Payment" : "Generate Monthly Bill & Record Payment"}
        subtitle={
          editingPayment
            ? "Update rental invoice, meter readings, or payment status"
            : "Enter sub-meter readings (Electricity & Water) and generate monthly rent bill"
        }
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Top Row: Tenant & Billing Month */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Field label="Tenant *" error={errors.tenantId?.message} required>
              <Select {...register("tenantId")}>
                <option value="">Select Tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.property?.title ? `(${t.property.title})` : t.phone ? `(${t.phone})` : ""}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Billing Month *" error={errors.month?.message} required>
              <Select {...register("month")}>
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Unit & Base Monthly Rent */}
          {selectedTenantId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-0.5">
              {availableUnits.length > 0 ? (
                <Field label="Assigned Unit / Room">
                  <Select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                  >
                    {availableUnits.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {selectedProperty?.title ? `${selectedProperty.title} • ` : ""}Unit {u.unitNumber} {u.type ? `(${u.type})` : ""}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <Field label="Property Location">
                  <Input
                    disabled
                    value={selectedProperty?.title || "Standard Rental Property"}
                    className="bg-slate-100 text-slate-600 font-medium cursor-not-allowed"
                  />
                </Field>
              )}

              <Field label="Base Monthly Rent (₹)" required>
                <Input
                  type="number"
                  value={baseRent}
                  onChange={(e) => setBaseRent(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 20000"
                  className="font-bold text-slate-900"
                />
              </Field>
            </div>
          )}

          {/* Sub-Meter Utility Billing Section right in Bill Creation Form */}
          {selectedTenantId && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-xs">
                    <Zap className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Sub-Meter Utilities (Electricity & Water)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Enter monthly meter units to auto-calculate tenant charges
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300">
                  <input
                    type="checkbox"
                    checked={includeUtilities}
                    onChange={(e) => setIncludeUtilities(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Add to Bill</span>
                </label>
              </div>

              {includeUtilities && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Electricity Meter Inputs */}
                    <div className="rounded-xl bg-white p-3 border border-amber-200/90 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-950 flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Electricity Meter (kWh)
                        </span>
                        <Badge tone="yellow">₹{elecRate}/unit</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">Previous Unit</span>
                          <Input
                            type="number"
                            value={elecPrev}
                            onChange={(e) => setElecPrev(parseFloat(e.target.value) || 0)}
                            className="h-8 text-xs font-mono bg-slate-50 border-slate-200"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-amber-900 block mb-1">Current Unit *</span>
                          <Input
                            type="number"
                            placeholder="e.g. 1420"
                            value={elecCurrent}
                            onChange={(e) => setElecCurrent(e.target.value)}
                            className="h-8 text-xs font-mono font-bold text-slate-900 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 bg-amber-50/50 p-2 rounded-lg">
                        <span className="text-slate-600">Consumed: <strong className="text-slate-900 font-bold">{elecConsumed} units</strong></span>
                        <span className="text-amber-800 font-bold text-sm">₹{elecAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Water Meter Inputs */}
                    <div className="rounded-xl bg-white p-3 border border-blue-200/90 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-950 flex items-center gap-1.5">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          Water Supply Meter (kL)
                        </span>
                        <Badge tone="blue">₹{waterRate}/unit</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">Previous Unit</span>
                          <Input
                            type="number"
                            value={waterPrev}
                            onChange={(e) => setWaterPrev(parseFloat(e.target.value) || 0)}
                            className="h-8 text-xs font-mono bg-slate-50 border-slate-200"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-blue-900 block mb-1">Current Unit *</span>
                          <Input
                            type="number"
                            placeholder="e.g. 340"
                            value={waterCurrent}
                            onChange={(e) => setWaterCurrent(e.target.value)}
                            className="h-8 text-xs font-mono font-bold text-slate-900 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 bg-blue-50/50 p-2 rounded-lg">
                        <span className="text-slate-600">Consumed: <strong className="text-slate-900 font-bold">{waterConsumed} kL</strong></span>
                        <span className="text-blue-800 font-bold text-sm">₹{waterAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Calculation Summary Banner */}
                  <div className="p-3 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Base Rent</span>
                        <span className="font-bold text-white">₹{(baseRent || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <span className="text-slate-600 font-bold">+</span>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Electricity</span>
                        <span className="font-bold text-amber-400">₹{elecAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <span className="text-slate-600 font-bold">+</span>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Water</span>
                        <span className="font-bold text-blue-400">₹{waterAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 block text-[10px] uppercase font-bold tracking-wider">TOTAL BILL PAYABLE</span>
                      <span className="text-lg font-black text-emerald-400">
                        ₹{calculatedTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount and Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Field label="Total Bill Amount (₹) *" error={errors.amount?.message} required>
              <Input
                type="number"
                placeholder="e.g. 25000"
                {...register("amount", { valueAsNumber: true })}
                className="font-bold text-base text-slate-900"
              />
            </Field>

            <Field label="Payment Status">
              <Select {...register("status")}>
                <option value="PENDING">Pending (Bill Issued / Awaiting Payment)</option>
                <option value="PAID">Paid (Payment Received & Confirmed)</option>
                <option value="OVERDUE">Overdue (Delayed / Late Payment)</option>
              </Select>
            </Field>
          </div>

          {formError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" />
                  <span>{editingPayment ? "Save Changes" : "Generate Bill & Save"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deletingPayment)}
        title="Delete Payment Record"
        description={`Are you sure you want to delete this payment record of ${
          deletingPayment ? formatINR(deletingPayment.amount) : ""
        } for ${deletingPayment ? tenantName(deletingPayment.tenantId) : "this tenant"}? This action cannot be undone.`}
        confirmLabel="Delete Record"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingPayment(null)}
      />

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, message: "" })}
      />

      {/* Financial & Operational Reports Modal (BRD Sec 25) */}
      <ReportsModal
        open={reportsOpen}
        onClose={() => setReportsOpen(false)}
        defaultTab={reportTab}
      />
    </div>
  );
}
