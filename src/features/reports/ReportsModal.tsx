import { useState, useEffect, useMemo } from "react";
import {
  FileSpreadsheet,
  FileDown,
  Calendar,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import {
  reportsService,
  type MonthlyCollectionReportResponse,
  type DefaulterReportResponse,
  type PropertyPnlReportResponse,
} from "@/services/reports.service";
import { exportToCsv } from "@/lib/csvExport";
import {
  generateMonthlyCollectionsPdf,
  generateDefaultersPdf,
  generatePropertyPnlPdf,
} from "@/lib/reportPdfGenerator";
import { shareDefaulterOnWhatsApp } from "@/lib/whatsapp";
import { formatINR } from "@/lib/utils";

interface ReportsModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "collections" | "defaulters" | "pnl";
}

export function ReportsModal({
  open,
  onClose,
  defaultTab = "collections",
}: ReportsModalProps) {
  const [activeTab, setActiveTab] = useState<"collections" | "defaulters" | "pnl">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [search, setSearch] = useState("");

  const [collectionsData, setCollectionsData] = useState<MonthlyCollectionReportResponse | null>(null);
  const [defaultersData, setDefaultersData] = useState<DefaulterReportResponse | null>(null);
  const [pnlData, setPnlData] = useState<PropertyPnlReportResponse | null>(null);

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      loadActiveReport(defaultTab);
    }
  }, [open, defaultTab]);

  const loadActiveReport = async (tab = activeTab) => {
    setLoading(true);
    try {
      if (tab === "collections") {
        const res = await reportsService.getMonthlyCollections({
          month: selectedMonth === "ALL" ? undefined : selectedMonth,
        });
        setCollectionsData(res);
      } else if (tab === "defaulters") {
        const res = await reportsService.getDefaulters();
        setDefaultersData(res);
      } else if (tab === "pnl") {
        const res = await reportsService.getPropertyPnl();
        setPnlData(res);
      }
    } catch (err) {
      console.error("Failed to load report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && activeTab === "collections") {
      loadActiveReport("collections");
    }
  }, [selectedMonth]);

  const monthOptions = useMemo(() => {
    const list = [{ value: "ALL", label: "All Recorded Months" }];
    const now = new Date();
    for (let i = -6; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      list.push({ value: val, label });
    }
    return list;
  }, []);

  // 1. One-Click CSV Export Handlers
  const handleExportCsv = () => {
    if (activeTab === "collections" && collectionsData) {
      const headers = [
        "Receipt No",
        "Month",
        "Tenant Name",
        "Phone",
        "Email",
        "Property",
        "City",
        "Amount (INR)",
        "Status",
        "Paid Date",
      ];
      const rows = collectionsData.items.map((it) => [
        it.receiptNo,
        it.month,
        it.tenantName,
        it.tenantPhone,
        it.tenantEmail,
        it.propertyTitle,
        it.propertyCity,
        it.amount,
        it.status,
        it.paidOn ? new Date(it.paidOn).toLocaleDateString("en-IN") : "Pending",
      ]);
      exportToCsv(`RentMate-Collections-${selectedMonth}`, headers, rows);
    } else if (activeTab === "defaulters" && defaultersData) {
      const headers = [
        "Tenant Name",
        "Phone",
        "Email",
        "Property",
        "Unit",
        "Month",
        "Due Date",
        "Days Overdue",
        "Base Due (INR)",
        "Penalty Accrued (INR)",
        "Total Outstanding (INR)",
        "Status",
      ];
      const rows = defaultersData.items.map((it) => [
        it.tenantName,
        it.tenantPhone,
        it.tenantEmail,
        it.propertyTitle,
        it.unitNumber,
        it.month,
        it.dueDate,
        it.daysOverdue,
        it.baseAmount,
        it.penaltyAmount,
        it.totalOutstanding,
        it.status,
      ]);
      exportToCsv(
        `RentMate-Defaulters-Ledger-${new Date().toISOString().slice(0, 10)}`,
        headers,
        rows
      );
    } else if (activeTab === "pnl" && pnlData) {
      const headers = [
        "Property Asset",
        "Address",
        "City",
        "Status",
        "Total Units",
        "Occupied",
        "Vacant",
        "Gross Income (INR)",
        "Pending Receivables (INR)",
        "Maintenance Expenses (INR)",
        "Net Operating Profit (INR)",
        "Operating Margin (%)",
        "Tickets Total",
        "Resolved Tickets",
      ];
      const rows = pnlData.items.map((it) => [
        it.propertyTitle,
        it.address,
        it.city,
        it.status,
        it.totalUnits,
        it.occupiedUnits,
        it.vacantUnits,
        it.grossIncome,
        it.pendingReceivables,
        it.totalExpenses,
        it.netProfit,
        `${it.profitMargin}%`,
        it.maintenanceTicketsCount,
        it.resolvedTicketsCount,
      ]);
      exportToCsv(
        `RentMate-Property-PnL-${new Date().toISOString().slice(0, 10)}`,
        headers,
        rows
      );
    }
  };

  // 2. One-Click PDF Export Handlers
  const handleExportPdf = () => {
    if (activeTab === "collections" && collectionsData) {
      generateMonthlyCollectionsPdf(collectionsData);
    } else if (activeTab === "defaulters" && defaultersData) {
      generateDefaultersPdf(defaultersData);
    } else if (activeTab === "pnl" && pnlData) {
      generatePropertyPnlPdf(pnlData);
    }
  };

  // Filtered collections items
  const filteredCollections = useMemo(() => {
    if (!collectionsData) return [];
    if (!search.trim()) return collectionsData.items;
    const q = search.toLowerCase();
    return collectionsData.items.filter(
      (it) =>
        it.tenantName.toLowerCase().includes(q) ||
        it.propertyTitle.toLowerCase().includes(q) ||
        it.receiptNo.toLowerCase().includes(q) ||
        it.tenantPhone.includes(q)
    );
  }, [collectionsData, search]);

  // Filtered defaulters items
  const filteredDefaulters = useMemo(() => {
    if (!defaultersData) return [];
    if (!search.trim()) return defaultersData.items;
    const q = search.toLowerCase();
    return defaultersData.items.filter(
      (it) =>
        it.tenantName.toLowerCase().includes(q) ||
        it.propertyTitle.toLowerCase().includes(q) ||
        it.tenantPhone.includes(q)
    );
  }, [defaultersData, search]);

  // Filtered PnL items
  const filteredPnl = useMemo(() => {
    if (!pnlData) return [];
    if (!search.trim()) return pnlData.items;
    const q = search.toLowerCase();
    return pnlData.items.filter(
      (it) =>
        it.propertyTitle.toLowerCase().includes(q) ||
        it.city.toLowerCase().includes(q) ||
        it.address.toLowerCase().includes(q)
    );
  }, [pnlData, search]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Financial & Operational Reports (BRD Sec 25)"
      subtitle="Real-time audit statements, ledger analytics, and 1-click export to official CSV & PDF."
      maxWidth="max-w-5xl"
    >
      <div className="space-y-5">
        {/* Top Report Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("collections");
                loadActiveReport("collections");
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "collections"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Monthly Rent Collections</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("defaulters");
                loadActiveReport("defaulters");
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "defaulters"
                  ? "bg-white text-rose-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Pending Defaulters List</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("pnl");
                loadActiveReport("pnl");
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "pnl"
                  ? "bg-white text-emerald-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Property Profit & Loss</span>
            </button>
          </div>

          {/* Quick 1-Click Export Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={loading}
              className="gap-2 text-slate-700 font-semibold border-slate-300 hover:bg-slate-50"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export CSV</span>
            </Button>

            <Button
              size="sm"
              onClick={handleExportPdf}
              disabled={loading}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              <FileDown className="h-4 w-4" />
              <span>Export PDF</span>
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === "collections" && (
              <div className="w-56">
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  options={monthOptions}
                />
              </div>
            )}

            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tenant or property..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadActiveReport()}
            disabled={loading}
            className="text-xs text-slate-500 hover:text-slate-800 gap-1.5"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* TAB 1: MONTHLY RENT COLLECTIONS */}
        {activeTab === "collections" && (
          <div className="space-y-4">
            {/* KPI Summary Strip */}
            {collectionsData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-3.5 bg-emerald-50/50 border-emerald-100">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    Total Collected
                  </span>
                  <div className="text-xl font-bold text-emerald-800 mt-1">
                    {formatINR(collectionsData.summary.totalCollected)}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {collectionsData.summary.paidCount} payments received
                  </span>
                </Card>

                <Card className="p-3.5 bg-amber-50/50 border-amber-100">
                  <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                    Pending / Due
                  </span>
                  <div className="text-xl font-bold text-amber-800 mt-1">
                    {formatINR(collectionsData.summary.totalPending)}
                  </div>
                  <span className="text-[11px] text-amber-600 font-medium">
                    {collectionsData.summary.pendingCount} awaiting payment
                  </span>
                </Card>

                <Card className="p-3.5 bg-rose-50/50 border-rose-100">
                  <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                    Overdue
                  </span>
                  <div className="text-xl font-bold text-rose-800 mt-1">
                    {formatINR(collectionsData.summary.totalOverdue)}
                  </div>
                  <span className="text-[11px] text-rose-600 font-medium">
                    {collectionsData.summary.overdueCount} overdue dues
                  </span>
                </Card>

                <Card className="p-3.5 bg-blue-50/50 border-blue-100">
                  <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                    Collection Rate
                  </span>
                  <div className="text-xl font-bold text-blue-800 mt-1">
                    {collectionsData.summary.collectionRate}%
                  </div>
                  <span className="text-[11px] text-blue-600 font-medium">
                    Of {formatINR(collectionsData.summary.totalExpected)} expected
                  </span>
                </Card>
              </div>
            )}

            {/* Collections Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Receipt #</th>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Tenant</th>
                    <th className="py-2.5 px-3">Property</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredCollections.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        {loading ? "Generating report..." : "No collection records found for this period."}
                      </td>
                    </tr>
                  ) : (
                    filteredCollections.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                          {item.receiptNo}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-600">{item.month}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900">{item.tenantName}</p>
                          <p className="text-[11px] text-slate-400">{item.tenantPhone}</p>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <p className="font-medium text-slate-900">{item.propertyTitle}</p>
                          <p className="text-[11px] text-slate-400">{item.propertyCity}</p>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatINR(item.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge
                            tone={
                              item.status === "PAID"
                                ? "green"
                                : item.status === "PENDING"
                                ? "yellow"
                                : "red"
                            }
                            dot
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {item.paidOn
                            ? new Date(item.paidOn).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PENDING DEFAULTERS LIST */}
        {activeTab === "defaulters" && (
          <div className="space-y-4">
            {/* KPI Summary Strip */}
            {defaultersData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-3.5 bg-rose-50/60 border-rose-100">
                  <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                    Total Defaulters
                  </span>
                  <div className="text-xl font-bold text-rose-800 mt-1">
                    {defaultersData.summary.totalDefaulters} Tenants
                  </div>
                  <span className="text-[11px] text-rose-600 font-medium">Delinquent accounts</span>
                </Card>

                <Card className="p-3.5 bg-amber-50/60 border-amber-100">
                  <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                    Base Overdue
                  </span>
                  <div className="text-xl font-bold text-amber-800 mt-1">
                    {formatINR(defaultersData.summary.totalOverdueAmount)}
                  </div>
                  <span className="text-[11px] text-amber-600 font-medium">Uncollected rent</span>
                </Card>

                <Card className="p-3.5 bg-orange-50/60 border-orange-100">
                  <span className="text-[11px] font-semibold text-orange-700 uppercase tracking-wider">
                    Late Penalties
                  </span>
                  <div className="text-xl font-bold text-orange-800 mt-1">
                    {formatINR(defaultersData.summary.totalPenaltyAccrued)}
                  </div>
                  <span className="text-[11px] text-orange-600 font-medium">Late fees accrued</span>
                </Card>

                <Card className="p-3.5 bg-rose-100/50 border-rose-200">
                  <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
                    Total Outstanding
                  </span>
                  <div className="text-xl font-bold text-rose-900 mt-1">
                    {formatINR(defaultersData.summary.totalOutstanding)}
                  </div>
                  <span className="text-[11px] text-rose-700 font-medium">Total debt exposure</span>
                </Card>
              </div>
            )}

            {/* Defaulters Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tenant Name</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Property & Unit</th>
                    <th className="py-2.5 px-3">Billing Month</th>
                    <th className="py-2.5 px-3 text-center">Overdue Days</th>
                    <th className="py-2.5 px-3 text-right">Base Due</th>
                    <th className="py-2.5 px-3 text-right">Penalty</th>
                    <th className="py-2.5 px-3 text-right">Total Outstanding</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredDefaulters.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        {loading ? "Scanning arrears ledger..." : "No overdue defaulters detected. Excellent collections!"}
                      </td>
                    </tr>
                  ) : (
                    filteredDefaulters.map((item) => (
                      <tr key={item.id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900">{item.tenantName}</p>
                          <p className="text-[11px] text-slate-400">{item.tenantEmail}</p>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                          {item.tenantPhone}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <p className="font-medium text-slate-900">{item.propertyTitle}</p>
                          <p className="text-[11px] text-slate-500 font-mono">Unit: {item.unitNumber}</p>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-600">{item.month}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                            {item.daysOverdue} days
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                          {formatINR(item.baseAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-amber-600">
                          {formatINR(item.penaltyAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-700">
                          {formatINR(item.totalOutstanding)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              shareDefaulterOnWhatsApp({
                                tenantPhone: item.tenantPhone,
                                tenantName: item.tenantName,
                                propertyTitle: item.propertyTitle,
                                unitNumber: item.unitNumber,
                                month: item.month,
                                daysOverdue: item.daysOverdue,
                                baseAmount: item.baseAmount,
                                penaltyAmount: item.penaltyAmount,
                                totalOutstanding: item.totalOutstanding,
                              })
                            }
                            title="Send 1-Click Arrears Notice on WhatsApp"
                            className="h-7 text-[11px] gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold px-2"
                          >
                            <MessageCircle className="h-3 w-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PROPERTY PROFIT & LOSS */}
        {activeTab === "pnl" && (
          <div className="space-y-4">
            {/* KPI Summary Strip */}
            {pnlData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-3.5 bg-emerald-50/60 border-emerald-100">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <div className="text-xl font-bold text-emerald-800 mt-1">
                    {formatINR(pnlData.summary.portfolioRevenue)}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">Collected rent</span>
                </Card>

                <Card className="p-3.5 bg-rose-50/60 border-rose-100">
                  <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                    Operational Costs
                  </span>
                  <div className="text-xl font-bold text-rose-800 mt-1">
                    {formatINR(pnlData.summary.portfolioExpenses)}
                  </div>
                  <span className="text-[11px] text-rose-600 font-medium">Maintenance tickets</span>
                </Card>

                <Card className="p-3.5 bg-blue-50/60 border-blue-100">
                  <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                    Net Operating Income
                  </span>
                  <div className="text-xl font-bold text-blue-800 mt-1">
                    {formatINR(pnlData.summary.netOperatingIncome)}
                  </div>
                  <span className="text-[11px] text-blue-600 font-medium">Net profit / (loss)</span>
                </Card>

                <Card className="p-3.5 bg-slate-50 border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Portfolio Margin
                  </span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {pnlData.summary.portfolioMargin}%
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Overall operating margin</span>
                </Card>
              </div>
            )}

            {/* PnL Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Property Asset</th>
                    <th className="py-2.5 px-3">City</th>
                    <th className="py-2.5 px-3 text-center">Occupancy</th>
                    <th className="py-2.5 px-3 text-right">Rent Collected</th>
                    <th className="py-2.5 px-3 text-right">Maintenance Costs</th>
                    <th className="py-2.5 px-3 text-right">Net Operating P&L</th>
                    <th className="py-2.5 px-3 text-center">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredPnl.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        {loading ? "Computing P&L statements..." : "No property financial statements available."}
                      </td>
                    </tr>
                  ) : (
                    filteredPnl.map((item) => (
                      <tr key={item.propertyId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900">{item.propertyTitle}</p>
                          <p className="text-[11px] text-slate-400">{item.address}</p>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-600">{item.city}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                            {item.occupiedUnits}/{item.totalUnits} Units
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                          {formatINR(item.grossIncome)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-rose-600">
                          {formatINR(item.totalExpenses)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          <div className="flex items-center justify-end gap-1">
                            {item.netProfit >= 0 ? (
                              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />
                            )}
                            <span
                              className={item.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"}
                            >
                              {formatINR(item.netProfit)}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge
                            tone={item.profitMargin >= 50 ? "green" : item.profitMargin > 0 ? "yellow" : "red"}
                          >
                            {item.profitMargin}%
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
