import React, { useEffect, useState, useMemo } from "react";
import {
  FileText,
  CheckCircle2,
  User,
  Phone,
  Building2,
  ShieldAlert,
  Search,
  Clock,
  XCircle,
  IndianRupee,
  Briefcase,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  rentalLifecycleService,
  RentalApplication,
} from "@/services/rentalLifecycle.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAppSelector } from "@/app/hooks";
import { canAccess } from "@/lib/permissions";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { formatINR } from "@/lib/utils";

export default function ApplicationsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const canReadApps =
    canAccess(user, "lease.create") ||
    canAccess(user, "lease.update") ||
    canAccess(user, "property.update") ||
    canAccess(user, "tenant.create");

  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Toast & Modals
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type?: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
  });
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  // Approval Modal
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<RentalApplication | null>(null);
  const [dueDay, setDueDay] = useState(5);
  const [graceDays, setGraceDays] = useState(3);
  const [penaltyType, setPenaltyType] = useState("PER_DAY");
  const [penaltyAmount, setPenaltyAmount] = useState(100);
  const [maxPenaltyCap, setMaxPenaltyCap] = useState(2000);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [selectedStatus]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await rentalLifecycleService.listOwnerApplications(selectedStatus);
      setApplications(data);
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoading(false);
    }
  };

  // KPI Metrics calculation
  const metrics = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "PENDING").length;
    const approved = applications.filter((a) => a.status === "APPROVED").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;
    return { total, pending, approved, rejected };
  }, [applications]);

  // Client-side search filtering
  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((app) => {
      const name = (app.name || "").toLowerCase();
      const phone = (app.phone || "").toLowerCase();
      const occ = (app.occupation || "").toLowerCase();
      const title = (app.listing?.title || "").toLowerCase();
      const unit = String(app.listing?.unit?.unitNumber || "").toLowerCase();
      return (
        name.includes(q) ||
        phone.includes(q) ||
        occ.includes(q) ||
        title.includes(q) ||
        unit.includes(q)
      );
    });
  }, [applications, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [selectedStatus, searchQuery]);

  const paginatedApplications = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, page, pageSize]);

  const handleOpenApprove = (app: RentalApplication) => {
    setSelectedApp(app);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setApproving(true);
    try {
      await rentalLifecycleService.approveApplication(selectedApp.id, {
        dueDay,
        graceDays,
        penaltyType,
        penaltyAmount,
        maxPenaltyCap,
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, status: "APPROVED" } : a))
      );
      setApproveModalOpen(false);
      setToast({
        show: true,
        type: "success",
        message: "Application approved and digital lease activated successfully.",
      });
      await loadApplications();
    } catch (err: any) {
      setToast({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Failed to approve application",
      });
    } finally {
      setApproving(false);
    }
  };

  const handleRequestReject = (appId: string) => {
    setRejectingAppId(appId);
  };

  const handleConfirmReject = async () => {
    if (!rejectingAppId) return;
    setIsRejecting(true);
    try {
      await rentalLifecycleService.rejectApplication(rejectingAppId);
      setApplications((prev) =>
        prev.map((a) => (a.id === rejectingAppId ? { ...a, status: "REJECTED" } : a))
      );
      setRejectingAppId(null);
      setToast({
        show: true,
        type: "success",
        message: "Rental application rejected successfully.",
      });
      await loadApplications();
    } catch (err: any) {
      setToast({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Failed to reject application",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  if (!canReadApps) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Rental Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review applicant profiles, documents, and issue digital leases.
          </p>
        </div>
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Access Restricted</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Your role does not have permission to view or approve tenant applications. Please contact your property administrator.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Rental Applications
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Active Pipeline
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Review incoming prospective tenant applications and execute lease agreements.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total In Pipeline
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.total}</p>
          <span className="text-xs text-slate-500">Across all listings</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Review
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{metrics.pending}</p>
          <span className="text-xs text-amber-600/80">Requires verification</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Approved & Leased
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{metrics.approved}</p>
          <span className="text-xs text-emerald-600/80">Active tenancy signed</span>
        </Card>

        <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rejected
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <XCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-600">{metrics.rejected}</p>
          <span className="text-xs text-rose-600/80">Archived applicants</span>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by applicant name, phone, unit or listing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All" },
            { id: "PENDING", label: "Pending" },
            { id: "APPROVED", label: "Approved" },
            { id: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedStatus === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card className="text-center py-16 p-6 border-dashed border-slate-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {searchQuery ? "No Matching Applications Found" : "No Rental Applications"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No applicants matched "${searchQuery}". Clear your search query or change status filter.`
              : "When prospective tenants submit an application from the public marketplace, they appear here."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-4 text-xs"
            >
              Clear Search
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedApplications.map((app) => (
              <Card
                key={app.id}
                hoverEffect
                className="p-5 flex flex-col justify-between bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      Unit {app.listing?.unit?.unitNumber || "N/A"}
                    </span>
                    <Badge
                      tone={
                        app.status === "APPROVED"
                          ? "green"
                          : app.status === "REJECTED"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {app.listing?.title || "Rental Listing"}
                  </h3>
                  <div className="flex items-center text-xs font-semibold text-emerald-600 mt-1">
                    <IndianRupee className="w-3 h-3 mr-0.5" />
                    <span>{formatINR(app.listing?.monthlyRent || 0)} / month</span>
                  </div>

                  {/* Applicant Details Card */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center text-slate-900 font-semibold">
                      <User className="w-3.5 h-3.5 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="truncate">{app.name}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                      <span>{app.phone}</span>
                    </div>
                    {app.occupation && (
                      <div className="flex items-center text-slate-600">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                        <span className="truncate">{app.occupation}</span>
                      </div>
                    )}
                    {app.message && (
                      <div className="flex items-start text-slate-500 italic text-[11px] pt-1.5 border-t border-slate-200">
                        <MessageSquare className="w-3 h-3 text-slate-400 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">"{app.message}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {app.status === "PENDING" ? (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestReject(app.id)}
                      className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs h-8"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenApprove(app)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Lease</span>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      Application Decision Recorded
                    </span>
                    <span className="font-semibold text-slate-600">{app.status}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <DataTablePagination
            currentPage={page}
            pageSize={pageSize}
            totalRecords={filteredApplications.length}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            pageSizeOptions={[6, 12, 24, 50]}
            apiEndpoint="GET /api/v1/rental-lifecycle/applications"
          />
        </div>
      )}

      {/* Approval & Lease Activation Modal */}
      <Modal
        open={approveModalOpen && Boolean(selectedApp)}
        onClose={() => setApproveModalOpen(false)}
        title="Approve & Activate Lease"
        subtitle={
          selectedApp
            ? `Execute lease agreement for ${selectedApp.name} (Unit ${selectedApp.listing?.unit?.unitNumber || "N/A"})`
            : undefined
        }
      >
        {selectedApp && (
          <form onSubmit={handleConfirmApprove} className="space-y-4">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
              Approving will activate an official Lease for{" "}
              <span className="font-bold text-blue-950">{selectedApp.name}</span>, lock Unit{" "}
              <span className="font-bold text-blue-950">
                {selectedApp.listing?.unit?.unitNumber}
              </span>{" "}
              as <span className="font-bold">OCCUPIED</span>, and establish rent schedule rules.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Due Day of Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={dueDay}
                  onChange={(e) => setDueDay(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
                <span className="text-[10px] text-slate-500">e.g. 5th of every month</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grace Period (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={graceDays}
                  onChange={(e) => setGraceDays(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
                <span className="text-[10px] text-slate-500">Days before penalty begins</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penalty Rule
                </label>
                <select
                  value={penaltyType}
                  onChange={(e) => setPenaltyType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                >
                  <option value="PER_DAY">Per-Day Late Fee (₹/day)</option>
                  <option value="FIXED">Fixed Late Fee (₹)</option>
                  <option value="PERCENTAGE">Percentage (% of rent)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penalty Amount (₹)
                </label>
                <input
                  type="number"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Late Fee Cap (₹)
              </label>
              <input
                type="number"
                value={maxPenaltyCap}
                onChange={(e) => setMaxPenaltyCap(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setApproveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={approving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{approving ? "Activating..." : "Confirm & Activate Lease"}</span>
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        open={Boolean(rejectingAppId)}
        title="Reject Rental Application?"
        description="Are you sure you want to reject this applicant? This action will mark the application as REJECTED."
        confirmText="Yes, Reject Application"
        tone="danger"
        isLoading={isRejecting}
        onConfirm={handleConfirmReject}
        onClose={() => setRejectingAppId(null)}
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
