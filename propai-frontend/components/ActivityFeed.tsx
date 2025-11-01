"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, XCircle, Clock, Mail, Calendar, UserPlus, AlertCircle } from "lucide-react";

interface ActivityEvent {
  id: string;
  type: "new_application" | "approved" | "rejected" | "email_sent" | "scheduled" | "tenant_replied";
  message: string;
  timestamp: string;
  applicationId?: string;
  applicantName?: string;
}

interface ActivityFeedProps {
  applications: any[];
  className?: string;
}

export default function ActivityFeed({ applications, className = "" }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    // Generate activity events from applications
    const newEvents: ActivityEvent[] = [];
    
    applications.forEach((app) => {
      const receivedAt = new Date(app.receivedAt);
      const now = new Date();
      
      // Only show recent events (within last 24 hours)
      const hoursAgo = (now.getTime() - receivedAt.getTime()) / (1000 * 60 * 60);
      if (hoursAgo > 24) return;

      // Add "New application" event
      newEvents.push({
        id: `${app.id}_new`,
        type: "new_application",
        message: `New application from ${app.applicantName}${app.property ? ` for ${app.property.name}` : ""}`,
        timestamp: app.receivedAt,
        applicationId: app.id,
        applicantName: app.applicantName,
      });

      // Add status-based events
      if (app.status === "approved") {
        newEvents.push({
          id: `${app.id}_approved`,
          type: "approved",
          message: `${app.applicantName} APPROVED${app.creditScore ? ` (Credit: ${app.creditScore}` : ""}${app.monthlyIncome ? `, Income: ${(app.monthlyIncome / (app.property?.monthlyRent || 2000)).toFixed(1)}x)` : ""}`,
          timestamp: app.updatedAt || app.receivedAt,
          applicationId: app.id,
          applicantName: app.applicantName,
        });
        
        // If approved but not scheduled, likely awaiting tenant
        if (app.status === "approved" && !app.scheduledDate) {
          newEvents.push({
            id: `${app.id}_email`,
            type: "email_sent",
            message: `Approval email sent to ${app.applicantName}`,
            timestamp: app.updatedAt || app.receivedAt,
            applicationId: app.id,
            applicantName: app.applicantName,
          });
        }
      }

      if (app.status === "scheduled" && app.scheduledDate) {
        const scheduledDate = new Date(app.scheduledDate);
        const formattedDate = scheduledDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        newEvents.push({
          id: `${app.id}_scheduled`,
          type: "scheduled",
          message: `${app.applicantName} selected: ${formattedDate}`,
          timestamp: app.scheduledDate,
          applicationId: app.id,
          applicantName: app.applicantName,
        });
      }

      if (app.status === "rejected") {
        newEvents.push({
          id: `${app.id}_rejected`,
          type: "rejected",
          message: `${app.applicantName} REJECTED${app.screeningNotes ? ` (${app.screeningNotes.substring(0, 30)}...)` : ""}`,
          timestamp: app.updatedAt || app.receivedAt,
          applicationId: app.id,
          applicantName: app.applicantName,
        });
      }
    });

    // Sort by timestamp (newest first)
    newEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Limit to 20 most recent
    setEvents(newEvents.slice(0, 20));
  }, [applications]);

  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "new_application":
        return <UserPlus className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "email_sent":
        return <Mail className="w-4 h-4" />;
      case "scheduled":
        return <Calendar className="w-4 h-4" />;
      case "tenant_replied":
        return <Bell className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "new_application":
        return "text-blue-600 bg-blue-50";
      case "approved":
        return "text-emerald-600 bg-emerald-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      case "email_sent":
        return "text-indigo-600 bg-indigo-50";
      case "scheduled":
        return "text-purple-600 bg-purple-50";
      case "tenant_replied":
        return "text-amber-600 bg-amber-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div className="p-4 border-b border-slate-200 flex items-center gap-2">
        <Bell className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-900">Activity Feed</h3>
      </div>
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900">{event.message}</p>
                <p className="text-xs text-slate-500 mt-1">{formatTime(event.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

