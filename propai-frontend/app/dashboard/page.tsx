"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import AuthWrapper from "@/components/AuthWrapper";
import PropertyCard from "@/components/PropertyCard";
import AddPropertyCard from "@/components/AddPropertyCard";
import Modal from "@/components/Modal";
import AddPropertyForm from "@/components/AddPropertyForm";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { useProperties } from "@/lib/hooks/useProperties";
import { getMaintenanceTickets } from "@/lib/api";
import type { Property } from "@/lib/types";
import { MessageSquare, Wrench, Building2, Clock, AlertTriangle, CheckCircle, ArrowRight, TrendingUp, FileText } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const { properties, loading: propertiesLoading, createProperty, deleteProperty } = useProperties();
  const [showAdd, setShowAdd] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);
  const [maintenanceStats, setMaintenanceStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });

  // Load maintenance stats
  useEffect(() => {
    loadMaintenanceStats();
  }, []);

  const loadMaintenanceStats = async () => {
    try {
      const response = await getMaintenanceTickets();
      const tickets = response.tickets || [];
      
      setMaintenanceStats({
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length
      });
    } catch (error) {
      console.error('Failed to load maintenance stats:', error);
    }
  };

  const handleAddPropertyClick = () => {
    setShowAdd(true);
  };

  const handleCreate = async (p: Omit<Property, 'id'>) => {
    try {
      await createProperty(p);
      setShowAdd(false);
    } catch (error) {
      console.error('Failed to create property:', error);
    }
  };

  const confirmDelete = async (p: Property) => {
    try {
      await deleteProperty(p.id);
      setPendingDelete(null);
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  if (propertiesLoading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-background">
          <AnimatedBackground />
          <div className="relative z-10">
            <Topbar />
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-primary/40 border-t-primary rounded-full animate-spin"></div>
                <p className="text-foreground/70">Loading dashboard...</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent mb-2">
                    Dashboard
                  </h1>
                  <p className="text-foreground/70">Welcome back, {session?.user?.name || 'User'}!</p>
                </div>
                <button
                  onClick={handleAddPropertyClick}
                  className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-[19px] bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  <Building2 className="w-5 h-5" />
                  Add Property
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass-strong rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{properties.length}</div>
                <div className="text-sm text-foreground/60">Total Properties</div>
              </div>

              <div className="glass-strong rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Wrench className="w-5 h-5 text-orange-400" />
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-400/10 text-orange-400">{maintenanceStats.open}</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{maintenanceStats.total}</div>
                <div className="text-sm text-foreground/60">Maintenance Tickets</div>
              </div>

              <div className="glass-strong rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{maintenanceStats.inProgress}</div>
                <div className="text-sm text-foreground/60">In Progress</div>
              </div>

              <div className="glass-strong rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{maintenanceStats.resolved}</div>
                <div className="text-sm text-foreground/60">Resolved</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Link
                href="/messages"
                className="glass-strong rounded-xl p-6 hover:scale-[1.02] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Messages</h3>
                    <p className="text-sm text-foreground/60">View all tenant conversations</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <Link
                href="/maintenance"
                className="glass-strong rounded-xl p-6 hover:scale-[1.02] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-400/10 rounded-xl flex items-center justify-center group-hover:bg-orange-400/20 transition-colors">
                    <Wrench className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Maintenance</h3>
                    <p className="text-sm text-foreground/60">Manage maintenance tickets</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground/40 group-hover:text-orange-400 transition-colors" />
                </div>
              </Link>

              <Link
                href="/dashboard/applications"
                className="glass-strong rounded-xl p-6 hover:scale-[1.02] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center group-hover:bg-blue-400/20 transition-colors">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Applications</h3>
                    <p className="text-sm text-foreground/60">View tenant applications</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground/40 group-hover:text-blue-400 transition-colors" />
                </div>
              </Link>

              <Link
                href="/properties"
                className="glass-strong rounded-xl p-6 hover:scale-[1.02] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-400/10 rounded-xl flex items-center justify-center group-hover:bg-green-400/20 transition-colors">
                    <Building2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Properties</h3>
                    <p className="text-sm text-foreground/60">Manage your properties</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground/40 group-hover:text-green-400 transition-colors" />
                </div>
              </Link>
            </div>

            {/* Properties Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Your Properties</h2>
                <button
                  onClick={handleAddPropertyClick}
                  className="sm:hidden flex items-center gap-2 px-4 py-2 rounded-[19px] bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20"
                >
                  <Building2 className="w-4 h-4" />
                  Add Property
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onDelete={() => setPendingDelete(property)}
                  />
                ))}
                <AddPropertyCard onClick={handleAddPropertyClick} />
              </div>
            </div>

            {/* Maintenance Overview */}
            {maintenanceStats.total > 0 && (
              <div className="glass-strong rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Maintenance Overview</h2>
                  <Link
                    href="/maintenance"
                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-card/40 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                      <span className="font-semibold text-foreground">Open</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-400">{maintenanceStats.open}</div>
                    <div className="text-sm text-foreground/60 mt-1">Needs attention</div>
                  </div>

                  <div className="p-4 rounded-xl bg-card/40 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-foreground">In Progress</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">{maintenanceStats.inProgress}</div>
                    <div className="text-sm text-foreground/60 mt-1">Being worked on</div>
                  </div>

                  <div className="p-4 rounded-xl bg-card/40 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-foreground">Resolved</span>
                    </div>
                    <div className="text-3xl font-bold text-green-400">{maintenanceStats.resolved}</div>
                    <div className="text-sm text-foreground/60 mt-1">Completed</div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Property">
        <AddPropertyForm onCreate={handleCreate} onCancel={() => setShowAdd(false)} />
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && confirmDelete(pendingDelete)}
        title={pendingDelete?.name || ''}
      />
    </AuthWrapper>
  );
}
