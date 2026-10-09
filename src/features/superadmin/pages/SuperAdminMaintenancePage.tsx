import { useState, useEffect } from "react";
import {
  Wrench,
  Search,
  RefreshCw,
  Building2,
  IndianRupee,
  User,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/ui/DataTablePagination";

export default function SuperAdminMaintenancePage() {
  const { data: tickets, loading, error, reload } = useApi(adminService.listMaintenance, [] as any[]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.property?.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.tenant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase());

    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  useEffect(() => {
    setPage(1);
  }, [search, priorityFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Wrench className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Platform Maintenance Complaints
            </h1>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/60">
              {tickets.length} Total Tickets
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Inspect platform repair tickets, complaints urgency, resolution statuses, and incurred maintenance costs.
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
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, properties, tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  priorityFilter === p
                    ? "bg-white text-blue-600 shadow-xs border border-slate-200 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  statusFilter === s
                    ? "bg-white text-blue-600 shadow-xs border border-slate-200 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="text-center py-12 p-6 bg-white border border-rose-200">
          <p className="text-sm font-semibold text-rose-600">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16 p-6 bg-white border border-slate-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
            <Wrench className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Maintenance Tickets Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            All maintenance requests are either cleared or do not match your filter parameters.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((item) => (
            <Card
              key={item.id}
              hoverEffect
              className="p-5 flex flex-col justify-between bg-white border border-slate-200/90 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.priority === "URGENT" || item.priority === "HIGH"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.priority}
                    </span>
                    <Badge
                      tone={
                        item.status === "RESOLVED" || item.status === "CLOSED"
                          ? "green"
                          : item.status === "IN_PROGRESS"
                          ? "blue"
                          : "yellow"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.description}</p>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-900 truncate">
                      {item.property?.title}
                    </span>
                    {item.unit && <span className="text-slate-500">(Unit {item.unit.unitNumber})</span>}
                  </div>
                  {item.tenant && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                      <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{item.tenant.name} ({item.tenant.mobile})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Incurred Cost</span>
                <span className="font-extrabold text-slate-900 flex items-center text-sm">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  {item.cost?.toLocaleString() || 0}
                </span>
              </div>
            </Card>
          ))}
          </div>

          <DataTablePagination
            currentPage={page}
            pageSize={pageSize}
            totalRecords={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            pageSizeOptions={[6, 9, 18, 36]}
            apiEndpoint="GET /api/v1/admin/maintenance"
          />
        </div>
      )}
    </div>
  );
}
