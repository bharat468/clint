import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Mail,
  Phone,
  Building2,
  Calendar,
  Search,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { tenantService } from "@/services/tenant.service";
import { propertyService } from "@/services/property.service";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader, State } from "@/components/ui/page";
import { errMsg } from "@/lib/utils";
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
  const { data, loading, error, reload } = useApi(tenantService.list, [] as Tenant[]);
  const { data: properties } = useApi(propertyService.list, [] as Property[]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const propertyName = (id?: string | null) =>
    properties.find((p) => p.id === id)?.title ?? "Not assigned";

  const onSubmit = async (v: Form) => {
    setFormError(null);
    try {
      await tenantService.create({ ...v, propertyId: v.propertyId || null });
      reset();
      setOpen(false);
      reload();
    } catch (e) {
      setFormError(errMsg(e));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this tenant?")) return;
    try {
      await tenantService.remove(id);
      reload();
    } catch (e) {
      alert(errMsg(e));
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
        title="Tenants"
        subtitle={`Managing ${data.length} registered tenant profiles`}
        action={
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Tenant
          </Button>
        }
      />

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name, email, phone, or property..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <State
        loading={loading}
        error={error}
        empty={!loading && !error && data.length === 0}
        emptyMessage="No tenants added yet. Register tenants and assign them to your units to track leases."
        emptyAction={
          <Button onClick={() => setOpen(true)} size="sm">
            <Plus className="h-4 w-4" /> Add Tenant
          </Button>
        }
      />

      {/* Tenants Content */}
      {!loading && !error && filteredTenants.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card className="overflow-hidden border-slate-200/80">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Tenant</th>
                    <th className="px-5 py-3.5">Contact Details</th>
                    <th className="px-5 py-3.5">Assigned Unit</th>
                    <th className="px-5 py-3.5">Lease Term</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
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

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(t.id)}
                          aria-label="Remove tenant"
                          className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 h-8 w-8 p-1.5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Mobile Card View (Optimized for Phones) */}
          <div className="grid gap-4 md:hidden">
            {filteredTenants.map((t) => (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(t.id)}
                    aria-label="Remove tenant"
                    className="text-slate-400 hover:text-rose-600 p-1.5 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>{propertyName(t.propertyId)}</span>
                  </div>
                </div>

                {(t.leaseStart || t.leaseEnd) && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {t.leaseStart || "—"} → {t.leaseEnd || "—"}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add Tenant Modal */}
      <Modal
        open={open}
        title="Register New Tenant"
        subtitle="Add tenant contact info and link to a rental property"
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Field label="Lease Start Date">
              <Input type="date" {...register("leaseStart")} />
            </Field>

            <Field label="Lease End Date">
              <Input type="date" {...register("leaseEnd")} />
            </Field>
          </div>

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
              {isSubmitting ? "Saving..." : "Register Tenant"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
