"use client";

import { useState } from "react";
import Tabs from "@/components/Tabs";
import SectionCard from "@/components/SectionCard";
import TextHistory from "@/components/TextHistory";
import AIChat from "@/components/AIChat";
import RecentRequests from "@/components/RecentRequests";
import ImportantInfo from "@/components/ImportantInfo";
import MaintenanceTickets from "@/components/MaintenanceTickets";
import LeaseManagement from "@/components/LeaseManagement";
import PropertyContextComponent from "@/components/PropertyContext";
import { Trash2 } from "lucide-react";
import type { Property } from "@/lib/types";

export default function PropertyDetail({
  property,
  onRequestDelete,
}: {
  property: Property;
  onRequestDelete?: (p: Property) => void;
}) {
  const [tab, setTab] = useState("text");

  return (
    <div className="space-y-6">
      {/* Property Header */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="relative">
          <img
            src={property.photo ?? ""}
            alt={property.name ?? "Property photo"}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end justify-between">
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1">
                  {property.name ?? "—"}
                </h2>
                <p className="text-white/90 text-sm">
                  {property.context?.address ?? "—"}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onRequestDelete?.(property)}
                  className="p-2 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors group"
                  aria-label="Delete property"
                  title="Delete property"
                >
                  <Trash2 className="h-4 w-4 text-white group-hover:text-red-200 transition" />
                </button>
                <button 
                  onClick={() => alert("Edit property feature coming soon!")}
                  className="px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text History - Main Focus */}
        <div className="lg:col-span-2">
          <TextHistory phone={property.phone} propertyId={property.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="space-y-2">
              <button 
                onClick={() => alert("Maintenance request feature coming soon!")}
                className="w-full px-4 py-3 rounded-xl border hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-sm">New Request</div>
                  <div className="text-xs text-gray-500">Create maintenance request</div>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  // Focus on the text input in the TextHistory component
                  const textInput = document.querySelector('input[placeholder="Type a message..."]') as HTMLInputElement;
                  if (textInput) {
                    textInput.focus();
                    textInput.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-sm">Send Message</div>
                  <div className="text-xs text-gray-500">Text tenant directly</div>
                </div>
              </button>
              
              <button 
                onClick={() => alert("Scheduling feature coming soon!")}
                className="w-full px-4 py-3 rounded-xl border hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-sm">Schedule Visit</div>
                  <div className="text-xs text-gray-500">Book property inspection</div>
                </div>
              </button>
            </div>
          </SectionCard>

          {/* Property Info */}
          <SectionCard title="Property Details">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium">Address</div>
                  <div className="text-xs text-gray-500">{property.context?.address ?? "—"}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium">Phone</div>
                  <div className="text-xs text-gray-500">{property.phone}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium">Tenant</div>
                  <div className="text-xs text-gray-500">{property.context?.tenant_name ?? "—"}</div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Other Tabs */}
          <div className="space-y-4">
            <button
              onClick={() => setTab("ai")}
              className={`w-full px-4 py-3 rounded-xl border text-left transition-colors ${
                tab === "ai" ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-sm">AI Chat</div>
              <div className="text-xs text-gray-500">Chat with AI about this property</div>
            </button>
            
            <button
              onClick={() => setTab("req")}
              className={`w-full px-4 py-3 rounded-xl border text-left transition-colors ${
                tab === "req" ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-sm">Recent Requests</div>
              <div className="text-xs text-gray-500">View maintenance requests</div>
            </button>
            
            <button
              onClick={() => setTab("tickets")}
              className={`w-full px-4 py-3 rounded-xl border text-left transition-colors ${
                tab === "tickets" ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-sm">Maintenance Tickets</div>
              <div className="text-xs text-gray-500">View and manage maintenance issues</div>
            </button>
            
            <button
              onClick={() => setTab("context")}
              className={`w-full px-4 py-3 rounded-xl border text-left transition-colors ${
                tab === "context" ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-sm">Property Context</div>
              <div className="text-xs text-gray-500">AI-generated property insights</div>
            </button>
            
            <button
              onClick={() => setTab("leases")}
              className={`w-full px-4 py-3 rounded-xl border text-left transition-colors ${
                tab === "leases" ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-sm">Lease Documents</div>
              <div className="text-xs text-gray-500">Upload and manage lease agreements</div>
            </button>
            
            <button
              onClick={() => setTab("info")}
              className={`w-full px-4 py-3 rounded-xl border text-left transition-colors ${
                tab === "info" ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-sm">Important Info</div>
              <div className="text-xs text-gray-500">Property details and notes</div>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {tab === "ai" && (
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <AIChat context={property.context} phone={property.phone} propertyId={property.id} />
        </div>
      )}
      {tab === "req" && (
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <RecentRequests phone={property.phone} />
        </div>
      )}
      {tab === "tickets" && (
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <MaintenanceTickets />
        </div>
      )}
      {tab === "context" && (
        <PropertyContextComponent 
          propertyId={property.id} 
          propertyAddress={property.context?.address || property.address || ""}
        />
      )}
      {tab === "leases" && (
        <LeaseManagement 
          propertyId={property.id} 
          propertyName={property.name || "Property"} 
        />
      )}
      {tab === "info" && (
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <ImportantInfo context={property.context} phone={property.phone} />
        </div>
      )}
    </div>
  );
}