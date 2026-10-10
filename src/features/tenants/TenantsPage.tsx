import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Pencil,
  Mail,
  Phone,
  Building2,
  Calendar,
  Search,
  RefreshCw,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { tenantService } from "@/services/tenant.service";
import { propertyService } from "@/services/property.service";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PageHeader, State } from "@/components/ui/page";
import { errMsg, formatDateTime } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import { canAccess } from "@/lib/permissions";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { Toast } from "@/components/ui/toast";
import { DatePicker } from "@/components/ui/date-picker";
import type { Property, Tenant } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Enter a valid 10-digit phone number"),
  propertyId: z.string().optional(),
  leaseStart: z.string().optional(),
  leaseEnd: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function TenantsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canReadTenant = canAccess(user, "tenant.read");
  const canCreateTenant = canAccess(user, "tenant.create");
  const canUpdateTenant = canAccess(user, "tenant.update");

  const { data, setData, loading, error, reload } = useApi(tenantService.list, [] as Tenant[]);
  const { data: properties } = useApi(propertyService.list, [] as Property[]);
  const [open, setOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: "success" | "error" | "info" }>({
    show: false,
    message: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const propertyName = (id?: string | null) =>
    properties.find((p) => p.id === id)?.title ?? "Not assigned";

  const handleOpenCreate = () => {
    setEditingTenant(null);
    reset({
      name: "",
      email: "",
      phone: "",
      propertyId: "",
      leaseStart: "",
      leaseEnd: "",
    });
    setFormError(null);
    setOpen(true);
  };

  const handleOpenEdit = (t: Tenant) => {
    setEditingTenant(t);
    reset({
      name: t.name,
      email: t.email,
      phone: t.phone,
      propertyId: t.propertyId || "",
      leaseStart: t.leaseStart || "",
      leaseEnd: t.leaseEnd || "",
    });
    setFormError(null);
    setOpen(true);
  };

  const onSubmit = async (v: Form) => {
    setFormError(null);
    try {
      if (editingTenant) {
        const updated = await tenantService.update(editingTenant.id, { ...v, propertyId: v.propertyId || null });
        reset();
        setOpen(false);
        setEditingTenant(null);
        if (updated) {
          setData((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
        }
        setToast({ show: true, type: "success", message: "Tenant details updated successfully." });
        await reload();
      } else {
        const created = await tenantService.create({ ...v, propertyId: v.propertyId || null });
        reset();
        setOpen(false);
        setEditingTenant(null);
        if (created) {
          setData((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
        }
        setToast({ show: true, type: "success", message: "Tenant registered successfully." });
        await reload();
      }
    } catch (e) {
      const err = errMsg(e);
      setFormError(err);
      setToast({ show: true, type: "error", message: err });
    }
  };

  const handleRequestDelete = (tenant: Tenant) => {
    setDeletingTenant(tenant);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTenant) return;
    setIsDeleting(true);
    try {
      await tenantService.remove(deletingTenant.id);
      setData((prev) => prev.filter((t) => t.id !== deletingTenant.id));
      const deletedName = deletingTenant.name;
      setDeletingTenant(null);
      setToast({ show: true, type: "success", message: `Tenant "${deletedName}" removed successfully.` });
      await reload();
    } catch (e) {
      const err = errMsg(e);
      setFormError(err);
      setToast({ show: true, type: "error", message: err });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTenants = useMemo(() => {
    return data.filter((t) => {
      const q = searchTerm.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        propertyName(t.propertyId).toLowerCase().includes(q)
      );
    });
  }, [data, searchTerm, properties]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const paginatedTenants = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTenants.slice(start, start + pageSize);
  }, [filteredTenants, page, pageSize]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (!canReadTenant) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tenants"
          subtitle="Directory of tenant profiles and lease assignments"
        />
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Access Restricted</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Your role does not have permission (<code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">tenant.read</code>) to view the tenant directory. Please contact your property administrator.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Tenants"
        subtitle={`Managing ${data.length} registered tenant profiles`}
        action={
          canCreateTenant ? (
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add Tenant
            </Button>
          ) : undefined
        }
      />

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name, email, phone, or unit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <State
        loading={loading}
        error={error}
        empty={!loading && !error && data.length === 0}
        emptyMessage="No tenants registered yet. Add a tenant and associate them with a rental property."
        emptyAction={
          <Button onClick={handleOpenCreate} size="sm">
            <Plus className="h-4 w-4" /> Add Tenant
          </Button>
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
                    <th className="px-5 py-3.5">Tenant Profile</th>
                    <th className="px-5 py-3.5">Contact Details</th>
                    <th className="px-5 py-3.5">Assigned Unit</th>
                    <th className="px-5 py-3.5">Lease Term</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Added / Updated</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {paginatedTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Tenant with Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-xs font-bold text-white shadow-xs">
                            {getInitials(t.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{t.name}</p>
                            <span className="text-[11px] font-medium text-slate-400">
                              ID: #{t.id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{t.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{t.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Unit */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className="font-medium text-slate-800">
                            {propertyName(t.propertyId)}
                          </span>
                        </div>
                      </td>

                      {/* Lease Term */}
                      <td className="px-5 py-4">
                        {t.leaseStart || t.leaseEnd ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {t.leaseStart || "—"} to {t.leaseEnd || "—"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No active lease dates</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge tone={t.propertyId ? "green" : "yellow"} dot>
                          {t.propertyId ? "Active Lease" : "Unassigned"}
                        </Badge>
                      </td>

                      {/* Added / Updated Timestamps */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{t.createdAt ? formatDateTime(t.createdAt) : "—"}</span>
                        </div>
                        {t.updatedAt && t.updatedAt !== t.createdAt && (
                          <div className="text-[11px] text-slate-400 pl-5 mt-0.5">
                            Upd: {formatDateTime(t.updatedAt)}
                          </div>
                        )}
                      </td>

                      {/* Action Buttons: Edit + Delete */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdateTenant && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(t)}
                                aria-label="Edit tenant"
                                className="text-slate-500 hover:bg-blue-50 hover:text-blue-600 h-8 w-8 p-1.5"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRequestDelete(t)}
                                aria-label="Remove tenant"
                                className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 h-8 w-8 p-1.5"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Mobile Card View (Optimized for Phones) */}
          <div className="grid gap-4 md:hidden">
            {paginatedTenants.map((t) => (
              <Card key={t.id} className="p-4 space-y-3 border-slate-200/80">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-xs font-bold text-white shadow-xs">
                      {getInitials(t.name)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <span className="text-[11px] text-slate-400">ID: #{t.id.slice(-6)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {canUpdateTenant && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(t)}
                          aria-label="Edit tenant"
                          className="text-slate-500 hover:text-blue-600 p-1.5 h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRequestDelete(t)}
                          aria-label="Remove tenant"
                          className="text-slate-400 hover:text-rose-600 p-1.5 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{t.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{t.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-medium pt-1 border-t border-slate-200/60">
                    <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>{propertyName(t.propertyId)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <DataTablePagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={filteredTenants.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50]}
            apiEndpoint="GET /api/v1/tenants"
            className="rounded-2xl border border-slate-200 bg-white mt-4"
          />
        </>
      )}

      {/* Add / Edit Tenant Modal */}
      <Modal
        open={open}
        title={editingTenant ? "Edit Tenant Profile" : "Register New Tenant"}
        subtitle={
          editingTenant
            ? `Update profile details and lease agreement for ${editingTenant.name}`
            : "Add tenant contact info and link to a rental property"
        }
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
              {formError}
            </div>
          )}

          <Field label="Full Name" error={errors.name?.message} required>
            <Input placeholder="e.g. Rahul Sharma" {...register("name")} />
          </Field>

          <Field label="Email Address" error={errors.email?.message} required>
            <Input type="email" placeholder="e.g. rahul@example.com" {...register("email")} />
          </Field>

          <Field label="Mobile Phone" error={errors.phone?.message} required>
            <Input placeholder="e.g. 9876543210" {...register("phone")} />
          </Field>

          <Field label="Assigned Property Unit">
            <Select {...register("propertyId")}>
              <option value="">Not assigned (Unassigned Tenant)</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.city} - {p.bedrooms} BHK)
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Lease Start Date" error={errors.leaseStart?.message}>
              <DatePicker
                value={watch("leaseStart") || ""}
                onChange={(d) => setValue("leaseStart", d)}
                placeholder="Select start date"
              />
            </Field>

            <Field label="Lease End Date" error={errors.leaseEnd?.message}>
              <DatePicker
                value={watch("leaseEnd") || ""}
                onChange={(d) => setValue("leaseEnd", d)}
                placeholder="Select end date"
              />
            </Field>
          </div>

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
                <span>{editingTenant ? "Save Changes" : "Register Tenant"}</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deletingTenant)}
        title="Remove Tenant Record?"
        description={
          deletingTenant
            ? `Are you sure you want to remove ${deletingTenant.name} (${deletingTenant.phone})? Any associated active lease assignments will be unlinked.`
            : "Are you sure you want to remove this tenant?"
        }
        confirmText="Yes, Remove Tenant"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingTenant(null)}
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
