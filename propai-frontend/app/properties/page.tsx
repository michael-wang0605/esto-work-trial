"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import SearchBar from "@/components/SearchBar";
import AuthWrapper from "@/components/AuthWrapper";
import PropertyCard from "@/components/PropertyCard";
import AddPropertyCard from "@/components/AddPropertyCard";
import Modal from "@/components/Modal";
import AddPropertyForm from "@/components/AddPropertyForm";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { useProperties } from "@/lib/hooks/useProperties";
import type { Property } from "@/lib/types";
import { Building2, Plus, Search } from "lucide-react";

export default function PropertiesPage() {
  const router = useRouter();
  const { properties, loading: propertiesLoading, createProperty, deleteProperty } = useProperties();
  const [showAdd, setShowAdd] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter properties based on search term
  const filteredProperties = properties.filter(property =>
    property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.phone?.includes(searchTerm) ||
    property.tenantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <p className="text-foreground/70">Loading properties...</p>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent mb-2">
                    Properties
                  </h1>
                  <p className="text-foreground/70">Manage your rental properties and tenant communications</p>
                </div>
                <button
                  onClick={handleAddPropertyClick}
                  className="flex items-center gap-2 px-6 py-3 rounded-[19px] bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Property
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search properties by name, address, or tenant..."
                  className="w-full pl-12 pr-4 py-3 glass-strong rounded-[19px] bg-input border border-border/50 text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Properties Grid */}
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AddPropertyCard onClick={handleAddPropertyClick} />
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onDelete={() => setPendingDelete(property)}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-strong rounded-xl p-12 text-center">
                <Building2 className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                {searchTerm ? (
                  <>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No properties found</h3>
                    <p className="text-foreground/60 mb-6">
                      No properties match your search for &quot;{searchTerm}&quot;
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="px-6 py-2 rounded-[19px] glass hover:bg-card/60 text-primary font-medium transition-all"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No properties yet</h3>
                    <p className="text-foreground/60 mb-6">
                      Get started by adding your first property
                    </p>
                    <button
                      onClick={handleAddPropertyClick}
                      className="px-6 py-3 rounded-[19px] bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                      Add Property
                    </button>
                  </>
                )}
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
