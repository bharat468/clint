import { useState, useEffect } from "react";
import { X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { roleService } from "@/services/role.service";
import type { Role } from "@/types";

interface CustomRoleModalProps {
  open: boolean;
  roleToEdit?: Role | null;
  organizationId?: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

interface PermissionGroup {
  module: string;
  title: string;
  description: string;
  permissions: {
    key: string;
    action: "Create" | "Read" | "Update" | "Delete" | "Special";
    label: string;
  }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: "PROPERTY",
    title: "Properties & Buildings",
    description: "Manage buildings, societies, and property listings",
    permissions: [
      { key: "property.read", action: "Read", label: "View Buildings" },
      { key: "property.create", action: "Create", label: "Add Buildings" },
      { key: "property.update", action: "Update", label: "Edit Buildings" },
      { key: "property.delete", action: "Delete", label: "Delete Buildings" },
    ],
  },
  {
    module: "UNIT",
    title: "Units & Flats",
    description: "Manage individual flats, rooms, shops, and spaces",
    permissions: [
      { key: "unit.read", action: "Read", label: "View Flats/Units" },
      { key: "unit.create", action: "Create", label: "Add Flats/Units" },
      { key: "unit.update", action: "Update", label: "Edit Flats/Units" },
      { key: "unit.delete", action: "Delete", label: "Delete Flats/Units" },
    ],
  },
  {
    module: "TENANT",
    title: "Tenants & Onboarding",
    description: "Manage tenant records, contact details, and occupancy",
    permissions: [
      { key: "tenant.read", action: "Read", label: "View Tenants" },
      { key: "tenant.create", action: "Create", label: "Onboard Tenants" },
      { key: "tenant.update", action: "Update", label: "Edit Tenants" },
    ],
  },
  {
    module: "LEASE",
    title: "Digital Leases & Agreements",
    description: "Manage rental agreements, terms, and renewals",
    permissions: [
      { key: "lease.read", action: "Read", label: "View Leases" },
      { key: "lease.create", action: "Create", label: "Create Leases" },
      { key: "lease.update", action: "Update", label: "Edit Lease Terms" },
      { key: "lease.terminate", action: "Special", label: "Terminate Leases" },
    ],
  },
  {
    module: "FINANCE",
    title: "Rent & Payments",
    description: "Track invoices, payments, and generate PDF bills",
    permissions: [
      { key: "payment.read", action: "Read", label: "View Payments & Ledger" },
      { key: "payment.create", action: "Create", label: "Record Payment & Issue Bills" },
      { key: "payment.update", action: "Update", label: "Update Payment Status" },
    ],
  },
  {
    module: "MAINTENANCE",
    title: "Maintenance & Complaints",
    description: "Track service requests, plumbing/electrical repairs",
    permissions: [
      { key: "maintenance.read", action: "Read", label: "View Complaints" },
      { key: "maintenance.create", action: "Create", label: "Raise / Log Tickets" },
      { key: "maintenance.update", action: "Update", label: "Assign & Resolve Tickets" },
    ],
  },
  {
    module: "REPORTS",
    title: "Reports & Financials",
    description: "Access occupancy, revenue, and arrears analytics",
    permissions: [
      { key: "report.read", action: "Read", label: "View Reports & Export" },
    ],
  },
];

export default function CustomRoleModal({
  open,
  roleToEdit,
  organizationId,
  onClose,
  onSuccess,
}: CustomRoleModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setDescription(roleToEdit.description || "");
      const keys = roleToEdit.permissions?.map((p) => p.permission?.key).filter(Boolean) || [];
      setSelectedKeys(keys);
    } else {
      setName("");
      setDescription("");
      setSelectedKeys(["property.read", "unit.read", "tenant.read", "payment.read", "maintenance.read"]);
    }
    setError(null);
  }, [roleToEdit, open]);

  if (!open) return null;

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleGroup = (group: PermissionGroup) => {
    const groupKeys = group.permissions.map((p) => p.key);
    const allSelected = groupKeys.every((k) => selectedKeys.includes(k));

    if (allSelected) {
      setSelectedKeys((prev) => prev.filter((k) => !groupKeys.includes(k)));
    } else {
      const merged = Array.from(new Set([...selectedKeys, ...groupKeys]));
      setSelectedKeys(merged);
    }
  };

  const selectAll = () => {
    const all = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key));
    setSelectedKeys(Array.from(new Set(all)));
  };

  const clearAll = () => {
    setSelectedKeys([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Role name is required");
      return;
    }

    if (selectedKeys.length === 0) {
      setError("Please select at least one permission for this role");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (roleToEdit) {
        await roleService.updateRole(roleToEdit.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          permissionKeys: selectedKeys,
        });
        onSuccess(`Role "${name.trim()}" updated successfully`);
      } else {
        await roleService.createRole({
          name: name.trim(),
          description: description.trim() || undefined,
          permissionKeys: selectedKeys,
          organizationId,
        });
        onSuccess(`Custom role "${name.trim()}" created successfully with ${selectedKeys.length} permissions`);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to save role");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {roleToEdit ? "Edit Operational Role" : "Create Custom Operational Role"}
              </h2>
              <p className="text-xs text-slate-500">
                Define specific CRUD privileges for property managers, accountants, and staff
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 font-semibold border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Role Title *" required>
              <Input
                placeholder="e.g. Caretaker / Floor Supervisor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <Field label="Brief Role Description">
              <Input
                placeholder="e.g. Inspects flats, logs repair requests"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>

          {/* Permissions Matrix Bar */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Granular CRUD Permissions Matrix</h3>
                <p className="text-xs text-slate-500">
                  Selected: <span className="font-bold text-indigo-600">{selectedKeys.length}</span> permissions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  className="h-7 text-xs px-2.5"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 text-xs px-2.5 text-slate-500"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Groups Grid */}
            <div className="space-y-3">
              {PERMISSION_GROUPS.map((group) => {
                const groupKeys = group.permissions.map((p) => p.key);
                const allSelected = groupKeys.every((k) => selectedKeys.includes(k));

                return (
                  <div
                    key={group.module}
                    className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{group.title}</span>
                        <p className="text-[11px] text-slate-500">{group.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleGroup(group)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                      >
                        {allSelected ? "Uncheck Group" : "Select Group"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {group.permissions.map((p) => {
                        const isChecked = selectedKeys.includes(p.key);
                        return (
                          <label
                            key={p.key}
                            className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-indigo-50/70 border-indigo-200 text-indigo-950 font-medium"
                                : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleKey(p.key)}
                              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="leading-tight">
                              <span className="block font-semibold text-[11px]">{p.label}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{p.key}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving Role..." : roleToEdit ? "Save Changes" : "Create Role"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
