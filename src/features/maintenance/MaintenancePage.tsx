import React, { useState, useEffect } from "react";
import {
  Wrench,
  X,
  IndianRupee,
  Plus,
  ShieldAlert,
} from "lucide-react";
import {
  rentalLifecycleService,
  MaintenanceRequest,
} from "@/services/rentalLifecycle.service";
import { propertyService } from "@/services/property.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/app/hooks";
import { canAccess } from "@/lib/permissions";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import type { Property } from "@/types";

export default function MaintenancePage() {
  const user = useAppSelector((s) => s.auth.user);
  const canReadMaintenance = canAccess(user, "maintenance.read") || user?.role === "TENANT" || Boolean(user?.isSuperAdmin);
  const canCreateTicket = canAccess(user, "maintenance.create");
  const canUpdateTicket = canAccess(user, "maintenance.update");

  const [tickets, setTickets] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
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
  }, [selectedStatus]);

  const paginatedTickets = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return tickets.slice(start, start + pageSize);
  }, [tickets, page, pageSize]);

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
      setStatusModalOpen(false);
      await loadTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update ticket");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropertyId || !newTitle) {
      alert("Please select a property and enter a title");
      return;
    }
    setCreatingTicket(true);
    try {
      const created = await rentalLifecycleService.createMaintenanceTicket({
        propertyId: newPropertyId,
        title: newTitle,
        description: newDescription,
        category: newCategory,
        priority: newPriority,
      });
      if (created) {
        setTickets((prev) => [created, ...prev]);
      }
      setCreateModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      await loadTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create ticket");
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
            Track tenant reported plumbing, electrical, and repair tickets across all your units.
          </p>
        </div>
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Access Restricted</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Your role does not have permission (<code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">maintenance.read</code>) to view maintenance tickets. Please contact your property administrator.
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
            Maintenance & Complaints
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track tenant reported plumbing, electrical, and repair tickets across all your units.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
            {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => (
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

          {canCreateTicket && (
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Ticket</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card className="text-center py-16 p-6 bg-white border border-slate-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
            <Wrench className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Maintenance Tickets</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            All maintenance complaints are currently cleared! Click "Raise Ticket" above if you need to log a new repair issue.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedTickets.map((ticket) => (
            <Card
              key={ticket.id}
              hoverEffect
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 shadow-xs"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                    {ticket.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.priority === "URGENT" || ticket.priority === "HIGH"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-100 text-slate-600"
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
                    {ticket.status}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900">{ticket.title}</h3>
                <p className="text-xs text-slate-600">{ticket.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Property: <strong className="text-slate-700">{ticket.property?.title}</strong></span>
                  {ticket.unit && <span>Unit: <strong className="text-slate-700">{ticket.unit.unitNumber}</strong></span>}
                  {ticket.cost > 0 && (
                    <span className="text-emerald-700 font-semibold flex items-center">
                      <IndianRupee className="w-3.5 h-3.5" />
                      Cost: ₹{ticket.cost}
                    </span>
                  )}
                </div>
              </div>

              {canUpdateTicket && (
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleOpenStatusModal(ticket)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 shadow-xs font-semibold"
                  >
                    Update Status / Cost
                  </Button>
                </div>
              )}
            </Card>
          ))}

          <DataTablePagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={tickets.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            apiEndpoint="GET /api/v1/maintenance"
            className="rounded-2xl border border-slate-200 bg-white mt-4"
          />
        </div>
      )}

      {/* Create Ticket Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Raise Maintenance Ticket</h3>
            <p className="text-xs text-slate-500 mb-4">
              Log a repair or maintenance issue for any managed property.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Property *
                </label>
                <select
                  value={newPropertyId}
                  onChange={(e) => setNewPropertyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="CARPENTRY">Carpentry</option>
                    <option value="APPLIANCE">Appliance</option>
                    <option value="PAINTING">Painting</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water leakage in washroom"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide more details about the problem..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingTicket}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {creatingTicket ? "Saving..." : "Create Ticket"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Update Ticket Status</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedTicket.title}</p>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ticket Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution Cost (₹)
                </label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technician / Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Details about repairs or replaced parts..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStatusModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {saving ? "Saving..." : "Save Progress"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
