import { useEffect, useMemo, useState } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { Loading2 } from "../Components/Loading";
import { FormateTime } from "../Helpers/formateTime";

type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface TicketResponse {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  admin_notes?: string | null;
}

interface MyTicketsResponse {
  tickets: TicketResponse[];
}

interface ErrorResponse {
  success?: false;
  detail?: string | object;
}

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const statusBadgeClasses: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export function Support() {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | TicketStatus>("");

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        !search ||
        t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await backendRequest<MyTicketsResponse, ErrorResponse>(
        "GET",
        "/support/tickets"
      );
      if (res && "tickets" in res && Array.isArray(res.tickets)) {
        setTickets(res.tickets);
      } else {
        notifyResponse(res as object);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      notifyResponse(
        { success: false, detail: "Failed to fetch support tickets" },
        "",
        "Failed to fetch support tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      notifyResponse(
        { success: false, detail: "Please fill in subject and description." },
        "",
        "Please fill in subject and description."
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await backendRequest<TicketResponse, ErrorResponse>(
        "POST",
        "/support/tickets",
        {
          subject: subject.trim(),
          description: description.trim(),
          priority,
        }
      );

      if ("id" in res) {
        notifyResponse(
          { success: true, detail: "Support ticket created successfully." },
          "Support ticket created successfully."
        );
        setSubject("");
        setDescription("");
        setPriority("MEDIUM");
        setTickets((prev) => [res as TicketResponse, ...prev]);
      } else {
        notifyResponse(res as object, "Support ticket created successfully.");
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
      notifyResponse(
        { success: false, detail: "Failed to create support ticket" },
        "",
        "Failed to create support ticket"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-600 text-sm mt-1">
            Create support tickets and track their status.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Create a Ticket
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Describe your issue or question and our team will get back to
                you.
              </p>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Short summary of your issue"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide as much detail as possible..."
                    rows={5}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  >
                    {priorityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    My Tickets
                  </h2>
                  <p className="text-xs text-gray-500">
                    View the status and history of your support requests.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search tickets..."
                      className="w-full sm:w-56 pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value as "" | TicketStatus
                        )
                      }
                      className="w-full sm:w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">All statuses</option>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loading2 />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="py-12 px-6 text-center text-sm text-gray-500">
                  No support tickets found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ticket
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.subject}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {ticket.ticket_number}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {ticket.description}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusBadgeClasses[ticket.status] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {ticket.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {FormateTime(ticket.created_at)}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 max-w-xs">
                            {ticket.admin_notes || (
                              <span className="italic text-gray-400">
                                No notes yet
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

