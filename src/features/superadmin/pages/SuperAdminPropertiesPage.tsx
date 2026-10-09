import { useState } from "react";
import {
  Building2,
  Search,
  RefreshCw,
  Home,
  Layers,
  MapPin,
  User,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminPropertiesPage() {
  const { data: properties, loading, error, reload } = useApi(adminService.listProperties, [] as any[]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = properties.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.organization?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.owner?.mobile?.includes(search);

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Platform Properties & Units
            </h1>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/60">
              {properties.length} Total
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Platform-wide inventory oversight across all client organizations, landlords, and managed units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reload()}
            className="gap-1.5 text-slate-700 font-semibold border-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by property, city, owner, org..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 w-full sm:w-auto justify-center">
          {["ALL", "VACANT", "OCCUPIED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="text-center py-12 p-6 bg-white border border-rose-200">
          <p className="text-sm font-semibold text-rose-600">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16 p-6 bg-white border border-slate-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
            <Home className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Properties Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            No properties match your filter criteria or have been created on the platform yet.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const unitsCount = item.units ? item.units.length : 0;
            const activeLeasesCount = item.leases ? item.leases.length : 0;

            return (
              <Card
                key={item.id}
                hoverEffect
                className="p-5 flex flex-col justify-between bg-white border border-slate-200/90 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold line-clamp-1">
                      {item.organization?.name || "Independent Landlord"}
                    </span>
                    <Badge tone={item.status === "OCCUPIED" ? "purple" : "green"}>
                      {item.status}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 mr-1 shrink-0" />
                    <span>
                      {item.address}, {item.city}
                    </span>
                  </div>

                  {/* Owner info */}
                  {item.owner && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 truncate">
                          {item.owner.name || "Owner"}
                        </div>
                        <div className="text-[11px] text-slate-500">{item.owner.mobile}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>{unitsCount} Units</span>
                  </div>
                  <div className="font-bold text-slate-900">
                    ₹{item.rent?.toLocaleString()}/mo
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {activeLeasesCount} Active Leases
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
