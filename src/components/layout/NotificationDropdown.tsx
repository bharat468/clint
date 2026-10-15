import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  AlertTriangle,
  Clock,
  Wrench,
  FileText,
  CheckCircle2,
  Check,
  ChevronRight,
} from "lucide-react";
import { paymentService } from "@/services/payment.service";
import { rentalLifecycleService } from "@/services/rentalLifecycle.service";
import { formatINR } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type: "LEASE_EXPIRY" | "PAYMENT_DUE" | "MAINTENANCE" | "APPLICATION";
  title: string;
  message: string;
  timeAgo: string;
  link: string;
  read: boolean;
  priority: "high" | "medium" | "low";
}

const READ_STORAGE_KEY = "rentmate_read_notifications";

export function NotificationDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterTab, setFilterTab] = useState<"ALL" | "ALERTS" | "MAINTENANCE">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const readIds = new Set<string>(JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || "[]"));
      const items: NotificationItem[] = [];

      // 1. Fetch expiring leases
      try {
        const expiring = await rentalLifecycleService.getExpiringLeases();
        expiring.forEach((l) => {
          const id = `lease-exp-${l.id}`;
          const days = l.daysRemaining;
          items.push({
            id,
            type: "LEASE_EXPIRY",
            title: days <= 0 ? "Lease Expired" : "Lease Expiring Soon",
            message: `${l.tenant?.name || "Tenant"} • Unit ${l.unit?.unitNumber || "101"} (${
              days <= 0 ? `Ended ${Math.abs(days)}d ago` : `in ${days} days`
            })`,
            timeAgo: "Active",
            link: "/dashboard",
            read: readIds.has(id),
            priority: days <= 7 ? "high" : "medium",
          });
        });
      } catch {
        // Fallback
      }

      // 2. Fetch overdue and pending payments
      try {
        const payments = await paymentService.list();
        const pendingOrOverdue = (payments || []).filter(
          (p) => p && (p.status === "OVERDUE" || p.status === "PENDING")
        );
        pendingOrOverdue.slice(0, 4).forEach((p) => {
          const id = `pmt-${p.id}`;
          items.push({
            id,
            type: "PAYMENT_DUE",
            title: p.status === "OVERDUE" ? "Rent Payment Overdue" : "Pending Rent Invoice",
            message: `${formatINR(p.amount)} due for ${p.month}`,
            timeAgo: p.month,
            link: "/payments",
            read: readIds.has(id),
            priority: p.status === "OVERDUE" ? "high" : "medium",
          });
        });
      } catch {
        // Fallback
      }

      // 3. Fetch open maintenance tickets
      try {
        const tickets = await rentalLifecycleService.listMaintenanceTickets();
        const openTickets = (tickets || []).filter(
          (t) => t && (t.status === "OPEN" || t.status === "IN_PROGRESS")
        );
        openTickets.slice(0, 3).forEach((t) => {
          const id = `maint-${t.id}`;
          items.push({
            id,
            type: "MAINTENANCE",
            title: `Maintenance: ${t.title}`,
            message: `${t.category} request (${t.priority} priority)`,
            timeAgo: "Open",
            link: "/maintenance",
            read: readIds.has(id),
            priority: t.priority === "URGENT" || t.priority === "HIGH" ? "high" : "medium",
          });
        });
      } catch {
        // Fallback
      }

      // 4. Fetch pending applications
      try {
        const apps = await rentalLifecycleService.listOwnerApplications("PENDING");
        (apps || []).slice(0, 2).forEach((a) => {
          const id = `app-${a.id}`;
          items.push({
            id,
            type: "APPLICATION",
            title: "New Rental Application",
            message: `${a.name} submitted an application`,
            timeAgo: "Pending",
            link: "/applications",
            read: readIds.has(id),
            priority: "low",
          });
        });
      } catch {
        // Fallback
      }

      setNotifications(items);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(allIds));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = (item: NotificationItem) => {
    // Mark as read
    const readIds: string[] = JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || "[]");
    if (!readIds.includes(item.id)) {
      readIds.push(item.id);
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(readIds));
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setOpen(false);
    navigate(item.link);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === "ALERTS") return n.type === "LEASE_EXPIRY" || n.type === "PAYMENT_DUE";
    if (filterTab === "MAINTENANCE") return n.type === "MAINTENANCE";
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) loadNotifications();
        }}
        aria-label="Notifications"
        aria-expanded={open}
        className={`relative rounded-xl p-2 transition-colors ${
          open
            ? "bg-blue-50 text-blue-600"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        }`}
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-bold border border-blue-200">
                  {unreadCount} new
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[11px] font-medium">
                  0 unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-100 text-xs">
            {(["ALL", "ALERTS", "MAINTENANCE"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`flex-1 py-1 px-2 rounded-lg font-semibold transition ${
                  filterTab === tab
                    ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === "ALL" ? `All (${notifications.length})` : tab === "ALERTS" ? "Alerts" : "Maintenance"}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1.5">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                <div className="font-semibold text-slate-700">All caught up!</div>
                <p className="text-slate-400">No active alerts or notifications right now.</p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const getIcon = () => {
                  switch (item.type) {
                    case "LEASE_EXPIRY":
                      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
                    case "PAYMENT_DUE":
                      return <Clock className="h-4 w-4 text-blue-600" />;
                    case "MAINTENANCE":
                      return <Wrench className="h-4 w-4 text-cyan-600" />;
                    case "APPLICATION":
                      return <FileText className="h-4 w-4 text-emerald-600" />;
                  }
                };

                const getBg = () => {
                  switch (item.type) {
                    case "LEASE_EXPIRY":
                      return "bg-amber-50";
                    case "PAYMENT_DUE":
                      return "bg-blue-50";
                    case "MAINTENANCE":
                      return "bg-cyan-50";
                    case "APPLICATION":
                      return "bg-emerald-50";
                  }
                };

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3 flex items-start gap-3 cursor-pointer transition hover:bg-slate-50 ${
                      !item.read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-xl ${getBg()} flex items-center justify-center shrink-0 mt-0.5 border border-slate-100`}
                    >
                      {getIcon()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs truncate ${
                            !item.read ? "font-bold text-slate-900" : "font-medium text-slate-700"
                          }`}
                        >
                          {item.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">{item.timeAgo}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.message}</p>
                    </div>

                    {!item.read ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/dashboard");
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View Dashboard Overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
