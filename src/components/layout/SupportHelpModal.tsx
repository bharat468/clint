import { useState, useEffect } from "react";
import {
  Send,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import { api } from "@/services/axios";
import { ENDPOINTS } from "@/services/endpoints";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Toast } from "@/components/ui/toast";
import { useAppSelector } from "@/app/hooks";

interface SupportHelpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SupportHelpModal({ open, onClose }: SupportHelpModalProps) {
  const user = useAppSelector((s) => s.auth.user);
  const [activeTab, setActiveTab] = useState<"NEW" | "HISTORY">("NEW");
  const [loading, setLoading] = useState(false);
  const [myMessages, setMyMessages] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
  };

  const [form, setForm] = useState({
    subject: "",
    category: "SUPPORT",
    priority: "MEDIUM",
    message: "",
  });

  const fetchMyMessages = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get(ENDPOINTS.MESSAGES.MY_LIST);
      setMyMessages(res.data?.data || []);
    } catch (err) {
      // silently fail
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (open && activeTab === "HISTORY") {
      fetchMyMessages();
    }
  }, [open, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) {
      showFeedback("Please enter your message", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post(ENDPOINTS.MESSAGES.SUBMIT, {
        name: user?.name || "Workspace User",
        mobile: user?.mobile || "",
        email: user?.email || null,
        subject: form.subject || "Support Request",
        category: form.category,
        priority: form.priority,
        message: form.message,
      });

      showFeedback("Your message has been delivered to SuperAdmin!");
      setForm({
        subject: "",
        category: "SUPPORT",
        priority: "MEDIUM",
        message: "",
      });
      setActiveTab("HISTORY");
      fetchMyMessages();
    } catch (err: any) {
      showFeedback(err.response?.data?.message || "Failed to deliver message to SuperAdmin", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Platform Support & SuperAdmin Desk"
      subtitle="Direct channel to communicate with RentMate SuperAdmin"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 pt-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("NEW")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === "NEW"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            New Message
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("HISTORY")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === "HISTORY"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            My Past Inquiries & Replies
          </button>
        </div>

        {activeTab === "NEW" ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Sender context chip */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{user?.name || "User"}</div>
                  <div className="text-[10px] text-slate-500 font-mono">+91 {user?.mobile}</div>
                </div>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                {user?.role || "Landlord"}
              </Badge>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject / Request Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Need assistance with Rent Schedule or Plan upgrade"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                >
                  <option value="SUPPORT">General Support</option>
                  <option value="BILLING">Billing & GST Receipt</option>
                  <option value="QUOTA_REQUEST">Property/Unit Quota Request</option>
                  <option value="BUG_REPORT">Technical Issue / Bug</option>
                  <option value="FEATURE_REQUEST">Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                >
                  <option value="LOW">Low (General question)</option>
                  <option value="MEDIUM">Medium (Standard request)</option>
                  <option value="HIGH">High (Urgent tenant/billing issue)</option>
                  <option value="URGENT">Urgent (Platform blocking)</option>
                </select>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Message / Explanation *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your question, request, or issue in detail..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{loading ? "Delivering..." : "Send to SuperAdmin"}</span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {loadingHistory ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-2">
                <Spinner size="md" />
                <p className="text-xs text-slate-400">Loading your inquiries...</p>
              </div>
            ) : myMessages.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Headphones className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">No Inquiries Submitted Yet</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  When you submit messages to SuperAdmin, you can monitor status and read admin replies here.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("NEW")}
                  className="text-xs font-semibold mt-2"
                >
                  Write Your First Message
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {myMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{msg.subject}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {msg.status}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {msg.message}
                    </p>

                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>

                    {/* Replies */}
                    {msg.replies && msg.replies.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          SuperAdmin Response:
                        </span>
                        {msg.replies.map((rep: any) => (
                          <div
                            key={rep.id}
                            className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-950"
                          >
                            <p>{rep.message}</p>
                            <span className="text-[9px] text-indigo-400 mt-0.5 block">
                              {new Date(rep.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Toast
        show={Boolean(feedback)}
        message={feedback?.text || ""}
        type={feedback?.type || "success"}
        onClose={() => setFeedback(null)}
      />
    </Modal>
  );
}
