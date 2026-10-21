import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Mail,
  Phone,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  Trash2,
  Search,
  RefreshCw,
  Building2,
  Inbox,
  ChevronRight,
} from "lucide-react";
import { api } from "@/services/axios";
import { ENDPOINTS } from "@/services/endpoints";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { Toast } from "@/components/ui/toast";
import { Select } from "@/components/ui/input";

interface ReplyItem {
  id: string;
  senderId?: string | null;
  senderName: string;
  role: string;
  message: string;
  createdAt: string;
}

interface SupportMessage {
  id: string;
  senderName: string;
  senderEmail?: string | null;
  senderPhone: string;
  userId?: string | null;
  userRole: "SUPER_ADMIN" | "LANDLORD" | "TENANT" | "STAFF" | "USER" | "VISITOR";
  organizationId?: string | null;
  organizationName?: string | null;
  subject: string;
  message: string;
  category: string;
  status: "UNREAD" | "READ" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  replies: ReplyItem[];
  createdAt: string;
  updatedAt: string;
}

interface Metrics {
  total: number;
  unread: number;
  resolved: number;
  inProgress: number;
  todayCount: number;
}

export default function SuperAdminMessagesPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    unread: 0,
    resolved: 0,
    inProgress: 0,
    todayCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
  };

  // Selected message for details and reply
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const [messagesRes, metricsRes] = await Promise.all([
        api.get(ENDPOINTS.MESSAGES.LIST, {
          params: {
            limit: 100,
          },
        }),
        api.get(ENDPOINTS.MESSAGES.METRICS),
      ]);

      setMessages(messagesRes.data?.data?.messages || []);
      if (metricsRes.data?.data) {
        setMetrics(metricsRes.data.data);
      }
    } catch (err: any) {
      showFeedback(err.response?.data?.message || "Failed to load support inquiries", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Open modal and auto-mark as read
  const handleOpenMessage = async (msg: SupportMessage) => {
    setSelectedMessage(msg);
    setReplyText("");

    if (msg.status === "UNREAD") {
      try {
        await api.patch(ENDPOINTS.MESSAGES.STATUS(msg.id), { status: "READ" });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "READ" } : m))
        );
        setMetrics((prev) => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
        }));
      } catch (err) {
        // silently ignore read status error
      }
    }
  };

  const handleSendReply = async (markResolved = false) => {
    if (!selectedMessage || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await api.post(ENDPOINTS.MESSAGES.REPLY(selectedMessage.id), {
        replyMessage: replyText.trim(),
        markResolved,
      });

      const updated = res.data?.data;
      if (updated) {
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
        setSelectedMessage(updated);
      }

      setReplyText("");
      showFeedback(markResolved ? "Reply sent & ticket marked resolved!" : "Reply added successfully!");
      fetchMessages(true);
    } catch (err: any) {
      showFeedback(err.response?.data?.message || "Failed to send reply", "error");
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(ENDPOINTS.MESSAGES.STATUS(id), { status: newStatus });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus as any } : m))
      );
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
      showFeedback(`Status updated to ${newStatus}`);
      fetchMessages(true);
    } catch (err: any) {
      showFeedback(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message record?")) return;
    try {
      await api.delete(ENDPOINTS.MESSAGES.DELETE(id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
      showFeedback("Message deleted successfully");
      fetchMessages(true);
    } catch (err: any) {
      showFeedback(err.response?.data?.message || "Failed to delete message", "error");
    }
  };

  // Filtered messages list
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      // Status filter
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;

      // Category filter
      if (categoryFilter !== "ALL" && m.category !== categoryFilter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.senderName.toLowerCase().includes(q);
        const matchesPhone = m.senderPhone.includes(q);
        const matchesEmail = Boolean(m.senderEmail?.toLowerCase().includes(q));
        const matchesSubject = m.subject.toLowerCase().includes(q);
        const matchesBody = m.message.toLowerCase().includes(q);
        const matchesOrg = Boolean(m.organizationName?.toLowerCase().includes(q));
        return matchesName || matchesPhone || matchesEmail || matchesSubject || matchesBody || matchesOrg;
      }

      return true;
    });
  }, [messages, statusFilter, categoryFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UNREAD":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold">Unread</Badge>;
      case "READ":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Read</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">In Progress</Badge>;
      case "RESOLVED":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold">Resolved</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300">Archived</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case "LANDLORD":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Landlord</span>;
      case "TENANT":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Tenant</span>;
      case "STAFF":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Staff</span>;
      default:
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Visitor</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Messages & Inquiries Desk
            </h1>
            {metrics.unread > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {metrics.unread} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Incoming inquiries from the public website, portfolio consultation leads, and user support messages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMessages(true)}
            disabled={refreshing}
            className="text-xs font-semibold gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Inquiries</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{metrics.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all channels</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border border-amber-200/90 bg-amber-50/40 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Unread Messages</span>
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-900 mt-2">{metrics.unread}</div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">Require SuperAdmin review</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border border-indigo-200/90 bg-indigo-50/40 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-800">In Progress / Replied</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-900 mt-2">{metrics.inProgress}</div>
          <div className="text-[11px] text-indigo-700/80 mt-0.5">Under correspondence</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border border-emerald-200/90 bg-emerald-50/40 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Resolved Inquiries</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 mt-2">{metrics.resolved}</div>
          <div className="text-[11px] text-emerald-700/80 mt-0.5">Successfully closed</div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "All Messages" },
              { id: "UNREAD", label: "Unread" },
              { id: "IN_PROGRESS", label: "In Progress" },
              { id: "RESOLVED", label: "Resolved" },
              { id: "ARCHIVED", label: "Archived" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Category Inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-48">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9.5 text-xs rounded-xl px-3"
              >
                <option value="ALL">All Categories</option>
                <option value="PORTFOLIO_INQUIRY">Portfolio Inquiry</option>
                <option value="GENERAL_INQUIRY">General Inquiry</option>
                <option value="SUPPORT">Support</option>
                <option value="BILLING">Billing & Accounts</option>
                <option value="ENTERPRISE_PLAN">Enterprise Plan</option>
                <option value="BUG_REPORT">Bug Report</option>
              </Select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search sender, phone, text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Messages Listing */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Loading messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border border-slate-200 bg-white space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Messages Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL"
              ? "No inquiries match your current search or status filter criteria."
              : "No user messages or inquiries have been received yet. Inquiries from the Contact page or user portal will appear here."}
          </p>
          {(searchQuery || statusFilter !== "ALL") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="text-xs font-semibold"
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => {
            const isUnread = msg.status === "UNREAD";
            const replyCount = msg.replies?.length || 0;

            return (
              <Card
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  isUnread
                    ? "border-amber-300 bg-amber-50/20 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Sender & Subject info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isUnread
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {msg.senderName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "IN"}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {msg.senderName}
                        </span>
                        {getRoleBadge(msg.userRole)}
                        {msg.organizationName && (
                          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                            <Building2 className="h-2.5 w-2.5" />
                            {msg.organizationName}
                          </span>
                        )}
                        {getStatusBadge(msg.status)}
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                        {msg.subject}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>

                      {/* Contact metadata */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="h-3 w-3 text-slate-400" />
                          +91 {msg.senderPhone}
                        </span>
                        {msg.senderEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {msg.senderEmail}
                          </span>
                        )}
                        {replyCount > 0 && (
                          <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                            <MessageSquare className="h-3 w-3" />
                            {replyCount} {replyCount === 1 ? "Admin Reply" : "Admin Replies"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side Actions & Date */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenMessage(msg)}
                        className="h-8 px-3 text-xs font-semibold gap-1 bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      >
                        <span>View & Reply</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Message"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Message Details & Reply Modal */}
      {selectedMessage && (
        <Modal
          open={Boolean(selectedMessage)}
          onClose={() => setSelectedMessage(null)}
          title={selectedMessage.subject}
          subtitle={`Ticket ID: ${selectedMessage.id} • Submitted on ${new Date(
            selectedMessage.createdAt
          ).toLocaleString()}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 pt-1">
            {/* Sender Summary Header */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {selectedMessage.senderName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {selectedMessage.senderName}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      {getRoleBadge(selectedMessage.userRole)}
                      {selectedMessage.organizationName && (
                        <span>Org: {selectedMessage.organizationName}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 shrink-0">Status:</span>
                  <div className="w-36">
                    <Select
                      value={selectedMessage.status}
                      onChange={(e) => handleUpdateStatus(selectedMessage.id, e.target.value)}
                      className="h-8.5 text-xs font-semibold rounded-lg px-2.5"
                    >
                      <option value="UNREAD">Unread</option>
                      <option value="READ">Read</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="ARCHIVED">Archived</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/60 text-xs">
                <a
                  href={`tel:+91${selectedMessage.senderPhone}`}
                  className="flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call +91 {selectedMessage.senderPhone}</span>
                </a>

                {selectedMessage.senderEmail && (
                  <a
                    href={`mailto:${selectedMessage.senderEmail}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                  >
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{selectedMessage.senderEmail}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Original Message Body */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Original Message
              </label>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap shadow-inner">
                {selectedMessage.message}
              </div>
            </div>

            {/* Conversation / Reply Thread */}
            {selectedMessage.replies && selectedMessage.replies.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  SuperAdmin Reply History ({selectedMessage.replies.length})
                </label>
                <div className="space-y-2">
                  {selectedMessage.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-indigo-700 font-semibold">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                          {reply.senderName} (SuperAdmin)
                        </span>
                        <span className="text-slate-400 font-normal">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="leading-relaxed pl-4 border-l-2 border-indigo-300">
                        {reply.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Composer Form */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Send Reply / Internal Note to User
              </label>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Thank you for contacting RentMate! Our specialist will call you shortly.",
                  "Your request has been addressed and verified in the platform.",
                  "We have updated your organization quota. Please refresh your dashboard.",
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                  >
                    Preset {idx + 1}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Type your response or resolution note here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  <span>Delete Record</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={sendingReply || !replyText.trim()}
                    onClick={() => handleSendReply(false)}
                    className="text-xs font-semibold"
                  >
                    <span>Save Reply</span>
                  </Button>

                  <Button
                    size="sm"
                    disabled={sendingReply || !replyText.trim()}
                    onClick={() => handleSendReply(true)}
                    className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Reply & Mark Resolved</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <Toast
        show={Boolean(feedback)}
        message={feedback?.text || ""}
        type={feedback?.type || "success"}
        onClose={() => setFeedback(null)}
      />
    </div>
  );
}
