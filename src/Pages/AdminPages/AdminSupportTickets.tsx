import { useEffect, useMemo, useState } from "react";
import { backendRequest } from "../../Helpers/backendRequest";
import { notifyResponse } from "../../Helpers/notyf";
import { Loading2 } from "../../Components/Loading";
import { FormateTime } from "../../Helpers/formateTime";

type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface AdminTicketResponse {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  admin_notes?: string | null;
  user_id: number;
  user_name: string;
  user_email: string;
}

interface AdminTicketsResponse {
  tickets: AdminTicketResponse[];
}

interface ErrorResponse {
  success?: false;
  detail?: string | object;
}

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const statusBadgeClasses: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<AdminTicketResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | TicketStatus>("");

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        !search ||
        t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.user_name.toLowerCase().includes(search.toLowerCase()) ||
        t.user_email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await backendRequest<AdminTicketsResponse, ErrorResponse>(
        "GET",
        "/support/admin/tickets"
      );
      if (res && "tickets" in res && Array.isArray(res.tickets)) {
        setTickets(res.tickets);
      } else {
        notifyResponse(res as object);
      }
    } catch (error) {
      console.error("Failed to fetch admin tickets:", error);
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

  const handleUpdateTicket = async (
    ticket: AdminTicketResponse,
    newStatus: TicketStatus,
    newNotes: string
  ) => {
    setUpdatingId(ticket.id);
    try {
      const res = await backendRequest<AdminTicketResponse, ErrorResponse>(
        "PATCH",
        `/support/admin/tickets/${ticket.id}`,
        {
          status: newStatus,
          admin_notes: newNotes || null,
        }
      );

      if ("id" in res) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticket.id ? (res as AdminTicketResponse) : t))
        );
        notifyResponse(
          { success: true, detail: "Ticket updated successfully." },
          "Ticket updated successfully."
        );
      } else {
        notifyResponse(res as object, "Ticket updated successfully.");
      }
    } catch (error) {
      console.error("Failed to update ticket:", error);
      notifyResponse(
        { success: false, detail: "Failed to update ticket" },
        "",
        "Failed to update ticket"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Support Tickets
          </h1>
          <p className="text-sm text-gray-600">
            View and manage all user support tickets.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, user or email..."
            className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "" | TicketStatus)
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin Notes / Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => {
                  const [localStatus, setLocalStatus] = useState<TicketStatus>(
                    ticket.status
                  );
                  const [localNotes, setLocalNotes] = useState(
                    ticket.admin_notes || ""
                  );

                  // Note: using inline component-like pattern to keep per-row state isolated
                  const Row = () => (
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 align-top">
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
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.user_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ticket.user_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
                            statusBadgeClasses[localStatus] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {localStatus.replace("_", " ")}
                        </span>
                        <select
                          value={localStatus}
                          onChange={(e) =>
                            setLocalStatus(e.target.value as TicketStatus)
                          }
                          className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              opt.label
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-gray-500 whitespace-nowrap">
                        {FormateTime(ticket.created_at)}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <textarea
                          value={localNotes}
                          onChange={(e) => setLocalNotes(e.target.value)}
                          rows={3}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary resize-none mb-2"
                          placeholder="Add admin notes..."
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateTicket(ticket, localStatus, localNotes)
                          }
                          disabled={updatingId === ticket.id}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {updatingId === ticket.id ? "Updating..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );

                  return <Row key={ticket.id} />;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

