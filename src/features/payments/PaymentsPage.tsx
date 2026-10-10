import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Pencil,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  FileDown,
  ShieldAlert,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { paymentService } from "@/services/payment.service";
import { tenantService } from "@/services/tenant.service";
import { propertyService } from "@/services/property.service";
import { useAppSelector } from "@/app/hooks";
import { generateRentInvoicePdf } from "@/lib/rentInvoicePdf";
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
  const user = useAppSelector((s) => s.auth.user);
  const canReadPayment = canAccess(user, "payment.read");
  const canCreatePayment = canAccess(user, "payment.create");
  const canUpdatePayment = canAccess(user, "payment.update");
  const canDeletePayment = canAccess(user, "payment.delete") || canAccess(user, "payment.update");

  const { data, setData, loading, error, reload } = useApi(paymentService.list, [] as Payment[]);
  const { data: tenants } = useApi(tenantService.list, [] as Tenant[]);
  const { data: properties } = useApi(propertyService.list, [] as Property[]);
  const [open, setOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING" | "OVERDUE">("ALL");
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
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { status: "PENDING", month: currentMonth },
  });

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
    const property = properties.find((pr) => pr.id === propId);

    generateRentInvoicePdf({
      paymentId: p.id,
      month: p.month,
      propertyName: property?.title || "Rental Residence",
      propertyAddress: property?.address || `${property?.city || "Metro Area"}`,
      landlordName: user?.name || "Property Owner",
      landlordPhone: user?.mobile,
      landlordEmail: user?.email || undefined,
      tenantName: tenant?.name || "Tenant",
      tenantPhone: tenant?.phone,
      tenantEmail: tenant?.email || undefined,
      amount: p.amount,
      status: p.status,
      paidOn: p.paidOn,
    });
  };

  const handleOpenCreate = () => {
    setEditingPayment(null);
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
    try {
      if (editingPayment) {
        const updated = await paymentService.update(editingPayment.id, {
          ...v,
          propertyId: tenant?.propertyId ?? editingPayment.propertyId ?? "",
          paidOn: v.status === "PAID" ? new Date().toISOString().slice(0, 10) : null,
        });
        reset();
        setOpen(false);
        setEditingPayment(null);
        if (updated) {
          setData((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
        }
        setToast({ show: true, type: "success", message: "Payment record updated successfully." });
        await reload();
      } else {
        const created = await paymentService.create({
          ...v,
          propertyId: tenant?.propertyId ?? "",
          paidOn: v.status === "PAID" ? new Date().toISOString().slice(0, 10) : null,
        });
        reset();
        setOpen(false);
        setEditingPayment(null);
        if (created) {
          setData((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
        }
        setToast({ show: true, type: "success", message: "Payment record created successfully." });
        await reload();
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
          canCreatePayment ? (
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Record Payment
            </Button>
          ) : undefined
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
            <Button onClick={handleOpenCreate} size="sm">
              <Plus className="h-4 w-4" /> Record Payment
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

      {/* Record / Edit Payment Modal */}
      <Modal
        open={open}
        title={editingPayment ? "Edit Rent Payment" : "Record Rent Payment"}
        subtitle={
          editingPayment
            ? "Update payment invoice records, amount or status"
            : "Log a new rent invoice or payment transaction"
        }
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Tenant" error={errors.tenantId?.message} required>
            <Select {...register("tenantId")}>
              <option value="">Select tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Billing Month" error={errors.month?.message} required>
            <Select {...register("month")}>
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Amount (₹)" error={errors.amount?.message} required>
            <Input
              type="number"
              placeholder="e.g. 25000"
              {...register("amount", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Payment Status">
            <Select {...register("status")}>
              <option value="PENDING">Pending (Payment Awaited)</option>
              <option value="PAID">Paid (Payment Received)</option>
              <option value="OVERDUE">Overdue (Delayed Payment)</option>
            </Select>
          </Field>

          {formError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingPayment ? "Save Changes" : "Record Payment"}</span>
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
    </div>
  );
}
