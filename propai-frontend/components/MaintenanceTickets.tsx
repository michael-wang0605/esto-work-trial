"use client";

import { useState, useEffect } from "react";
import { Wrench, Clock, AlertTriangle, CheckCircle, XCircle, Edit3 } from "lucide-react";
import { getMaintenanceTickets, updateTicketStatus } from "@/lib/api";

interface MaintenanceTicket {
  id: string;
  tenant_phone: string;
  tenant_name: string;
  unit: string;
  property_name: string;
  issue_description: string;
  priority: "low" | "normal" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  media_urls: string[];
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusIcons = {
  open: <Clock className="h-4 w-4" />,
  in_progress: <Wrench className="h-4 w-4" />,
  resolved: <CheckCircle className="h-4 w-4" />,
  closed: <XCircle className="h-4 w-4" />,
};

const statusColors = {
  open: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

export default function MaintenanceTickets() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await getMaintenanceTickets();
      console.log('[MaintenanceTickets] Received response:', response);
      console.log('[MaintenanceTickets] Tickets count:', response.tickets?.length || 0);
      setTickets(response.tickets || []);
      setError(null);
    } catch (err) {
      console.error('[MaintenanceTickets] Error loading tickets:', err);
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      setUpdatingTicket(ticketId);
      await updateTicketStatus(ticketId, newStatus);
      
      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: newStatus as any } : ticket
      ));
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket status");
    } finally {
      setUpdatingTicket(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="w-full bg-white border rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wrench className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Maintenance Tickets</h3>
        </div>
        <div className="text-gray-500">Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white border rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wrench className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Maintenance Tickets</h3>
        </div>
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={loadTickets}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Maintenance Tickets</h3>
        </div>
        <button
          onClick={loadTickets}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No maintenance tickets found
        </div>
      ) : (
        <div className="space-y-4">
          {tickets
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((ticket) => (
              <div
                key={ticket.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-600">#{ticket.id}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}
                    >
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[ticket.status]}`}
                    >
                      {statusIcons[ticket.status]}
                      {ticket.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(ticket.created_at)}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="font-medium text-gray-900">{ticket.tenant_name}</div>
                  <div className="text-sm text-gray-600">
                    {ticket.property_name} - Unit {ticket.unit}
                  </div>
                  <div className="text-sm text-gray-500">{ticket.tenant_phone}</div>
                </div>

                <div className="text-gray-800 mb-2">{ticket.issue_description}</div>

                {ticket.media_urls.length > 0 && (
                  <div className="text-xs text-gray-500 mb-2">
                    {ticket.media_urls.length} attachment(s)
                  </div>
                )}

                {/* Status Update Buttons */}
                {ticket.status !== 'closed' && (
                  <div className="flex gap-2 mt-3">
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
                        disabled={updatingTicket === ticket.id}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updatingTicket === ticket.id ? 'Updating...' : 'Start Work'}
                      </button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                        disabled={updatingTicket === ticket.id}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {updatingTicket === ticket.id ? 'Updating...' : 'Mark Resolved'}
                      </button>
                    )}
                    {ticket.status === 'resolved' && (
                      <button
                        onClick={() => handleStatusUpdate(ticket.id, 'closed')}
                        disabled={updatingTicket === ticket.id}
                        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        {updatingTicket === ticket.id ? 'Updating...' : 'Close Ticket'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
