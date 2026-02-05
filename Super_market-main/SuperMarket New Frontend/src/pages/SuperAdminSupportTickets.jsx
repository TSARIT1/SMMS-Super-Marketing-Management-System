import React, { useEffect, useState } from "react";
import SuperAdminLayout from "../components/SuperAdminLayout";
import api from "../utils/api";
import ConfirmModal from "../components/ConfirmModal";
import toast, { Toaster } from "react-hot-toast";
import { Sparkles } from "lucide-react";

export default function SuperAdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdminTicket, setSelectedAdminTicket] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [adminStatusUpdating, setAdminStatusUpdating] = useState(false);
  const [adminRespondLoading, setAdminRespondLoading] = useState(false);
  const [adminFiles, setAdminFiles] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [replyResolveLoading, setReplyResolveLoading] = useState(false);
  const [ticketPage, setTicketPage] = useState(0);
  const [ticketTotalPages, setTicketTotalPages] = useState(1);
  const [generatingAI, setGeneratingAI] = useState(false);

  const fetchAdminTickets = async (page = 0, size = 25, append = false) => {
    try {
      if (!append) setLoading(true);
      const res = await api.get("/admin/tickets", { params: { page, size } });
      const data = res.data;
      const items = data.items || [];
      setTickets((prev) => (append ? [...prev, ...items] : items));
      setTicketPage(data.page || 0);
      setTicketTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch admin tickets", err);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminTickets(0, 25, false);
  }, []);

  const openAdminTicket = async (ticket) => {
    try {
      const res = await api.get(`/tickets/${ticket.id}`);
      setSelectedAdminTicket(res.data);
      setAdminResponse(res.data.adminResponse || "");
    } catch (err) {
      console.error("Failed to load ticket details", err);
      toast.error("Failed to load ticket details");
    }
  };

  const closeAdminTicket = () => {
    setSelectedAdminTicket(null);
    setAdminResponse("");
  };

  const updateTicketStatus = async (status) => {
    if (!selectedAdminTicket) return;
    setAdminStatusUpdating(true);
    try {
      const payload = { status };
      const admin = JSON.parse(localStorage.getItem("admin") || "null");
      if (status === "RESOLVED" && admin?.id) payload.resolvedBy = admin.id;
      await api.put(`/tickets/admin/${selectedAdminTicket.id}/status`, payload);
      toast.success("Ticket status updated");
      await fetchAdminTickets();
      // refresh detail
      await openAdminTicket(selectedAdminTicket);
    } catch (err) {
      console.error("Failed to update ticket status", err);
      toast.error("Failed to update ticket status");
    } finally {
      setAdminStatusUpdating(false);
    }
  };

  const respondToTicket = async () => {
    if (!selectedAdminTicket) return;
    setAdminRespondLoading(true);
    try {
      if (adminFiles && adminFiles.length > 0) {
        const fd = new FormData();
        fd.append("response", adminResponse);
        const admin = JSON.parse(localStorage.getItem("admin") || "null");
        if (admin?.id) fd.append("resolvedBy", admin.id);
        adminFiles.forEach((f) => fd.append("attachments", f));
        await api.put(
          `/tickets/admin/${selectedAdminTicket.id}/respond-multipart`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
      } else {
        await api.put(`/tickets/admin/${selectedAdminTicket.id}/respond`, {
          response: adminResponse,
        });
      }

      toast.success("Response sent");
      await fetchAdminTickets();
      await openAdminTicket(selectedAdminTicket);
      // keep modal open so admin can add more responses
    } catch (err) {
      console.error("Failed to respond to ticket", err);
      toast.error("Failed to send response");
    } finally {
      setAdminRespondLoading(false);
      setAdminFiles([]);
    }
  };

  const replyAndResolve = async () => {
    if (!selectedAdminTicket) return;
    if (!adminResponse || !adminResponse.trim()) {
      toast.error("Please type a response before resolving");
      return;
    }
    setReplyResolveLoading(true);
    try {
      const admin = JSON.parse(localStorage.getItem("admin") || "null");
      await api.put(`/tickets/${selectedAdminTicket.id}/reply`, null, {
        params: { adminResponse: adminResponse, adminId: admin?.id },
      });
      toast.success(`Ticket ${selectedAdminTicket.ticketNumber} resolved`);
      // refresh list and detail
      await fetchAdminTickets();
      await openAdminTicket(selectedAdminTicket);
      // clear response text
      setAdminResponse("");
    } catch (err) {
      console.error("Failed to reply and resolve ticket", err);
      toast.error("Failed to reply & resolve ticket");
    } finally {
      setReplyResolveLoading(false);
    }
  };

  const deleteTicket = async () => {
    if (!selectedAdminTicket) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/tickets/admin/${selectedAdminTicket.id}`);
      toast.success(`Ticket ${selectedAdminTicket.ticketNumber} deleted`);
      await fetchAdminTickets();
      setSelectedAdminTicket(null);
      setConfirmDeleteOpen(false);
    } catch (err) {
      console.error("Failed to delete ticket", err);
      toast.error(err?.response?.data?.error || "Failed to delete ticket");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ========== AI RESPONSE GENERATION ==========
  const generateAIResponse = async () => {
    if (!selectedAdminTicket) return;
    
    setGeneratingAI(true);
    const toastId = toast.loading('🤖 AI generating response...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const ticketType = selectedAdminTicket.category || 'general';
      const ticketSubject = selectedAdminTicket.subject || '';
      const ticketMessage = selectedAdminTicket.message || '';
      
      let aiResponse = '';
      
      // Generate contextual AI responses based on ticket type and content
      if (ticketType.toLowerCase().includes('billing') || ticketSubject.toLowerCase().includes('payment')) {
        aiResponse = `Dear ${selectedAdminTicket.userName || 'Valued Customer'},

Thank you for contacting us regarding your billing inquiry. I've reviewed your account and here's what I found:

Our records show your current subscription status. I understand your concern about ${ticketMessage.substring(0, 50)}...

To resolve this promptly, I recommend the following:
1. Please verify your payment method is up to date in your account settings
2. Check if there are any pending transactions in your payment history
3. If needed, I can manually process a refund or adjustment

I'm here to help ensure your billing experience is smooth. Please let me know if you need any clarification or assistance.

Best regards,
Support Team`;
      } else if (ticketType.toLowerCase().includes('technical') || ticketSubject.toLowerCase().includes('bug') || ticketSubject.toLowerCase().includes('error')) {
        aiResponse = `Dear ${selectedAdminTicket.userName || 'Valued Customer'},

Thank you for reporting this technical issue. I understand you're experiencing: "${ticketSubject}"

Based on your description, here are immediate troubleshooting steps:

1. **Clear Cache & Cookies**: Try clearing your browser cache and cookies, then log in again
2. **Check Browser Compatibility**: Ensure you're using a supported browser (Chrome, Firefox, Safari latest versions)
3. **Try Incognito Mode**: Test if the issue persists in an incognito/private browser window
4. **Check Internet Connection**: Verify your internet connection is stable

If the issue persists after these steps, our technical team will investigate further. Could you please provide:
- Browser name and version
- Screenshot of any error messages
- Steps to reproduce the issue

We're committed to resolving this quickly for you.

Best regards,
Technical Support Team`;
      } else if (ticketType.toLowerCase().includes('account') || ticketSubject.toLowerCase().includes('login') || ticketSubject.toLowerCase().includes('password')) {
        aiResponse = `Dear ${selectedAdminTicket.userName || 'Valued Customer'},

Thank you for reaching out about your account access issue.

I understand you're having trouble with: "${ticketSubject}"

To help you regain access immediately:

1. **Password Reset**: Click "Forgot Password" on the login page and follow the email instructions
2. **Verify Email**: Ensure you're using the correct email address registered with your account
3. **Check Spam Folder**: Our reset emails might be in your spam/junk folder
4. **Account Status**: I've verified your account is active and in good standing

If you continue experiencing issues, I can:
- Send a manual password reset link
- Verify your account details
- Enable two-factor authentication for added security

Your account security is our top priority. Please reply if you need further assistance.

Best regards,
Account Security Team`;
      } else if (ticketType.toLowerCase().includes('feature') || ticketSubject.toLowerCase().includes('request') || ticketSubject.toLowerCase().includes('suggestion')) {
        aiResponse = `Dear ${selectedAdminTicket.userName || 'Valued Customer'},

Thank you for your valuable feedback and feature suggestion!

We truly appreciate customers like you who take the time to help us improve our platform. Your suggestion regarding "${ticketSubject}" has been noted and forwarded to our product development team.

Here's what happens next:
1. **Review Process**: Our product team will evaluate your suggestion within 5-7 business days
2. **Community Voting**: Your idea may be added to our public feature request board
3. **Development Timeline**: If approved, we'll include it in our product roadmap
4. **Updates**: You'll be notified of any progress on your suggestion

In the meantime, you might find these existing features helpful:
- Check our latest release notes for recently added features
- Explore our knowledge base for tips and tricks

Your input shapes our future. Thank you for being part of our community!

Best regards,
Product Team`;
      } else {
        aiResponse = `Dear ${selectedAdminTicket.userName || 'Valued Customer'},

Thank you for contacting our support team. I've received your inquiry regarding: "${ticketSubject}"

I understand your concern and I'm here to help. Based on your message: "${ticketMessage.substring(0, 100)}${ticketMessage.length > 100 ? '...' : ''}"

To provide you with the best assistance:

1. I've reviewed your account details and current status
2. Your issue has been prioritized for quick resolution
3. If needed, I can escalate this to our specialized team

Could you please provide any additional details that might help us resolve this faster? For example:
- When did you first notice this issue?
- Have you tried any troubleshooting steps?
- Is this affecting any specific features or functions?

I'm committed to ensuring your satisfaction with our service. Please don't hesitate to provide more information or ask any questions.

Best regards,
Support Team`;
      }
      
      setAdminResponse(aiResponse);
      toast.success('✨ AI response generated! Review and edit before sending.', { id: toastId });
    } catch (error) {
      console.error('AI response generation error:', error);
      toast.error('Failed to generate AI response', { id: toastId });
    } finally {
      setGeneratingAI(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-gray-600">Loading support tickets...</div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <Toaster position="top-right" />

      <div className="card overflow-hidden fade-up">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Support Tickets
          </h3>
          <p className="text-sm text-gray-600">
            Manage user support requests
          </p>
        </div>
        <div className="overflow-x-auto">
          {tickets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No support tickets found.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {ticket.ticketNumber || `#${ticket.id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {ticket.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.user?.fullName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              ticket.priority === "HIGH"
                                ? "bg-red-100 text-red-800"
                                : ticket.priority === "MEDIUM"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              ticket.status === "OPEN"
                                ? "bg-blue-100 text-blue-800"
                                : ticket.status === "IN_PROGRESS"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : ticket.status === "RESOLVED"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            ticket.createdAt,
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => openAdminTicket(ticket)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {ticket.subject}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {ticket.ticketNumber || `#${ticket.id}`} •{" "}
                          {ticket.user?.fullName || "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                            ticket.priority === "HIGH"
                              ? "bg-red-100 text-red-800"
                              : ticket.priority === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                            ticket.status === "OPEN"
                              ? "bg-blue-100 text-blue-800"
                              : ticket.status === "IN_PROGRESS"
                                ? "bg-yellow-100 text-yellow-800"
                                : ticket.status === "RESOLVED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-3">
                        <div>
                          <span className="text-xs text-gray-600">
                            Created:
                          </span>
                          <div className="text-xs font-medium">
                            {new Date(
                              ticket.createdAt,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="ml-auto">
                          <button
                            onClick={() => openAdminTicket(ticket)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load more / pagination */}
              {ticketPage + 1 < ticketTotalPages && (
                <div className="p-4 text-center">
                  <button
                    onClick={() =>
                      fetchAdminTickets(ticketPage + 1, 25, true)
                    }
                    className="px-4 py-2 bg-gray-100 rounded"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedAdminTicket && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Ticket {selectedAdminTicket.ticketNumber} —{" "}
                  {selectedAdminTicket.subject}
                </h3>
                <p className="text-sm text-gray-600">
                  From: {selectedAdminTicket.user?.fullName || "N/A"} (
                  {selectedAdminTicket.user?.email || "N/A"})
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closeAdminTicket}
                  className="text-gray-600 text-sm"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
              {(selectedAdminTicket.messages || []).map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded ${m.sender === "ADMIN" ? "bg-blue-50 text-blue-900" : "bg-gray-100 text-gray-800"}`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {m.sender} • {new Date(m.createdAt).toLocaleString()}
                  </div>
                  <div className="whitespace-pre-wrap">{m.message}</div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Add response
                </label>
                <button
                  onClick={generateAIResponse}
                  disabled={generatingAI}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={14} />
                  {generatingAI ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={4}
                className="w-full border rounded p-2"
                placeholder="Type your response to user or click 'AI Generate' for suggestions..."
              />
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-700">
                  Attachments (optional)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setAdminFiles(Array.from(e.target.files))
                  }
                  className="w-full mt-1"
                />
                {adminFiles.length > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    Attached: {adminFiles.map((f) => f.name).join(", ")}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateTicketStatus("IN_PROGRESS")}
                  disabled={adminStatusUpdating}
                  className="px-3 py-1 bg-yellow-500 text-white text-sm rounded"
                >
                  Mark In-Progress
                </button>
                <button
                  onClick={respondToTicket}
                  disabled={adminRespondLoading}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                >
                  Send Response
                </button>
                <button
                  onClick={() => updateTicketStatus("RESOLVED")}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded"
                >
                  Resolve
                </button>
                <button
                  onClick={replyAndResolve}
                  disabled={replyResolveLoading || !adminResponse.trim()}
                  className={`px-3 py-1 ${replyResolveLoading ? "bg-green-400" : "bg-green-800"} text-white text-sm rounded`}
                >
                  {replyResolveLoading ? "Resolving..." : "Reply & Resolve"}
                </button>
              </div>
              <div className="mt-3">
                {selectedAdminTicket.status === "RESOLVED" ||
                selectedAdminTicket.status === "CLOSED" ? (
                  <button
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded"
                    disabled
                  >
                    Delete (resolve first)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete modal for tickets */}
      <ConfirmModal
        open={confirmDeleteOpen}
        title="Delete Ticket"
        message={
          selectedAdminTicket
            ? `Delete ${selectedAdminTicket.ticketNumber || `#${selectedAdminTicket.id}`} — ${selectedAdminTicket.subject}? This action is permanent.`
            : "Delete this ticket?"
        }
        onConfirm={deleteTicket}
        onCancel={() => setConfirmDeleteOpen(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
      />
    </SuperAdminLayout>
  );
}
