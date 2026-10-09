import React, { useEffect, useState } from "react";
import {
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Plus,
  IndianRupee,
  Home,
  X,
  FileDown,
} from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { generateRentInvoicePdf } from "@/lib/rentInvoicePdf";
import {
  rentalLifecycleService,
  Lease,
  MaintenanceRequest,
  RentSchedule,
} from "@/services/rentalLifecycle.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/ui/DataTablePagination";

export default function MyRentalsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"RENTALS" | "MAINTENANCE">("RENTALS");

  const [rentalsPage, setRentalsPage] = useState(1);
  const [rentalsPageSize, setRentalsPageSize] = useState(3);
  const [ticketsPage, setTicketsPage] = useState(1);
  const [ticketsPageSize, setTicketsPageSize] = useState(6);

  // Payment Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<RentSchedule | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paying, setPaying] = useState(false);

  // New Maintenance Ticket Modal
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedLeaseForTicket, setSelectedLeaseForTicket] = useState<Lease | null>(null);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState("PLUMBING");
  const [ticketPriority, setTicketPriority] = useState("MEDIUM");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rentalsData, ticketsData] = await Promise.all([
        rentalLifecycleService.listMyRentals(),
        rentalLifecycleService.listMyTenantTickets(),
      ]);
      setLeases(rentalsData);
      setMaintenanceTickets(ticketsData);
    } catch (err) {
      console.error("Failed to load tenant portal data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPay = (schedule: RentSchedule) => {
    setSelectedSchedule(schedule);
    const due = schedule.amount + schedule.penaltyAmount - schedule.paidAmount;
    setPayAmount(due);
    setPayModalOpen(true);
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    setPaying(true);
    try {
      await rentalLifecycleService.payRentSchedule(selectedSchedule.id, payAmount);
      alert("Payment recorded successfully!");
      setPayModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to record payment");
    } finally {
      setPaying(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaseForTicket) return;
    setSubmittingTicket(true);
    try {
      await rentalLifecycleService.createMaintenanceTicket({
        propertyId: selectedLeaseForTicket.propertyId,
        unitId: selectedLeaseForTicket.unitId,
        title: ticketTitle,
        description: ticketDescription,
        category: ticketCategory,
        priority: ticketPriority,
      });
      alert("Maintenance request raised successfully!");
      setTicketModalOpen(false);
      setTicketTitle("");
      setTicketDescription("");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to raise maintenance request");
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Rented Properties
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View active leases, pay monthly rents, track late penalties, and raise maintenance tickets.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
          <button
            onClick={() => setActiveTab("RENTALS")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "RENTALS"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rented Units ({leases.length})
          </button>
          <button
            onClick={() => setActiveTab("MAINTENANCE")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "MAINTENANCE"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Maintenance ({maintenanceTickets.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Rentals & Schedules */}
      {activeTab === "RENTALS" && (
        <div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : leases.length === 0 ? (
            <Card className="text-center py-16 p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
                <Home className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Active Rentals</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                You do not have any active leased properties attached to your account yet. Explore available listings on the public marketplace.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {leases
                .slice((rentalsPage - 1) * rentalsPageSize, rentalsPage * rentalsPageSize)
                .map((lease) => (
                <Card
                  key={lease.id}
                  className="p-6 sm:p-7 bg-white border border-slate-200/90 shadow-xs rounded-2xl"
                >
                  {/* Top Property Info Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                          Unit {lease.unit?.unitNumber}
                        </span>
                        <Badge tone="green">Active Lease</Badge>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mt-2">
                        {lease.property?.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lease.property?.address}, {lease.property?.city}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLeaseForTicket(lease);
                          setTicketModalOpen(true);
                        }}
                        className="gap-1.5 text-xs text-amber-700 border-amber-200 hover:bg-amber-50 h-8"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-600" />
                        <span>Raise Maintenance</span>
                      </Button>
                    </div>
                  </div>

                  {/* Lease Rules Snapshot Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Monthly Rent
                      </span>
                      <div className="text-lg font-bold text-slate-900 flex items-center mt-0.5">
                        <IndianRupee className="w-4 h-4 text-emerald-600" />
                        {lease.monthlyRent.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Due Date
                      </span>
                      <div className="text-sm font-semibold text-slate-800 mt-1">
                        {lease.rentRule?.dueDay || 5}th of month
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Grace Period
                      </span>
                      <div className="text-sm font-semibold text-slate-800 mt-1">
                        {lease.rentRule?.graceDays || 3} Days
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Late Penalty Rule
                      </span>
                      <div className="text-sm font-semibold text-amber-700 mt-1">
                        ₹{lease.rentRule?.penaltyAmount || 100}/day late
                      </div>
                    </div>
                  </div>

                  {/* Rent Installments Schedules */}
                  <div className="mt-5">
                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Rent Installments & Payment Schedule
                    </h4>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Period</th>
                            <th className="py-3 px-4">Due Date</th>
                            <th className="py-3 px-4">Base Rent</th>
                            <th className="py-3 px-4">Late Penalty</th>
                            <th className="py-3 px-4">Total Due</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {lease.schedules?.map((sched) => {
                            const totalDue = sched.amount + sched.penaltyAmount - sched.paidAmount;
                            const isOverdue = sched.status === "OVERDUE";
                            const isPaid = sched.status === "PAID";

                            return (
                              <tr key={sched.id} className="hover:bg-slate-50/80">
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  {sched.period}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {new Date(sched.dueDate).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-slate-700 font-medium">
                                  ₹{sched.amount.toLocaleString()}
                                </td>
                                <td className="py-3 px-4">
                                  {sched.penaltyAmount > 0 ? (
                                    <span className="text-rose-600 font-bold flex items-center gap-1">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      +₹{sched.penaltyAmount.toLocaleString()}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">₹0</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  ₹{totalDue.toLocaleString()}
                                </td>
                                <td className="py-3 px-4">
                                  <Badge
                                    tone={
                                      isPaid
                                        ? "green"
                                        : isOverdue
                                        ? "red"
                                        : "yellow"
                                    }
                                  >
                                    {sched.status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        generateRentInvoicePdf({
                                          paymentId: sched.id,
                                          month: sched.period,
                                          propertyName: lease.property?.title || "Rental Residence",
                                          propertyAddress: lease.property?.address || lease.property?.city,
                                          unitNumber: lease.unit?.unitNumber || "Main Unit",
                                          landlordName: "Property Management",
                                          tenantName: user?.name || "Tenant",
                                          tenantPhone: user?.mobile,
                                          tenantEmail: user?.email || undefined,
                                          amount: sched.paidAmount || sched.amount,
                                          baseRent: sched.amount,
                                          lateFee: sched.penaltyAmount,
                                          status: sched.status,
                                          paidOn: sched.paidOn,
                                        });
                                      }}
                                      title="Download Official PDF Receipt"
                                      className="h-7 text-xs px-2 border-slate-200 text-slate-700 hover:bg-slate-50 gap-1"
                                    >
                                      <FileDown className="w-3 h-3 text-blue-600" />
                                      <span>PDF</span>
                                    </Button>

                                    {!isPaid && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleOpenPay(sched)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-3 shadow-xs"
                                      >
                                        Pay Now
                                      </Button>
                                    )}
                                    {isPaid && (
                                      <span className="text-emerald-600 font-semibold flex items-center gap-1 text-xs pl-1">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Paid
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              ))}

              <DataTablePagination
                currentPage={rentalsPage}
                pageSize={rentalsPageSize}
                totalRecords={leases.length}
                onPageChange={setRentalsPage}
                onPageSizeChange={(newSize) => {
                  setRentalsPageSize(newSize);
                  setRentalsPage(1);
                }}
                pageSizeOptions={[2, 3, 5, 10]}
                apiEndpoint="GET /api/v1/leases/my-rentals"
              />
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Maintenance Complaints */}
      {activeTab === "MAINTENANCE" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">My Maintenance Tickets</h3>
            {leases.length > 0 && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedLeaseForTicket(leases[0]);
                  setTicketModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs shadow-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Raise Request</span>
              </Button>
            )}
          </div>

          {maintenanceTickets.length === 0 ? (
            <Card className="text-center py-16 p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Maintenance Tickets</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Everything is working smoothly! If you experience any electrical or plumbing issues, raise a request above.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {maintenanceTickets
                  .slice((ticketsPage - 1) * ticketsPageSize, ticketsPage * ticketsPageSize)
                  .map((ticket) => (
                  <Card
                    key={ticket.id}
                    hoverEffect
                    className="p-5 bg-white border border-slate-200/90 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold">
                        {ticket.category}
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

                    <h4 className="text-base font-bold text-slate-900 mt-1">{ticket.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ticket.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                      <span>Property: {ticket.property?.title}</span>
                      <span>Priority: {ticket.priority}</span>
                    </div>
                  </Card>
                ))}
              </div>

              <DataTablePagination
                currentPage={ticketsPage}
                pageSize={ticketsPageSize}
                totalRecords={maintenanceTickets.length}
                onPageChange={setTicketsPage}
                onPageSizeChange={(newSize) => {
                  setTicketsPageSize(newSize);
                  setTicketsPage(1);
                }}
                pageSizeOptions={[4, 6, 12, 20]}
                apiEndpoint="GET /api/v1/maintenance/my"
              />
            </div>
          )}
        </div>
      )}

      {/* Pay Modal */}
      {payModalOpen && selectedSchedule && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setPayModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Record Rent Payment</h3>
            <p className="text-xs text-slate-500 mb-5">
              Installment for <span className="font-semibold text-slate-800">{selectedSchedule.period}</span>
            </p>

            <form onSubmit={handleConfirmPay} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Rent:</span>
                  <span className="font-semibold text-slate-900">₹{selectedSchedule.amount}</span>
                </div>
                {selectedSchedule.penaltyAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Late Penalty Accrued:</span>
                    <span className="font-bold">+₹{selectedSchedule.penaltyAmount}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Total Amount Due:</span>
                  <span className="text-emerald-700 text-sm">
                    ₹{selectedSchedule.amount + selectedSchedule.penaltyAmount - selectedSchedule.paidAmount}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPayModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={paying}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{paying ? "Processing..." : "Confirm Payment"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raise Maintenance Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setTicketModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Raise Maintenance Request</h3>
            <p className="text-xs text-slate-500 mb-5">
              The property manager and technician will address this issue promptly.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geyser leaking water"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="APPLIANCE">Appliance</option>
                    <option value="CARPENTRY">Carpentry</option>
                    <option value="PAINTING">Painting</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
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
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide details about the issue..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTicketModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingTicket}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{submittingTicket ? "Submitting..." : "Submit Ticket"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
