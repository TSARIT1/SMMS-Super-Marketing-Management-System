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
  Calendar,
  Tag,
  Bell,
  Sparkles,
  Headphones,
  Search,
  Filter,
} from "lucide-react";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

const ProfileSupport = () => {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchTickets = async () => {
    try {
      setLoading(true);
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
      if (!userId) {
        try {
          const adminRaw = localStorage.getItem("admin");
          if (adminRaw) {
            const a = JSON.parse(adminRaw);
            userId = a?.id;
          }
        } catch (err) {
          console.debug("Failed to parse admin from localStorage", err);
        }
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

  const createTicket = async (e) => {
    e.preventDefault();
    try {
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
      if (!userId) {
        try {
          const adminRaw = localStorage.getItem("admin");
          if (adminRaw) {
            const a = JSON.parse(adminRaw);
            userId = a?.id;
          }
        } catch (err) {
          console.debug("Failed to parse admin from storage", err);
        }
      }
      if (!userId) userId = localStorage.getItem("userId") || "1";

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
      fetchTickets();
    } catch (err) {
      console.error("Error creating ticket:", err);
      toast.error("Failed to create support ticket");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            SMMS Support Center
          </h2>
          <p className="text-gray-500 mt-1 ml-1">Get help from TSAR IT - info@tsaritservices.com | +91 8142616767</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Tickets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              <p className="text-sm text-gray-500">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Your Support Tickets</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading tickets...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || filterStatus !== "all" ? "No tickets match your search" : "No support tickets yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Create your first support ticket to get help with any issues."}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Create Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">{ticket.subject}</h4>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
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
                    className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Create Support Ticket
                </h3>
                <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={createTicket} className="p-6 space-y-6">
              {/* AI Assist Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-blue-700 font-semibold">
                    <Sparkles size={16} />
                    AI Support Assist
                  </div>
                  <span className="text-xs text-gray-500">Optional</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
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
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Account">Account</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (optional)</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  className="w-full border border-gray-200 rounded-lg p-2"
                />
                {files.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">Selected: {files.map((f) => f.name).join(", ")}</div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFiles([]);
                  }}
                  className="px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                >
                  <Send className="w-4 h-4" />
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
                <div className="text-xs text-gray-500">
                  {selectedTicket.category} • {selectedTicket.priority} • {selectedTicket.status}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setReplyText("");
                  setReplyFiles([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Your Message
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                <p className="text-xs text-gray-500 mt-3">Created on {formatDate(selectedTicket.createdAt)}</p>
              </div>

              <div className="space-y-3">
                {(selectedTicket.messages || []).map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-4 ${
                      m.sender === "ADMIN" ? "bg-blue-50 border-l-4 border-blue-500" : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                      <span className={`font-medium ${m.sender === "ADMIN" ? "text-blue-700" : "text-gray-700"}`}>
                        {m.sender}
                      </span>
                      <span>•</span>
                      <span>{formatDate(m.createdAt)}</span>
                    </div>
                    <div className={`${m.sender === "ADMIN" ? "text-blue-900" : "text-gray-800"} whitespace-pre-wrap`}>
                      {m.message}
                    </div>

                    {(m.attachments || []).length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Attachments</h5>
                        <div className="flex flex-wrap gap-2">
                          {m.attachments.map((a) => (
                            <a
                              key={a.id}
                              href={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ""}/api/tickets/attachments/${a.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline text-sm"
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
                  <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <p className="text-yellow-800">Waiting for admin response...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add a follow-up</h4>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Add more details or follow up on this ticket..."
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setReplyFiles(Array.from(e.target.files))}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
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
                        userId = JSON.parse(localStorage.getItem("user") || "{}")?.id;
                      } catch (e) {
                        console.debug("Failed to parse user for reply", e);
                      }
                      if (!userId) {
                        try {
                          userId = JSON.parse(localStorage.getItem("admin") || "{}")?.id;
                        } catch (e) {
                          console.debug("Failed to parse admin for reply", e);
                        }
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
                          (replyFiles || []).forEach((f) => fd.append("attachments", f));
                          await api.post(`/tickets/${selectedTicket.id}/reply-multipart`, fd, {
                            headers: { "Content-Type": "multipart/form-data" },
                          });
                        } else {
                          await api.post(`/tickets/${selectedTicket.id}/reply`, { userId, message: txt });
                        }
                        toast.success("Reply added");
                        setReplyText("");
                        setReplyFiles([]);
                        await fetchTickets();
                        const fresh = await api.get(`/tickets/${selectedTicket.id}`);
                        setSelectedTicket(fresh.data);
                      } catch (err) {
                        console.error("Failed to send reply", err);
                        toast.error("Failed to add reply");
                      }
                    }}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Reply
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div>
                  <span className="font-medium text-gray-600">Ticket #:</span>
                  <span className="ml-2 text-gray-800">{selectedTicket.ticketNumber || `#${selectedTicket.id}`}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <span className="ml-2 text-gray-800">{formatDate(selectedTicket.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSupport;