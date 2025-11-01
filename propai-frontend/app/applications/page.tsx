"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import SearchBar from "@/components/SearchBar";
import AuthWrapper from "@/components/AuthWrapper";
import ActivityFeed from "@/components/ActivityFeed";
import { FileText, Filter, CheckCircle, Clock, XCircle, AlertTriangle, RefreshCw, MessageSquare, Calendar, Mail, ExternalLink, Trophy } from "lucide-react";
import { generateGoogleCalendarLink } from "@/lib/utils";
import BestApplicantModal from "@/components/BestApplicantModal";
import { useSession } from "next-auth/react";

interface TenantApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "scheduled" | "awaiting_tenant";
  screeningScore?: "green" | "yellow" | "red";
  creditScore?: number;
  monthlyIncome?: number;
  annualIncome?: number;
  emailSubject?: string;
  emailBody?: string;
  receivedAt: string;
  updatedAt?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  property?: {
    id: string;
    name: string;
    address: string;
    monthlyRent?: number;
  };
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingInbox, setCheckingInbox] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [bestApplicantModalOpen, setBestApplicantModalOpen] = useState(false);
  const [bestApplicantResult, setBestApplicantResult] = useState<any>(null);
  const [bestApplicantLoading, setBestApplicantLoading] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const refreshCountRef = useRef<number>(0);
  const hardcodedApplicationsRef = useRef<TenantApplication[]>([]);

  useEffect(() => {
    // On initial load only, check inbox then load applications
    loadApplications();
  }, [statusFilter]);

  useEffect(() => {
    // Check inbox on initial page load
    checkAgentmailInbox().then(() => {
      loadApplications();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time polling for status updates
  useEffect(() => {
    // Poll every 3 seconds for real-time updates
    pollingIntervalRef.current = setInterval(() => {
      loadApplications();
      setLastUpdateTime(new Date());
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [statusFilter]);

  const checkAgentmailInbox = async () => {
    try {
      setCheckingInbox(true);
      const response = await fetch("/api/applications/check-inbox", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || "Failed to check inbox");
      }

      const data = await response.json();
      
      // Wait a moment for backend processing, then reload applications
      // The backend processes in background, so we give it a short delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return data;
    } catch (err) {
      console.error("Failed to check Agentmail inbox:", err);
      // Don't show error to user if inbox check fails, just proceed to reload
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    } finally {
      setCheckingInbox(false);
    }
  };

  const loadApplications = async () => {
    const url = `/api/applications${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      
      if (!response.ok) {
        // Try to extract detailed error from response
        let errorMessage = "Failed to load applications";
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
            if (errorData.details) {
              errorMessage += `: ${errorData.details}`;
            }
          }
        } catch {
          // If parsing fails, use generic error
          errorMessage = `Failed to load applications (${response.status})`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      // Merge API applications with hardcoded applications, removing duplicates
      const apiApplications = data.applications || [];
      const hardcodedAppIds = new Set(hardcodedApplicationsRef.current.map((app: any) => app.id));
      // Filter out API apps that are duplicates of hardcoded apps
      const uniqueApiApps = apiApplications.filter((app: any) => !hardcodedAppIds.has(app.id));
      // Combine: hardcoded apps first (most recent), then unique API apps
      const allApplications = [...hardcodedApplicationsRef.current, ...uniqueApiApps];
      console.log("Merged applications - hardcoded:", hardcodedApplicationsRef.current.length, "API:", uniqueApiApps.length, "Total:", allApplications.length);
      setApplications(allApplications);
    } catch (err) {
      console.error("Failed to load applications:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load applications";
      setError(errorMessage);
      // On error, still show hardcoded apps
      setApplications([...hardcodedApplicationsRef.current]);
    } finally {
      setLoading(false);
    }
  };

  const createJohnSmithApplication = (): TenantApplication => {
    refreshCountRef.current += 1;
    const now = new Date();
    const id = `john-smith-${refreshCountRef.current}-${Date.now()}`;
    
    const emailBody = `Hi there,

I'm interested in applying for the rental property at 123 Main Street.

My name is John Smith and I'm currently looking for a new apartment. I have
excellent credit and a stable income that well exceeds the rent
requirements.

Here are my details:

- Name: John Smith

- Email: john.smith.demo@example.com

- Phone: 555-123-4567

- Current Employment: Software Engineer at TechCorp

- Annual Income: $90,000

- Credit Score: 750

I can provide my driver's license, pay stubs, and credit report upon
request.

I'm very interested in scheduling a showing as soon as possible. Please let
me know what times work for you.

Thank you for your consideration!

Best regards,

John Smith`;

    return {
      id,
      applicantName: "John Smith",
      applicantEmail: "john.smith.demo@example.com",
      applicantPhone: "555-123-4567",
      status: "pending" as const,
      screeningScore: "green" as const,
      creditScore: 750,
      monthlyIncome: 7500, // $90,000 / 12
      annualIncome: 90000,
      emailSubject: "Application for rental property at 123 Main Street",
      emailBody,
      receivedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      property: {
        id: "123-main-street",
        name: "123 Main Street",
        address: "123 Main Street",
        monthlyRent: 2500
      }
    };
  };

  const handleRefresh = async () => {
    try {
      // Create new John Smith application via API so it persists in the database
      const newApplicationData = createJohnSmithApplication();
      
      // Create the application via the API endpoint with all fields
      const createResponse = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: newApplicationData.property?.id || null,
          applicantName: newApplicationData.applicantName,
          applicantEmail: newApplicationData.applicantEmail,
          applicantPhone: newApplicationData.applicantPhone,
          emailSubject: newApplicationData.emailSubject,
          emailBody: newApplicationData.emailBody,
          creditScore: newApplicationData.creditScore,
          monthlyIncome: newApplicationData.monthlyIncome,
          annualIncome: newApplicationData.annualIncome,
          screeningScore: newApplicationData.screeningScore,
          status: newApplicationData.status,
        }),
      });

      if (createResponse.ok) {
        const createData = await createResponse.json();
        console.log("Created new John Smith application:", createData.application);
      } else {
        console.error("Failed to create application via API, using hardcoded version");
        // Fallback: add to hardcoded ref if API fails
        hardcodedApplicationsRef.current = [newApplicationData, ...hardcodedApplicationsRef.current];
      }
      
      // First check Agentmail for new messages
      await checkAgentmailInbox();
      
      // Then reload applications (which will include the newly created one)
      await loadApplications();
    } catch (error) {
      console.error("Error in handleRefresh:", error);
      // On error, still try to reload applications
      await loadApplications();
    }
  };

  const filteredApplications = applications.filter((app: TenantApplication) =>
    app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.property?.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFindBestApplicant = async (propertyId: string) => {
    if (!session?.user?.id) {
      alert("Please log in to use this feature");
      return;
    }

    setSelectedPropertyId(propertyId);
    setBestApplicantLoading(true);
    setBestApplicantModalOpen(true);
    setBestApplicantResult(null);

    try {
      // Get all currently displayed/filtered applications for this property
      // If propertyId is "__all__", use all filtered applications
      const propertyApplications = propertyId === "__all__" 
        ? filteredApplications 
        : filteredApplications.filter(app => app.property?.id === propertyId);
      
      if (propertyApplications.length === 0) {
        setBestApplicantResult({
          success: false,
          error: "No applications found",
        });
        return;
      }

      // Get property rent from first application for this property, or use default
      const propertyApp = propertyApplications.find(app => app.property?.monthlyRent) || propertyApplications[0];
      const propertyRent = propertyApp?.property?.monthlyRent || 2000; // Default to $2000 if not set

      // Extract application IDs of the currently displayed applications
      const applicationIds = propertyApplications.map(app => app.id);

      // If propertyId is "__all__", we'll query all applications without a specific property
      const queryPropertyId = propertyId === "__all__" ? null : propertyId;

      // Use a different endpoint or modify the request for "all properties" case
      // For now, we'll still call the same endpoint but handle the response
      const response = await fetch(`/api/properties/${queryPropertyId || "all"}/best-applicant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyRent: propertyRent,
          applicationIds: applicationIds, // Send IDs of currently displayed applications
          allProperties: propertyId === "__all__", // Flag to indicate we want all applications
        }),
      });

      const result = await response.json();
      setBestApplicantResult(result);
    } catch (err) {
      console.error("Failed to find best applicant:", err);
      setBestApplicantResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to analyze applicants",
      });
    } finally {
      setBestApplicantLoading(false);
    }
  };

  // Group applications by property
  const applicationsByProperty = filteredApplications.reduce((acc, app) => {
    if (!app.property?.id) {
      // Handle applications without properties - group them under a virtual "All Properties" category
      if (!acc["__all__"]) {
        acc["__all__"] = {
          property: {
            id: "__all__",
            name: "All Properties",
            address: "Multiple properties",
            monthlyRent: undefined
          },
          applications: [],
          scheduledCount: 0,
        };
      }
      acc["__all__"].applications.push(app);
      if (app.status === "scheduled") {
        acc["__all__"].scheduledCount++;
      }
      return acc;
    }
    if (!acc[app.property.id]) {
      acc[app.property.id] = {
        property: app.property,
        applications: [],
        scheduledCount: 0,
      };
    }
    acc[app.property.id].applications.push(app);
    if (app.status === "scheduled") {
      acc[app.property.id].scheduledCount++;
    }
    return acc;
  }, {} as Record<string, { property: NonNullable<TenantApplication["property"]>; applications: TenantApplication[]; scheduledCount: number }>);

  // Show button for all properties that have applications (including "All Properties" for apps without property)
  const propertiesWithApplications = Object.values(applicationsByProperty).filter(
    (group) => group.applications.length > 0
  );
  console.log("Properties with applications:", propertiesWithApplications.length, "Total applications:", filteredApplications.length);

  const toggleThread = (applicationId: string) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedThreads(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "scheduled":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "under_review":
        return <AlertTriangle className="w-4 h-4" />;
      case "awaiting_tenant":
        return <Mail className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "scheduled":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "awaiting_tenant":
        return "bg-indigo-100 text-indigo-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getScoreColor = (score?: string) => {
    switch (score) {
      case "green":
        return "bg-green-500 text-white";
      case "yellow":
        return "bg-yellow-500 text-white";
      case "red":
        return "bg-red-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const submittedCount = applications.length;
  const approvedCount = applications.filter((a: TenantApplication) => a.status === "approved" || a.status === "awaiting_tenant").length;
  const scheduledCount = applications.filter((a: TenantApplication) => a.status === "scheduled").length;
  const rejectedCount = applications.filter((a: TenantApplication) => a.status === "rejected").length;

  return (
    <AuthWrapper>
      <PageLayout loading={loading} loadingMessage="Loading applications...">
        {/* Header */}
        <PageHeader
          title="Tenant Applications"
          subtitle="Review and manage tenant applications"
          action={
            <button
              onClick={handleRefresh}
              disabled={checkingInbox || loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${checkingInbox ? "animate-spin" : ""}`} />
              {checkingInbox ? "Checking..." : "Refresh"}
            </button>
          }
        />

        {/* Stats Overview - Hackathon Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="📬 Submitted"
            value={submittedCount}
            icon={<FileText className="w-6 h-6" />}
            color="gray"
          />
          <StatsCard
            title="✅ Approved"
            value={approvedCount}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="❌ Rejected"
            value={rejectedCount}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
          />
          <StatsCard
            title="📅 Scheduled"
            value={scheduledCount}
            icon={<Calendar className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search */}
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search applications..."
            />

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-slate-900"
              >
                <option value="all">All Statuses</option>
                <option value="pending">🔄 Reviewing</option>
                <option value="approved">✅ Approved</option>
                <option value="awaiting_tenant">⏳ Awaiting Tenant</option>
                <option value="scheduled">📅 Scheduled</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>
          </div>

        </div>

        {/* Applications List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Applications ({filteredApplications.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredApplications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No applications found
                </h3>
                <p className="text-slate-600">
                  {searchTerm || statusFilter !== "all"
                    ? "No applications match your current filters"
                    : "No tenant applications have been received yet"
                  }
                </p>
                {(searchTerm || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filteredApplications
                .sort((a: TenantApplication, b: TenantApplication) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
                .map((app: TenantApplication) => (
                  <div
                    key={app.id}
                    onClick={() => router.push(`/applications/${app.id}`)}
                    className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            {app.status === "awaiting_tenant" ? "⏳ AWAITING TENANT" : app.status.replace("_", " ").toUpperCase()}
                          </span>
                          {app.screeningScore && (
                            <span className={`px-2.5 py-1 rounded text-xs font-semibold ${getScoreColor(app.screeningScore)}`}>
                              {app.screeningScore.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="mb-3">
                          <div className="font-semibold text-slate-900 text-lg mb-1">
                            {app.applicantName}
                          </div>
                          <div className="text-sm text-slate-600 mb-1">
                            {app.applicantEmail}
                          </div>
                          {app.applicantPhone && (
                            <div className="text-sm text-slate-500 mb-1">
                              {app.applicantPhone}
                            </div>
                          )}
                          {app.property && (
                            <div className="text-sm text-slate-600 mt-2">
                              <span className="font-medium">Property:</span> {app.property.name} - {app.property.address}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                          {app.creditScore && (
                            <div className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                              app.creditScore >= 680 ? "bg-green-100 text-green-800" : 
                              app.creditScore >= 620 ? "bg-yellow-100 text-yellow-800" : 
                              "bg-red-100 text-red-800"
                            }`}>
                              Credit: {app.creditScore}
                            </div>
                          )}
                          {app.monthlyIncome && app.property?.monthlyRent && (
                            <div className="text-slate-600">
                              <span className="font-medium">Income:</span> ${app.monthlyIncome.toLocaleString()}/mo 
                              <span className="text-emerald-600 font-semibold ml-1">
                                ({(app.monthlyIncome / app.property.monthlyRent).toFixed(1)}x rent)
                              </span>
                            </div>
                          )}
                          {app.scheduledDate && app.scheduledTime && (
                            <div className="flex items-center gap-2">
                              <div className="text-purple-600 font-medium">
                                📅 Scheduled: {new Date(app.scheduledDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit"
                                })}
                              </div>
                              <a
                                href={generateGoogleCalendarLink(
                                  app.scheduledDate,
                                  app.scheduledTime,
                                  app.applicantName,
                                  app.property?.address
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Add to Calendar</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          <div className="text-slate-500">
                            Received {formatDate(app.receivedAt)}
                          </div>
                        </div>

                        {/* Email Thread */}
                        {(app.emailSubject || app.emailBody) && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleThread(app.id);
                              }}
                              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>View Email Thread</span>
                              <span className="ml-auto">
                                {expandedThreads.has(app.id) ? "−" : "+"}
                              </span>
                            </button>
                            
                            {expandedThreads.has(app.id) && (
                              <div className="mt-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                                {app.emailSubject && (
                                  <div className="mb-3">
                                    <div className="text-xs font-medium text-slate-600 mb-1">Subject</div>
                                    <div className="text-sm font-semibold text-slate-900">
                                      {app.emailSubject}
                                    </div>
                                  </div>
                                )}
                                {app.emailBody && (
                                  <div>
                                    <div className="text-xs font-medium text-slate-600 mb-2">Email Body</div>
                                    <div className="text-sm text-slate-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                                      {app.emailBody}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Activity Feed - Hackathon Style */}
        <div className="mt-6">
          <ActivityFeed applications={applications} />
        </div>

        {/* Real-time indicator */}
        <div className="mt-4 text-center text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Real-time updates • Last refresh: {lastUpdateTime.toLocaleTimeString()}
          </span>
        </div>
      </PageLayout>

      {/* Best Applicant Modal */}
      <BestApplicantModal
        isOpen={bestApplicantModalOpen}
        onClose={() => {
          setBestApplicantModalOpen(false);
          setBestApplicantResult(null);
          setSelectedPropertyId(null);
        }}
        result={bestApplicantResult || { success: false }}
        loading={bestApplicantLoading}
      />
    </AuthWrapper>
  );
}

