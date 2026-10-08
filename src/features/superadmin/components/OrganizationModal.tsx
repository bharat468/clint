import { useState, useEffect } from "react";
import { X, Building2, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { adminService } from "@/services/admin.service";
import type { AdminOrganization, Plan } from "@/types";

interface OrganizationModalProps {
  open: boolean;
  orgToEdit?: AdminOrganization | null;
  plans: Plan[];
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function OrganizationModal({
  open,
  orgToEdit,
  plans,
  onClose,
  onSuccess,
}: OrganizationModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerMobile, setOwnerMobile] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orgToEdit) {
      setName(orgToEdit.name);
      setSlug(orgToEdit.slug);
      setOwnerMobile(orgToEdit.owner?.mobile || "");
      setOwnerName(orgToEdit.owner?.name || "");
      setOwnerEmail(orgToEdit.owner?.email || "");
      setSelectedPlanId(orgToEdit.subscription?.planId || "");
    } else {
      setName("");
      setSlug("");
      setOwnerMobile("");
      setOwnerName("");
      setOwnerEmail("");
      setSelectedPlanId(plans[0]?.id || "");
    }
    setError(null);
  }, [orgToEdit, open, plans]);

  if (!open) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!orgToEdit) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Organization name is required.");
      return;
    }

    if (!orgToEdit && !/^\d{10}$/.test(ownerMobile.trim())) {
      setError("A valid 10-digit owner mobile number is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const generatedSlug = slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (orgToEdit) {
        await adminService.updateOrganization(orgToEdit.id, {
          name: name.trim(),
          slug: generatedSlug,
        });
        onSuccess(`Organization "${name.trim()}" updated successfully`);
      } else {
        await adminService.createOrganization({
          name: name.trim(),
          slug: generatedSlug,
          ownerMobile: ownerMobile.trim(),
          ownerName: ownerName.trim() || undefined,
          ownerEmail: ownerEmail.trim() || undefined,
          planId: selectedPlanId || undefined,
        });
        onSuccess(`Organization "${name.trim()}" created successfully with initial portfolio`);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to process organization");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <Card className="max-w-lg w-full bg-white border border-slate-200 p-6 text-slate-900 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>{orgToEdit ? "Edit Client Organization" : "Create Client Organization"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {orgToEdit
                ? `Update portfolio name & identity for ${orgToEdit.name}`
                : "Provision workspace, owner credentials and subscription tier"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Field label="Organization / Company Name" required>
            <Input
              placeholder="e.g. Skyline Properties LLC"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </Field>

          <Field label="Workspace Slug (URL Identifier)" required>
            <Input
              placeholder="e.g. skyline-properties"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              required
            />
          </Field>

          {!orgToEdit && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <p className="font-bold text-slate-800">Primary Owner Details</p>
              <Field label="Owner 10-Digit Mobile (For Login)" required>
                <Input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={ownerMobile}
                  onChange={(e) => setOwnerMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                />
              </Field>

              <Field label="Owner Full Name">
                <Input
                  placeholder="e.g. Rajesh Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </Field>

              <Field label="Owner Email Address">
                <Input
                  type="email"
                  placeholder="e.g. rajesh@example.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </Field>
            </div>
          )}

          {!orgToEdit && (
            <Field label="Assign Initial SaaS Subscription Plan">
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.maxProperties} properties, {p.maxStaff} staff)
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5"
            >
              {submitting ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>{orgToEdit ? "Save Changes" : "Create Organization"}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
