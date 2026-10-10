import React, { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  User,
  Phone,
  Building2,
  X,
  ShieldAlert,
} from "lucide-react";
import {
  rentalLifecycleService,
  RentalApplication,
} from "@/services/rentalLifecycle.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/app/hooks";
import { canAccess } from "@/lib/permissions";
import { DataTablePagination } from "@/components/ui/DataTablePagination";

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

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

  useEffect(() => {
    setPage(1);
  }, [selectedStatus]);

  const paginatedApplications = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return applications.slice(start, start + pageSize);
  }, [applications, page, pageSize]);

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
      await loadApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to approve application");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (appId: string) => {
    if (!window.confirm("Are you sure you want to reject this rental application?")) return;
    try {
      await rentalLifecycleService.rejectApplication(appId);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "REJECTED" } : a))
      );
      await loadApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to reject application");
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Rental Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review applicant profiles from the marketplace and activate digital leases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedStatus === st
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card className="text-center py-16 p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Rental Applications</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            When tenants apply for your published listings, their applications will show up here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedApplications.map((app) => (
            <Card
              key={app.id}
              hoverEffect
              className="p-5 flex flex-col justify-between bg-white border border-slate-200/80 shadow-xs"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Unit {app.listing?.unit?.unitNumber}
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

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {app.listing?.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rent: ₹{app.listing?.monthlyRent?.toLocaleString()}/month
                </p>

                {/* Applicant Card */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center text-slate-800 font-semibold">
                    <User className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                    {app.name}
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                    {app.phone}
                  </div>
                  {app.occupation && (
                    <div className="text-slate-600 pl-5">
                      Occupation: {app.occupation}
                    </div>
                  )}
                  {app.message && (
                    <div className="text-slate-500 italic text-[11px] pt-1.5 border-t border-slate-200">
                      "{app.message}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {app.status === "PENDING" && (
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(app.id)}
                    className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs h-8"
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenApprove(app)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Lease</span>
                  </Button>
                </div>
              )}
            </Card>
          ))}
          </div>

          <DataTablePagination
            currentPage={page}
            pageSize={pageSize}
            totalRecords={applications.length}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            pageSizeOptions={[6, 12, 24, 50]}
            apiEndpoint="GET /api/v1/applications"
          />
        </div>
      )}

      {/* Approval Modal */}
      {approveModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl relative">
            <button
              onClick={() => setApproveModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Approve & Activate Lease
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Approving will activate a Lease for <span className="font-semibold text-slate-800">{selectedApp.name}</span>, lock the unit as OCCUPIED, and snapshot rent rules.
            </p>

            <form onSubmit={handleConfirmApprove} className="space-y-4">
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setApproveModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={approving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{approving ? "Activating..." : "Confirm & Activate Lease"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
