"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import PropertyDetail from "@/components/PropertyDetail";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { useProperties } from "@/lib/hooks/useProperties";
import type { Property } from "@/lib/types";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { properties, loading: propertiesLoading, deleteProperty } = useProperties();
  const [property, setProperty] = useState<Property | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth");
    }
  }, [session, status, router]);

  // Find the property by ID
  useEffect(() => {
    if (properties.length > 0) {
      const foundProperty = properties.find(p => p.id === params.id);
      if (foundProperty) {
        setProperty(foundProperty);
      } else {
        // Property not found, redirect to properties page
        router.push("/properties");
      }
    }
  }, [properties, params.id, router]);

  const confirmDelete = async (p: Property) => {
    try {
      await deleteProperty(p.id);
      router.push("/properties");
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  // Show loading while checking authentication or loading properties
  if (status === "loading" || propertiesLoading) {
    return (
      <div className="min-h-screen w-full text-slate-900 bg-white relative overflow-clip flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading property...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session?.user) {
    return null;
  }

  // Show loading if property not found yet
  if (!property) {
    return (
      <div className="min-h-screen w-full text-slate-900 bg-white relative overflow-clip flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-slate-900 bg-white relative overflow-clip">
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(59,130,246,0.25),transparent_60%),radial-gradient(900px_600px_at_100%_10%,rgba(147,51,234,0.18),transparent_60%),radial-gradient(700px_600px_at_0%_20%,rgba(16,185,129,0.18),transparent_60%)]"
      />

      <Topbar />

      <div className="max-w-7xl mx-auto px-6 pt-14 pb-28">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors font-medium group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to properties
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/messages"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Messages
              </Link>
              <Link
                href="/maintenance"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Maintenance
              </Link>
              <button
                onClick={() => setPendingDelete(property)}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Property
              </button>
            </div>
          </div>
        </div>

        {/* Property Detail */}
        <PropertyDetail
          property={property}
          onRequestDelete={setPendingDelete}
        />
      </div>

      <ConfirmDeleteModal
        property={pendingDelete}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
