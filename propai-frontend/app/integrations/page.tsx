"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import AuthWrapper from "@/components/AuthWrapper";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Users, 
  FileText, 
  Activity,
  CheckCircle,
  RefreshCw,
  Zap,
  Send
} from "lucide-react";

interface DataFlowStats {
  total_events: number;
  inbound: {
    total: number;
    tenants: number;
    leases: number;
  };
  outbound: {
    total: number;
    communications: number;
    payments: number;
  };
  success_rate: number;
}

interface DataFlowEvent {
  id: string;
  timestamp: string;
  direction: string;
  type: string;
  status: string;
  details: any;
}

export default function IntegrationsPage() {
  const [stats, setStats] = useState<DataFlowStats | null>(null);
  const [events, setEvents] = useState<DataFlowEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sendingComm, setSendingComm] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        fetch(`${backendUrl}/api/data-flow/stats`),
        fetch(`${backendUrl}/api/data-flow/events`)
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events.slice(-20).reverse());
      }
    } catch (error) {
      console.error("Failed to load data flow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const simulateSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`${backendUrl}/api/data-flow/simulate-sync`, {
        method: "POST"
      });
      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Failed to simulate sync:", error);
    } finally {
      setSyncing(false);
    }
  };

  const simulateCommunication = async () => {
    setSendingComm(true);
    try {
      const response = await fetch(`${backendUrl}/api/data-flow/simulate-communication`, {
        method: "POST"
      });
      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Failed to simulate communication:", error);
    } finally {
      setSendingComm(false);
    }
  };

  if (loading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-background">
          <AnimatedBackground />
          <div className="relative z-10">
            <Topbar />
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-primary/40 border-t-primary rounded-full animate-spin"></div>
                <p className="text-foreground/70">Loading integrations...</p>
              </div>
            </div>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <AnimatedBackground />
        <div className="relative z-10">
          <Topbar />
          
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent mb-2">
                    Integrations
                  </h1>
                  <p className="text-foreground/70">Property management system data flow and synchronization</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={simulateSync}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 rounded-[19px] glass hover:bg-card/60 text-foreground/70 hover:text-foreground font-medium transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Simulate Sync'}
                  </button>
                  <button
                    onClick={simulateCommunication}
                    disabled={sendingComm}
                    className="flex items-center gap-2 px-6 py-3 rounded-[19px] bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                    {sendingComm ? 'Sending...' : 'Simulate Communication'}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="glass-strong rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stats.total_events}</div>
                  <div className="text-sm text-foreground/60">Total Events</div>
                </div>

                <div className="glass-strong rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <ArrowDownCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-400 mb-1">{stats.inbound.total}</div>
                  <div className="text-sm text-foreground/60">Inbound Syncs</div>
                </div>

                <div className="glass-strong rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <ArrowUpCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-1">{stats.outbound.total}</div>
                  <div className="text-sm text-foreground/60">Outbound Messages</div>
                </div>

                <div className="glass-strong rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.success_rate.toFixed(1)}%</div>
                  <div className="text-sm text-foreground/60">Success Rate</div>
                </div>
              </div>
            )}

            {/* Detailed Stats */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Inbound */}
                <div className="glass-strong rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center">
                      <ArrowDownCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Inbound Data</h3>
                      <p className="text-sm text-foreground/60">From Property Management System</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/50">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-foreground">Tenants Synced</span>
                      </div>
                      <span className="text-lg font-bold text-blue-400">{stats.inbound.tenants}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/50">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-foreground">Leases Synced</span>
                      </div>
                      <span className="text-lg font-bold text-blue-400">{stats.inbound.leases}</span>
                    </div>
                  </div>
                </div>

                {/* Outbound */}
                <div className="glass-strong rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center">
                      <ArrowUpCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Outbound Data</h3>
                      <p className="text-sm text-foreground/60">To Tenants & Stakeholders</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/50">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-foreground">Communications</span>
                      </div>
                      <span className="text-lg font-bold text-green-400">{stats.outbound.communications}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/50">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-foreground">Payment Reminders</span>
                      </div>
                      <span className="text-lg font-bold text-green-400">{stats.outbound.payments}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Events */}
            <div className="glass-strong rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Events</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg glass hover:bg-card/60 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {event.direction === 'inbound' ? (
                            <ArrowDownCircle className="w-4 h-4 text-blue-400" />
                          ) : (
                            <ArrowUpCircle className="w-4 h-4 text-green-400" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {event.type === 'tenant' ? 'Tenant Sync' : 
                               event.type === 'lease' ? 'Lease Sync' :
                               event.type === 'communication' ? 'Communication' :
                               event.type === 'payment' ? 'Payment Reminder' : event.type}
                            </p>
                            <p className="text-xs text-foreground/60">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'success' 
                            ? 'bg-green-400/10 text-green-400' 
                            : 'bg-orange-400/10 text-orange-400'
                        }`}>
                          {event.status}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-foreground/60">
                    No recent events
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}
