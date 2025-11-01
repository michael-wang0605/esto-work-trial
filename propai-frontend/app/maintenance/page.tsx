"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import AuthWrapper from "@/components/AuthWrapper";
import MaintenanceTickets from "@/components/MaintenanceTickets";
import { Wrench, AlertTriangle, Clock, CheckCircle, Filter } from "lucide-react";

interface MaintenanceStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export default function MaintenancePage() {
  const [stats, setStats] = useState<MaintenanceStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/maintenance-tickets');
      if (response.ok) {
        const data = await response.json();
        const tickets = data.tickets || [];
        
        setStats({
          total: tickets.length,
          open: tickets.filter((t: any) => t.status === 'open').length,
          inProgress: tickets.filter((t: any) => t.status === 'in_progress').length,
          resolved: tickets.filter((t: any) => t.status === 'resolved').length
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
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
                <p className="text-foreground/70">Loading maintenance tickets...</p>
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
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent mb-2">
                Maintenance
              </h1>
              <p className="text-foreground/70">Track and manage maintenance requests across all properties</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <button
                onClick={() => setFilter('all')}
                className={`glass-strong rounded-xl p-6 text-left transition-all hover:scale-[1.02] ${
                  filter === 'all' ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stats.total}</div>
                <div className="text-sm text-foreground/60">Total Tickets</div>
              </button>

              <button
                onClick={() => setFilter('open')}
                className={`glass-strong rounded-xl p-6 text-left transition-all hover:scale-[1.02] ${
                  filter === 'open' ? 'ring-2 ring-orange-400' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  {stats.open > 0 && (
                    <span className="px-2 py-1 rounded-full bg-orange-400/10 text-orange-400 text-xs font-medium">
                      {stats.open}
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-1">{stats.open}</div>
                <div className="text-sm text-foreground/60">Open</div>
              </button>

              <button
                onClick={() => setFilter('in_progress')}
                className={`glass-strong rounded-xl p-6 text-left transition-all hover:scale-[1.02] ${
                  filter === 'in_progress' ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-1">{stats.inProgress}</div>
                <div className="text-sm text-foreground/60">In Progress</div>
              </button>

              <button
                onClick={() => setFilter('resolved')}
                className={`glass-strong rounded-xl p-6 text-left transition-all hover:scale-[1.02] ${
                  filter === 'resolved' ? 'ring-2 ring-green-400' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400 mb-1">{stats.resolved}</div>
                <div className="text-sm text-foreground/60">Resolved</div>
              </button>
            </div>

            {/* Filter Info */}
            {filter !== 'all' && (
              <div className="mb-6 flex items-center gap-2">
                <Filter className="w-4 h-4 text-foreground/60" />
                <span className="text-sm text-foreground/70">
                  Showing <span className="font-semibold text-foreground">{filter.replace('_', ' ')}</span> tickets
                </span>
                <button
                  onClick={() => setFilter('all')}
                  className="text-sm text-primary hover:text-primary/80 font-medium ml-2"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Tickets List */}
            <div className="glass-strong rounded-xl p-6">
              <MaintenanceTickets filter={filter} onUpdate={loadStats} />
            </div>

            {/* Empty State */}
            {stats.total === 0 && (
              <div className="glass-strong rounded-xl p-12 text-center mt-8">
                <Wrench className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No maintenance tickets yet</h3>
                <p className="text-foreground/60">
                  Maintenance requests will appear here when tenants submit them
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}
