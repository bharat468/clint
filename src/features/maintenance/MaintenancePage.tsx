import { useState, useEffect, useMemo } from "react";
import {
  Wrench,
  Plus,
  ShieldAlert,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Building2,
} from "lucide-react";
import {
  rentalLifecycleService,
  MaintenanceRequest,
} from "@/services/rentalLifecycle.service";
import { propertyService } from "@/services/property.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { useAppSelector } from "@/app/hooks";
import { canAccess } from "@/lib/permissions";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { formatINR } from "@/lib/utils";
import type { Property } from "@/types";

export default function MaintenancePage() {
  const user = useAppSelector((s) => s.auth.user);
  const canReadMaintenance =
    canAccess(user, "maintenance.read") ||
    user?.role === "TENANT" ||
    Boolean(user?.isSuperAdmin);
  const canCreateTicket = canAccess(user, "maintenance.create");
  const canUpdateTicket = canAccess(user, "maintenance.update");

  const [tickets, setTickets] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequest | null>(null);
  const [newStatus, setNewStatus] = useState("RESOLVED");
  const [cost, setCost] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Create Ticket Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPropertyId, setNewPropertyId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("PLUMBING");
  const [newPriority, setNewPriority] = useState("MEDIUM");
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: "success" | "error" | "info" }>({
    show: false,
    message: "",
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    loadTickets();
    loadProperties();
  }, [selectedStatus]);

  const loadProperties = async () => {
    try {
      const data = await propertyService.list();
      setProperties(data);
      if (data.length > 0 && !newPropertyId) {
        setNewPropertyId(data[0].id);
      }
    } catch (e) {
      console.error("Failed to load properties", e);
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await rentalLifecycleService.listMaintenanceTickets(undefined, selectedStatus);
      setTickets(data);
    } catch (err) {
      console.error("Failed to load maintenance tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [selectedStatus, searchQuery]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.property?.title && t.property.title.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [tickets, searchQuery]);

  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, page, pageSize]);

  // KPI Calculations
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;
  const totalCost = tickets.reduce((acc, t) => acc + (Number(t.cost) || 0), 0);

  const handleOpenStatusModal = (ticket: MaintenanceRequest) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status === "OPEN" ? "IN_PROGRESS" : "RESOLVED");
    setCost(ticket.cost || 0);
    setNotes(ticket.notes || "");
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSaving(true);
    try {
      await rentalLifecycleService.updateMaintenanceStatus(
        selectedTicket.id,
        newStatus,
        cost,
        notes
      );
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, status: newStatus as any, cost, notes }
            : t
        )
      );
      showToast(`Ticket #${selectedTicket.id.slice(-6).toUpperCase()} updated to ${newStatus}`, "success");
      setStatusModalOpen(false);
      await loadTickets();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update ticket", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropertyId || !newTitle.trim()) {
      showToast("Please select a property and enter a descriptive title", "error");
      return;
    }
    setCreatingTicket(true);
    try {
      const created = await rentalLifecycleService.createMaintenanceTicket({
        propertyId: newPropertyId,
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        priority: newPriority,
      });
      if (created) {
        setTickets((prev) => [created, ...prev]);
      }
      showToast("Maintenance ticket raised successfully!", "success");
      setCreateModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      await loadTickets();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to create ticket", "error");
    } finally {
      setCreatingTicket(false);
    }
  };

  if (!canReadMaintenance) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Maintenance & Complaints
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Log repair tickets, track maintenance costs, and resolve complaints.
          </p>
        </div>
        <Card className="p-8 text-center max-w-lg mx-auto bg-white border border-slate-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 border border-rose-100">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
          <p className="mt-2 text-xs text-slate-500">
            You do not have permission to view maintenance tickets. Please contact your property administrator.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "" })}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Maintenance & Repairs
            </h1>
            <Badge tone="blue" className="gap-1 py-0.5 text-xs font-semibold">
              <Wrench className="h-3 w-3" />
              <span>Operations</span>
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Log tenant repair tickets, dispatch technician staff, and monitor property maintenance expenses.
          </p>
        </div>

        {canCreateTicket && (
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Raise Ticket</span>
          </Button>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total */}
        <Card hoverEffect className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Logged
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900">{tickets.length} Tickets</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Across all registered units</p>
          </div>
        </Card>

        {/* Metric 2: Open */}
        <Card hoverEffect className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Open Pending
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-amber-600">{openCount} Unassigned</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Awaiting technician assignment</p>
          </div>
        </Card>

        {/* Metric 3: In Progress */}
        <Card hoverEffect className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              In Progress
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-sky-600">{inProgressCount} Active</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Technicians on site</p>
          </div>
        </Card>

        {/* Metric 4: Resolved & Expenses */}
        <Card hoverEffect className="p-4 border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Incurred Cost
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900">{formatINR(totalCost)}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {resolvedCount} repairs cleared
            </p>
          </div>
        </Card>
      </div>

      {/* Search and Status Filter Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search complaints by title, category, property, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedStatus === st
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st === "ALL" ? "All" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tickets List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="text-center py-16 p-6 bg-white border border-slate-200 rounded-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
            <Wrench className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Maintenance Tickets</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "No tickets match your search query."
              : "All maintenance complaints are currently cleared! Click 'Raise Ticket' above to log a new repair issue."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {paginatedTickets.map((ticket) => (
            <Card
              key={ticket.id}
              hoverEffect
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 shadow-xs rounded-2xl"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                    #{ticket.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                    {ticket.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.priority === "URGENT" || ticket.priority === "HIGH"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    Priority: {ticket.priority}
                  </span>
                  <Badge
                    tone={
                      ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                        ? "green"
                        : ticket.status === "IN_PROGRESS"
                        ? "blue"
                        : "yellow"
                    }
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900 pt-0.5">{ticket.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ticket.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      Property: <strong className="text-slate-700">{ticket.property?.title || "Direct Residence"}</strong>
                    </span>
                  </span>
                  {ticket.unit && (
                    <span>
                      Unit: <strong className="text-slate-700">{ticket.unit.unitNumber}</strong>
                    </span>
                  )}
                  {ticket.cost > 0 && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>Cost: {formatINR(ticket.cost)}</span>
                    </span>
                  )}
                  {ticket.notes && (
                    <span className="text-slate-400 italic text-[11px]">
                      "{ticket.notes}"
                    </span>
                  )}
                </div>
              </div>

              {canUpdateTicket && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenStatusModal(ticket)}
                    className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 shadow-2xs"
                  >
                    <span>Update Status & Cost</span>
                  </Button>
                </div>
              )}
            </Card>
          ))}

          <DataTablePagination
            currentPage={page}
            pageSize={pageSize}
            totalRecords={filteredTickets.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            apiEndpoint="GET /api/v1/maintenance"
            className="rounded-2xl border border-slate-200 bg-white mt-4"
          />
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      <Modal
        open={createModalOpen}
        title="Raise Maintenance Ticket"
        subtitle="Log a repair or maintenance issue for any managed property"
        onClose={() => setCreateModalOpen(false)}
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Property <span className="text-rose-500">*</span>
            </label>
            <select
              value={newPropertyId}
              onChange={(e) => setNewPropertyId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
              required
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden"
              >
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="APPLIANCE">Appliance</option>
                <option value="CARPENTRY">Carpentry</option>
                <option value="HVAC">HVAC / Air Conditioning</option>
                <option value="OTHER">Other Repair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (Emergency)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Master Bedroom Water Tap Leakage"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Issue Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide specific details about the problem, symptoms, or location..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={creatingTicket}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {creatingTicket ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* UPDATE STATUS MODAL */}
      <Modal
        open={statusModalOpen}
        title="Update Ticket Status & Expenses"
        subtitle={`Ticket #${selectedTicket?.id?.slice(-6).toUpperCase()} — ${selectedTicket?.title || ""}`}
        onClose={() => setStatusModalOpen(false)}
      >
        <form onSubmit={handleSaveStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Status Progression
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden"
            >
              <option value="OPEN">OPEN (Pending Technician)</option>
              <option value="IN_PROGRESS">IN PROGRESS (Work Underway)</option>
              <option value="RESOLVED">RESOLVED (Repairs Completed)</option>
              <option value="CLOSED">CLOSED (Archived)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Repair & Material Cost (₹)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Logged repair expenses will reflect in property profit & loss summaries.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Technician Notes / Resolution Summary
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Replaced ball valve in bathroom pipeline. Leak sealed."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {saving ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
