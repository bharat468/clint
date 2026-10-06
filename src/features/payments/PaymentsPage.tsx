import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { paymentService } from "@/services/payment.service";
import { tenantService } from "@/services/tenant.service";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { PageHeader, State } from "@/components/ui/page";
import { errMsg, formatINR } from "@/lib/utils";
import type { Payment, Tenant } from "@/types";

const schema = z.object({
  tenantId: z.string().min(1, "Please select a tenant"),
  amount: z.number({ invalid_type_error: "Enter valid amount" }).positive(),
  month: z.string().min(1, "Select billing month"),
  status: z.enum(["PAID", "PENDING", "OVERDUE"]),
});
type Form = z.infer<typeof schema>;

const tone = { PAID: "green", PENDING: "yellow", OVERDUE: "red" } as const;

export default function PaymentsPage() {
  const { data, loading, error, reload } = useApi(paymentService.list, [] as Payment[]);
  const { data: tenants } = useApi(tenantService.list, [] as Tenant[]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING" | "OVERDUE">("ALL");
  const [formError, setFormError] = useState<string | null>(null);

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

  const onSubmit = async (v: Form) => {
    setFormError(null);
    const tenant = tenants.find((t) => t.id === v.tenantId);
    try {
      await paymentService.create({
        ...v,
        propertyId: tenant?.propertyId ?? "",
        paidOn: v.status === "PAID" ? new Date().toISOString().slice(0, 10) : null,
      });
      reset();
      setOpen(false);
      reload();
    } catch (e) {
      setFormError(errMsg(e));
    }
  };

  const markPaid = async (id: string) => {
    try {
      await paymentService.update(id, {
        status: "PAID",
        paidOn: new Date().toISOString().slice(0, 10),
      });
      reload();
    } catch (e) {
      alert(errMsg(e));
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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Rent & Payments"
        subtitle="Track rent invoices, payment statuses, and overdue collections"
        action={
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        }
      />

      {/* Top 3 Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 border-emerald-100 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Collected Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{formatINR(totalCollected)}</div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            {paidList.length} transactions completed
          </p>
        </Card>

        <Card className="p-5 border-amber-100 bg-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Pending Collections
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">{formatINR(totalPending)}</div>
          <p className="mt-1 text-xs text-amber-600 font-medium">
            {pendingList.length} awaiting payment
          </p>
        </Card>

        <Card className="p-5 border-rose-100 bg-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Overdue Dues
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700">{formatINR(totalOverdue)}</div>
          <p className="mt-1 text-xs text-rose-600 font-medium">
            {overdueList.length} overdue payments
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search tenant or month (e.g. 2026-03)..."
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
        emptyMessage="No payments recorded yet. Log your first rent payment or invoice."
        emptyAction={
          <Button onClick={() => setOpen(true)} size="sm">
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        }
      />

      {/* Payments Content */}
      {!loading && !error && filteredPayments.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card className="overflow-hidden border-slate-200/80">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Tenant</th>
                    <th className="px-5 py-3.5">Billing Month</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => {
                    const name = tenantName(p.tenantId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Tenant */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                              {getInitials(name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{name}</p>
                              <span className="text-[11px] text-slate-400">ID: #{p.id.slice(-6)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Month */}
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
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

                        {/* Status */}
                        <td className="px-5 py-4">
                          <Badge tone={tone[p.status]} dot>
                            {p.status}
                          </Badge>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          {p.status !== "PAID" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markPaid(p.id)}
                              className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Mark Paid</span>
                            </Button>
                          )}
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
            {filteredPayments.map((p) => {
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

                    {p.status !== "PAID" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markPaid(p.id)}
                        className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Mark Paid</span>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Record Payment Modal */}
      <Modal
        open={open}
        title="Record Rent Payment"
        subtitle="Log a new rent invoice or payment transaction"
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

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
