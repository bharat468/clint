import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Building2,
  MapPin,
  Bed,
  IndianRupee,
  Search,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { propertyService } from "@/services/property.service";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { PageHeader, State } from "@/components/ui/page";
import { errMsg, formatINR } from "@/lib/utils";
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
  const { data, loading, error, reload } = useApi(propertyService.list, [] as Property[]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "VACANT" | "OCCUPIED">("ALL");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { status: "VACANT" },
  });

  const onSubmit = async (v: Form) => {
    setFormError(null);
    try {
      await propertyService.create(v);
      reset();
      setOpen(false);
      reload();
    } catch (e) {
      setFormError(errMsg(e));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      await propertyService.remove(id);
      reload();
    } catch (e) {
      alert(errMsg(e));
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

  const vacantCount = data.filter((p) => p.status === "VACANT").length;
  const occupiedCount = data.filter((p) => p.status === "OCCUPIED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Properties"
        subtitle={`Managing ${data.length} registered units (${occupiedCount} occupied, ${vacantCount} vacant)`}
        action={
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
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
          <Button onClick={() => setOpen(true)} size="sm">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        }
      />

      {/* Property Cards Grid */}
      {!loading && !error && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredData.map((p) => {
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
                    <Badge tone={isVacant ? "green" : "blue"} dot>
                      {p.status}
                    </Badge>
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
                </div>

                {/* Card Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    ID: #{p.id.slice(-6)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(p.id)}
                    aria-label="Delete property"
                    className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 p-1.5 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Property Modal */}
      <Modal
        open={open}
        title="Add New Property"
        subtitle="Enter property details to include in your portfolio"
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Field label="Occupancy Status">
            <Select {...register("status")}>
              <option value="VACANT">Vacant (Ready for Tenant)</option>
              <option value="OCCUPIED">Occupied (Tenant Assigned)</option>
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
              {isSubmitting ? "Saving..." : "Save Property"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
