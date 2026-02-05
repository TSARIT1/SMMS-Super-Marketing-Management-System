import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  RefreshCw,
  User,
  Calendar,
  Tag,
  FileText,
  Bell,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import toast, { Toaster } from "react-hot-toast";

export default function UserSupportTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM",
    category: "General",
  });
  const [files, setFiles] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch user tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Prefer storing user object in localStorage (id), fallback to legacy userId key or 1 for demo
      let userId;
      try {
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
          const u = JSON.parse(userRaw);
          userId = u?.id;
        }
      } catch (err) {
        console.debug("Failed to parse user from localStorage", err);
      }
      if (!userId) userId = localStorage.getItem("userId") || "1";
      const response = await api.get(`/tickets/user/${userId}`);
      setTickets(response.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  // Create new ticket
  const createTicket = async (e) => {
    e.preventDefault();
    try {
      // Prefer user object in localStorage
      let userId = undefined;
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          userId = u?.id;
        }
      } catch (err) {
        console.debug("Failed to parse user from storage", err);
      }
      if (!userId) userId = localStorage.getItem("userId") || "1";

      // If files attached, send multipart form
      if (files && files.length > 0) {
        const fd = new FormData();
        fd.append("userId", parseInt(userId));
        fd.append("subject", formData.subject);
        fd.append("description", formData.description);
        fd.append("priority", formData.priority);
        fd.append("category", formData.category);
        files.forEach((f) => fd.append("attachments", f));
        await api.post("/tickets/create-multipart", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const ticketData = {
          ...formData,
          userId: parseInt(userId),
        };
        await api.post("/tickets/create", ticketData);
      }

      toast.success("Support ticket created successfully!");
      setShowCreateForm(false);
      setFormData({
        subject: "",
        description: "",
        priority: "MEDIUM",
        category: "General",
      });
      setFiles([]);
      fetchTickets(); // Refresh tickets list
    } catch (err) {
      console.error("Error creating ticket:", err);
      toast.error("Failed to create support ticket");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <Clock className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <RefreshCw className="w-4 h-4" />;
      case "RESOLVED":
        return <CheckCircle className="w-4 h-4" />;
      case "CLOSED":
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // AI Assist function
  const runAiAssist = (prompt) => {
    const trimmed = (prompt || "").trim();
    if (!trimmed) return;
    const normalized = trimmed.toLowerCase();
    setAiLoading(true);

    let category = "General";
    if (normalized.includes("payment") || normalized.includes("billing")) {
      category = "Billing";
    } else if (normalized.includes("login") || normalized.includes("password")) {
      category = "Account";
    } else if (normalized.includes("inventory") || normalized.includes("stock")) {
      category = "Technical";
    }

    let priority = "MEDIUM";
    if (normalized.includes("urgent") || normalized.includes("crash") || normalized.includes("error")) {
      priority = "HIGH";
    } else if (normalized.includes("how") || normalized.includes("question")) {
      priority = "LOW";
    }

    const subject = `${category} support: ${trimmed.slice(0, 48)}${trimmed.length > 48 ? "..." : ""}`;
    const description = [`Issue: ${trimmed}`, "", "Steps:", "1. ", "2. ", "", "Expected:", "", "Actual: "].join("\n");

    const suggestions = [];
    if (category === "Billing") {
      suggestions.push("Check payment settings.", "Verify subscription status.", "Confirm billing email.");
    } else if (category === "Account") {
      suggestions.push("Try password reset.", "Check email confirmation.", "Clear browser cache.");
    } else if (category === "Technical") {
      suggestions.push("Check inventory database.", "Verify API connection.", "Review error logs.");
    } else {
      suggestions.push("Refresh the page.", "Check error message.", "Review documentation.");
    }

    setTimeout(() => {
      setAiSuggestions(suggestions);
      setFormData((prev) => ({ ...prev, subject, description, priority, category }));
      setAiLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition"
            >
              <ArrowLeft size={20} />
              <span>Back to Profile</span>
            </button>
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                <MessageSquare className="w-8 h-8 text-blue-600" />
                Support Center
              </h1>
              <p className="text-lg text-gray-600">
                Get help and support for your supermarket operations
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Tickets"
              value={tickets.length}
              icon={<MessageSquare className="w-8 h-8 text-blue-500" />}
              color="blue"
            />

            <StatCard
              title="Resolved"
              value={tickets.filter((t) => t.status === "RESOLVED").length}
              icon={<CheckCircle className="w-8 h-8 text-green-500" />}
              color="green"
            />

            <StatCard
              title="In Progress"
              value={tickets.filter((t) => t.status === "IN_PROGRESS").length}
              icon={<RefreshCw className="w-8 h-8 text-orange-500" />}
              color="orange"
            />

            <StatCard
              title="Open"
              value={tickets.filter((t) => t.status === "OPEN").length}
              icon={<Clock className="w-8 h-8 text-purple-500" />}
              color="purple"
            />
          </div>

          {/* Create Ticket Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create New Support Ticket
            </button>
          </div>

          {/* Tickets List */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Support Tickets
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading tickets...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No support tickets yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first support ticket to get help with any issues.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Ticket
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {ticket.subject}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(ticket.status)}`}
                          >
                            {getStatusIcon(ticket.status)}
                            {ticket.status.replace("_", " ")}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                          >
                            {ticket.priority}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {ticket.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {ticket.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(ticket.createdAt)}
                          </span>
                          {ticket.adminResponse && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Bell className="w-4 h-4" />
                              Admin replied
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="ml-4 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Create Support Ticket
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={createTicket} className="p-6 space-y-6">
              {/* AI Assist Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-blue-700 font-semibold">
                    <Sparkles size={16} />
                    AI Support Assist
                  </div>
                  <span className="text-xs text-gray-500">Optional</span>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe your issue briefly"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => runAiAssist(aiPrompt)}
                    disabled={aiLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
                  >
                    {aiLoading ? "Generating..." : "Generate"}
                  </button>
                </div>
                {aiSuggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Suggested fixes:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                      {aiSuggestions.map((tip, idx) => (
                        <li key={`${idx}-${tip.slice(0, 12)}`}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please provide detailed information about your issue..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="General">General</option>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Account">Account</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments (optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    className="w-full"
                  />
                  {files.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {files.map((f) => f.name).join(", ")}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFiles([]);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Create Ticket
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedTicket.subject}
                </h3>
                <div className="text-xs text-gray-500">
                  {selectedTicket.category} • {selectedTicket.priority} •{" "}
                  {selectedTicket.status}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    setReplyText("");
                    setReplyFiles([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Your Message</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Created on {formatDate(selectedTicket.createdAt)}
                </p>
              </div>

              <div className="space-y-3">
                {(selectedTicket.messages || []).map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-4 ${m.sender === "ADMIN" ? "bg-blue-50 border-l-4 border-blue-500" : "bg-gray-50"}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {m.sender} • {formatDate(m.createdAt)}
                    </div>
                    <div
                      className={`${m.sender === "ADMIN" ? "text-blue-900" : "text-gray-800"} whitespace-pre-wrap`}
                    >
                      {m.message}
                    </div>

                    {(m.attachments || []).length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700">
                          Attachments
                        </h5>
                        <div className="flex gap-3 mt-2">
                          {m.attachments.map((a) => (
                            <a
                              key={a.id}
                              href={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ""}/api/tickets/attachments/${a.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline text-sm"
                            >
                              {a.originalName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {(selectedTicket.messages || []).length === 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <p className="text-yellow-800">
                        Waiting for admin response...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Add a follow-up
                </h4>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="w-full border rounded p-2 mb-2"
                  placeholder="Add more details or follow up on this ticket..."
                />
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setReplyFiles(Array.from(e.target.files))}
                  />
                  <button
                    onClick={async () => {
                      const txt = (replyText || "").trim();
                      if (!txt) {
                        toast.error("Type your message");
                        return;
                      }
                      let userId = undefined;
                      try {
                        userId = JSON.parse(
                          localStorage.getItem("user") || "{}",
                        )?.id;
                      } catch (e) {
                        console.debug("Failed to parse user for reply", e);
                      }
                      if (!userId) {
                        toast.error("User not signed in");
                        return;
                      }
                      try {
                        if ((replyFiles || []).length > 0) {
                          const fd = new FormData();
                          fd.append("userId", userId);
                          fd.append("message", txt);
                          (replyFiles || []).forEach((f) =>
                            fd.append("attachments", f),
                          );
                          await api.post(
                            `/tickets/${selectedTicket.id}/reply-multipart`,
                            fd,
                            {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            },
                          );
                        } else {
                          await api.post(
                            `/tickets/${selectedTicket.id}/reply`,
                            { userId, message: txt },
                          );
                        }
                        toast.success("Reply added");
                        setReplyText("");
                        setReplyFiles([]);
                        await fetchTickets();
                        const fresh = await api.get(
                          `/tickets/${selectedTicket.id}`,
                        );
                        setSelectedTicket(fresh.data);
                      } catch (err) {
                        console.error("Failed to send reply", err);
                        toast.error("Failed to add reply");
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Send
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Ticket #:</span>
                  <span className="ml-2 text-gray-800">
                    {selectedTicket.ticketNumber || `#${selectedTicket.id}`}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Last Updated:
                  </span>
                  <span className="ml-2 text-gray-800">
                    {formatDate(selectedTicket.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
