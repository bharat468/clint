import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Building2,
  Users,
  CreditCard,
  FileText,
  Wrench,
  LayoutDashboard,
  Shield,
  ArrowRight,
  X,
} from "lucide-react";
import { propertyService } from "@/services/property.service";
import { tenantService } from "@/services/tenant.service";
import { paymentService } from "@/services/payment.service";
import { formatINR } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import type { Property, Tenant, Payment } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const QUICK_LINKS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, category: "Navigation" },
  { label: "Properties & Buildings", to: "/properties", icon: Building2, category: "Navigation" },
  { label: "Tenants Portfolio", to: "/tenants", icon: Users, category: "Navigation" },
  { label: "Rent Payments & Receipts", to: "/payments", icon: CreditCard, category: "Navigation" },
  { label: "Rental Applications", to: "/applications", icon: FileText, category: "Navigation" },
  { label: "Maintenance Tickets", to: "/maintenance", icon: Wrench, category: "Navigation" },
  { label: "Team & Staff Settings", to: "/settings/team", icon: Users, category: "Settings" },
  { label: "Roles & Permissions", to: "/settings/roles", icon: Shield, category: "Settings" },
  { label: "Organization & SaaS Plan", to: "/settings/organization", icon: Building2, category: "Settings" },
];

export default function GlobalSearchModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  // Focus search input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      // Fetch data for search indexing
      setLoading(true);
      Promise.allSettled([
        propertyService.list(),
        tenantService.list(),
        paymentService.list(),
      ]).then(([propsRes, tenantsRes, paymentsRes]) => {
        if (propsRes.status === "fulfilled" && Array.isArray(propsRes.value)) {
          setProperties(propsRes.value);
        }
        if (tenantsRes.status === "fulfilled" && Array.isArray(tenantsRes.value)) {
          setTenants(tenantsRes.value);
        }
        if (paymentsRes.status === "fulfilled" && Array.isArray(paymentsRes.value)) {
          setPayments(paymentsRes.value);
        }
        setLoading(false);
      });
    }
  }, [open]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const q = query.trim().toLowerCase();

  // Filtered Results
  const matchingLinks = useMemo(() => {
    if (!q) return QUICK_LINKS.slice(0, 5);
    return QUICK_LINKS.filter((item) => item.label.toLowerCase().includes(q));
  }, [q]);

  const matchingProperties = useMemo(() => {
    if (!q) return properties.slice(0, 4);
    return properties
      .filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [properties, q]);

  const matchingTenants = useMemo(() => {
    if (!q) return tenants.slice(0, 4);
    return tenants
      .filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.phone?.includes(q) ||
          t.email?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [tenants, q]);

  const matchingPayments = useMemo(() => {
    if (!q) return payments.slice(0, 3);
    return payments
      .filter(
        (p) =>
          p.month?.toLowerCase().includes(q) ||
          p.status?.toLowerCase().includes(q) ||
          String(p.amount).includes(q)
      )
      .slice(0, 4);
  }, [payments, q]);

  const hasAnyResults =
    matchingLinks.length > 0 ||
    matchingProperties.length > 0 ||
    matchingTenants.length > 0 ||
    matchingPayments.length > 0;

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xs p-4 pt-16 sm:pt-24 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 px-4 py-3 bg-slate-50/50">
          <Search className="h-5 w-5 text-blue-600 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search properties, tenants, payments, settings..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg mr-2"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-200 mr-2">
              ESC to exit
            </kbd>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Spinner size="sm" className="text-blue-600" />
              <span>Indexing portfolio records...</span>
            </div>
          )}

          {!hasAnyResults && !loading && (
            <div className="py-12 text-center text-slate-400">
              <Search className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching results found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by building title, tenant phone, or amount</p>
            </div>
          )}

          {/* Group 1: Navigation Shortcuts */}
          {matchingLinks.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                Pages & Navigation
              </p>
              <div className="space-y-0.5">
                {matchingLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.to}
                      onClick={() => handleSelect(link.to)}
                      className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span>{link.label}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 2: Properties */}
          {matchingProperties.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                Properties ({matchingProperties.length})
              </p>
              <div className="space-y-0.5">
                {matchingProperties.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect("/properties")}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="truncate min-w-0">
                        <span className="font-bold text-slate-900 group-hover:text-blue-700 block truncate">
                          {p.title}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {p.city} • {p.bedrooms} BHK • {p.address}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="font-bold text-slate-900 block">{formatINR(p.rent)}/mo</span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {p.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Tenants */}
          {matchingTenants.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                Tenants ({matchingTenants.length})
              </p>
              <div className="space-y-0.5">
                {matchingTenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect("/tenants")}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <div className="truncate min-w-0">
                        <span className="font-bold text-slate-900 group-hover:text-cyan-700 block truncate">
                          {t.name}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block">
                          Phone: {t.phone} {t.email ? `• ${t.email}` : ""}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded shrink-0 ml-3">
                      Tenant Record
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group 4: Payments */}
          {matchingPayments.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                Payments & Dues ({matchingPayments.length})
              </p>
              <div className="space-y-0.5">
                {matchingPayments.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect("/payments")}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <CreditCard className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 group-hover:text-emerald-700 block">
                          Billing Month: {p.month}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Status: {p.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{formatINR(p.amount)}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          p.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Tip */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tip: Press <strong>ESC</strong> to dismiss, or click any item to navigate immediately.</span>
          <span className="font-semibold text-slate-500">RentMate Smart Search</span>
        </div>
      </div>
    </div>
  );
}
