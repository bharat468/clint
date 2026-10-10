import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Pencil,
  Building2,
  MapPin,
  Bed,
  IndianRupee,
  Search,
  RefreshCw,
  Clock,
  Layers,
  ShieldAlert,
} from "lucide-react";
import PropertyUnitsModal from "./components/PropertyUnitsModal";
import { useApi } from "@/hooks/useApi";
import { propertyService } from "@/services/property.service";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PageHeader, State } from "@/components/ui/page";
import { errMsg, formatINR, formatDateTime } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import { canAccess } from "@/lib/permissions";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { Toast } from "@/components/ui/toast";
import type { Property } from "@/types";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  address: z.string().min(2, "Address is required"),
  city: z.string().min(2, "City is required"),
  rent: z.number({ invalid_type_error: "Enter valid rent amount" }).positive(),
  bedrooms: z.number({ invalid_type_error: "Enter bedrooms" }).int().min(0),
  status: z.enum(["VACANT", "OCCUPIED"]),
});
type Form = z.infer<typeof schema>;

export default function PropertiesPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canReadProp = canAccess(user, "property.read");
  const canCreateProp = canAccess(user, "property.create");
  const canUpdateProp = canAccess(user, "property.update");
  const canDeleteProp = canAccess(user, "property.delete");
  const canViewUnits = canAccess(user, "unit.read") || canAccess(user, "unit.create");

  const { data, setData, loading, error, reload } = useApi(propertyService.list, [] as Property[]);
  const [open, setOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "VACANT" | "OCCUPIED">("ALL");
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: "success" | "error" | "info" }>({
    show: false,
    message: "",
  });
  const [selectedPropertyForUnits, setSelectedPropertyForUnits] = useState<Property | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { status: "VACANT" },
  });

  const handleOpenCreate = () => {
    setEditingProperty(null);
    reset({
      title: "",
      address: "",
      city: "",
      rent: 20000,
      bedrooms: 2,
      status: "VACANT",
    });
    setFormError(null);
    setOpen(true);
  };

  const handleOpenEdit = (p: Property) => {
    setEditingProperty(p);
    reset({
      title: p.title,
      address: p.address,
      city: p.city,
      rent: p.rent,
      bedrooms: p.bedrooms,
      status: p.status,
    });
    setFormError(null);
    setOpen(true);
  };

  const onSubmit = async (v: Form) => {
    setFormError(null);
    try {
      if (editingProperty) {
        const updated = await propertyService.update(editingProperty.id, v);
        reset();
        setOpen(false);
        setEditingProperty(null);
        if (updated) {
          setData((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
        }
        setToast({ show: true, type: "success", message: "Property updated successfully." });
        await reload();
      } else {
        const created = await propertyService.create(v);
        reset();
        setOpen(false);
        setEditingProperty(null);
        if (created) {
          setData((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
        }
        setToast({ show: true, type: "success", message: "Property registered successfully." });
        await reload();
      }
    } catch (e) {
      const err = errMsg(e);
      setFormError(err);
      setToast({ show: true, type: "error", message: err });
    }
  };

  const handleRequestDelete = (p: Property) => {
    setDeletingProperty(p);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProperty) return;
    setIsDeleting(true);
    try {
      await propertyService.remove(deletingProperty.id);
      setData((prev) => prev.filter((p) => p.id !== deletingProperty.id));
      const deletedTitle = deletingProperty.title;
      setDeletingProperty(null);
      setToast({ show: true, type: "success", message: `Property "${deletedTitle}" removed successfully.` });
      await reload();
    } catch (e) {
      const err = errMsg(e);
      setFormError(err);
      setToast({ show: true, type: "error", message: err });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (p: Property) => {
    const newStatus = p.status === "VACANT" ? "OCCUPIED" : "VACANT";
    try {
      await propertyService.update(p.id, { status: newStatus });
      setToast({ show: true, type: "success", message: `Property marked as ${newStatus}.` });
      reload();
    } catch (e) {
      setToast({ show: true, type: "error", message: errMsg(e) });
    }
  };

  // Filtered properties
  const filteredData = useMemo(() => {
    return data.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const vacantCount = data.filter((p) => p.status === "VACANT").length;
  const occupiedCount = data.filter((p) => p.status === "OCCUPIED").length;

  if (!canReadProp) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Properties & Buildings"
          subtitle="Building inventory and residential unit management"
        />
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Access Restricted</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Your role does not have permission (<code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">property.read</code>) to view property and building assets. Please contact your property administrator.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Properties & Buildings"
        subtitle={`Managing ${data.length} registered buildings (${occupiedCount} occupied, ${vacantCount} vacant)`}
        action={
          canCreateProp ? (
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add Building
            </Button>
          ) : undefined
        }
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by title, city, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200/60 self-start sm:self-auto">
          {(["ALL", "VACANT", "OCCUPIED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === filter
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {filter === "ALL" ? `All (${data.length})` : filter === "VACANT" ? `Vacant (${vacantCount})` : `Occupied (${occupiedCount})`}
            </button>
          ))}
        </div>
      </div>

      <State
        loading={loading}
        error={error}
        empty={!loading && !error && data.length === 0}
        emptyMessage="No properties in your portfolio yet. Add your first rental apartment or house to begin tracking."
        emptyAction={
          <Button onClick={handleOpenCreate} size="sm">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        }
      />

      {/* Property Cards Grid */}
      {!loading && !error && (
        <div className="space-y-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedData.map((p) => {
            const isVacant = p.status === "VACANT";
            return (
              <Card
                key={p.id}
                hoverEffect
                className="group flex flex-col justify-between p-5 border-slate-200/80"
              >
                <div>
                  {/* Top Bar with Icon & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                          {p.title}
                        </h3>
                        <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{p.city}</span>
                        </p>
                      </div>
                    </div>

                    {/* Interactive Status Badge (Click to toggle) */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(p)}
                      title="Click to toggle Occupied/Vacant status"
                      className="transition-transform active:scale-95"
                    >
                      <Badge tone={isVacant ? "green" : "blue"} dot className="cursor-pointer">
                        {p.status}
                      </Badge>
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.address}
                  </p>

                  {/* Highlights Pill */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      <Bed className="h-3.5 w-3.5 text-slate-500" />
                      {p.bedrooms} BHK
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      <IndianRupee className="h-3.5 w-3.5 text-blue-500" />
                      {formatINR(p.rent)}/mo
                    </span>
                  </div>

                  {/* Audit Info: Created At / Created By */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100/80 pt-2.5">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>{p.createdAt ? formatDateTime(p.createdAt) : "Recently added"}</span>
                    </div>
                    {p.createdBy?.name && (
                      <span className="truncate max-w-[120px] font-medium text-slate-500" title={`Added by ${p.createdBy.name}`}>
                        by {p.createdBy.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer with Edit & Delete */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    ID: #{p.id.slice(-6)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {canViewUnits && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPropertyForUnits(p)}
                        className="gap-1.5 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-8 px-2.5"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        <span>Flats/Units</span>
                      </Button>
                    )}
                    {canUpdateProp && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(p)}
                        aria-label="Edit property"
                        className="text-slate-500 hover:bg-blue-50 hover:text-blue-600 p-1.5 h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDeleteProp && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRequestDelete(p)}
                        aria-label="Delete property"
                        className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 p-1.5 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
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
            totalRecords={filteredData.length}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            pageSizeOptions={[6, 9, 15, 30]}
            apiEndpoint="GET /api/v1/properties"
          />
        </div>
      )}

      {/* Add / Edit Property Modal */}
      <Modal
        open={open}
        title={editingProperty ? "Edit Property Details" : "Add New Property"}
        subtitle={
          editingProperty
            ? `Update specifications and rental terms for ${editingProperty.title}`
            : "Enter property details to include in your portfolio"
        }
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
              {formError}
            </div>
          )}

          <Field label="Property Title" error={errors.title?.message} required>
            <Input placeholder="e.g. Skyline Heights - Flat 402" {...register("title")} />
          </Field>

          <Field label="Street Address" error={errors.address?.message} required>
            <Input placeholder="e.g. 12th Main, Indiranagar" {...register("address")} />
          </Field>

          <Field label="City" error={errors.city?.message} required>
            <Input placeholder="e.g. Bengaluru" {...register("city")} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly Rent (₹)" error={errors.rent?.message} required>
              <Input
                type="number"
                placeholder="25000"
                {...register("rent", { valueAsNumber: true })}
              />
            </Field>

            <Field label="Bedrooms (BHK)" error={errors.bedrooms?.message} required>
              <Input
                type="number"
                placeholder="2"
                {...register("bedrooms", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <Field label="Occupancy Status" required>
            <Select {...register("status")}>
              <option value="VACANT">VACANT (Ready for tenant)</option>
              <option value="OCCUPIED">OCCUPIED (Leased)</option>
            </Select>
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingProperty ? "Save Changes" : "Create Property"}</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deletingProperty)}
        title="Delete Property?"
        description={
          deletingProperty
            ? `Are you sure you want to remove "${deletingProperty.title}" (${deletingProperty.city})? Any associated units or active leases should be reviewed before deletion.`
            : "Are you sure you want to delete this property?"
        }
        confirmText="Yes, Delete Property"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingProperty(null)}
      />

      {/* Multi-Unit Management Modal */}
      {selectedPropertyForUnits && (
        <PropertyUnitsModal
          property={selectedPropertyForUnits}
          onClose={() => {
            setSelectedPropertyForUnits(null);
            reload();
          }}
        />
      )}

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, message: "" })}
      />
    </div>
  );
}
