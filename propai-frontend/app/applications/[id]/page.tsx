"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import AuthWrapper from "@/components/AuthWrapper";
import SectionCard from "@/components/SectionCard";
import Tabs from "@/components/Tabs";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Building2,
  CreditCard,
  DollarSign,
  Calendar,
  FileCheck,
  Send,
  RefreshCw,
  Download,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { generateGoogleCalendarLink } from "@/lib/utils";

interface BackgroundCheckResult {
  report_id?: string;
  overall_status?: "pass" | "review" | "fail";
  criminal_history?: {
    status?: "pass" | "review" | "fail";
    summary?: string;
    jurisdictions_checked?: string[];
    records?: Array<{
      offense?: string;
      date?: string;
      status?: string;
    }>;
  };
  eviction_history?: {
    status?: "pass" | "review" | "fail";
    summary?: string;
    databases_checked?: string[];
    records?: Array<{
      reason?: string;
      date?: string;
      status?: string;
    }>;
  };
  employment_verification?: {
    status?: "verified" | "pending" | "not_provided";
    summary?: string;
    details?: {
      employer?: string;
    };
  };
  identity_verification?: {
    status?: "verified" | "partial";
    summary?: string;
    details?: {
      name_match?: boolean;
      dob_verified?: boolean;
      license_verified?: boolean;
      ssn_verified?: boolean;
    };
  };
  credit_check?: {
    status?: "excellent" | "good" | "fair" | "poor" | "not_provided";
    summary?: string;
    bureaus_checked?: string[];
  };
}

interface TenantApplication {
  id: string;
  userId: string;
  propertyId?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  emailSubject?: string;
  emailBody?: string;
  receivedAt: string;
  driversLicenseUrl?: string;
  driversLicenseText?: string;
  payStubUrls: string[];
  payStubTexts: string[];
  creditScoreUrl?: string;
  creditScoreText?: string;
  licenseName?: string;
  licenseDOB?: string;
  licenseExpiration?: string;
  licenseNumber?: string;
  employerName?: string;
  monthlyIncome?: number;
  annualIncome?: number;
  payFrequency?: string;
  creditScore?: number;
  creditScoreDate?: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "scheduled";
  screeningScore?: "green" | "yellow" | "red";
  screeningNotes?: string;
  calendarEventId?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  showingConfirmed: boolean;
  backgroundCheckResult?: BackgroundCheckResult;
  backgroundCheckCompletedAt?: string;
  property?: {
    id: string;
    name: string;
    address: string;
    settings?: {
      parkingInstructions?: string;
    };
  };
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [application, setApplication] = useState<TenantApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/applications/${id}`);
      if (!response.ok) {
        throw new Error("Failed to load application");
      }
      const data = await response.json();
      setApplication(data.application);
    } catch (err) {
      console.error("Failed to load application:", err);
      setError(err instanceof Error ? err.message : "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDocuments = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/applications/${id}/process`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to process documents");
      }
      await loadApplication();
    } catch (err) {
      console.error("Error processing documents:", err);
      alert("Failed to process documents. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCalculateScore = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/applications/${id}/calculate-score`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to calculate score");
      }
      await loadApplication();
    } catch (err) {
      console.error("Error calculating score:", err);
      alert("Failed to calculate score. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRunBackgroundCheck = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/applications/${id}/background-check`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to run background check");
      }
      await loadApplication();
    } catch (err) {
      console.error("Error running background check:", err);
      alert("Failed to run background check. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/applications/${id}/approve`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to approve application");
      }
      await loadApplication();
    } catch (err) {
      console.error("Error approving:", err);
      alert("Failed to approve application. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this application?")) {
      return;
    }
    try {
      setProcessing(true);
      const response = await fetch(`/api/applications/${id}/reject`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to reject application");
      }
      await loadApplication();
    } catch (err) {
      console.error("Error rejecting:", err);
      alert("Failed to reject application. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <AuthWrapper>
        <PageLayout loading={true} loadingMessage="Loading application..." />
      </AuthWrapper>
    );
  }

  if (error || !application) {
    return (
      <AuthWrapper>
        <PageLayout>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Application not found
            </h3>
            <p className="text-slate-600 mb-4">{error || "This application does not exist"}</p>
            <button
              onClick={() => router.push("/applications")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Applications
            </button>
          </div>
        </PageLayout>
      </AuthWrapper>
    );
  }

  const getStatusBadge = () => {
    const statusConfig = {
      pending: { color: "bg-amber-100 text-amber-800", icon: <Clock className="w-4 h-4" /> },
      under_review: { color: "bg-blue-100 text-blue-800", icon: <AlertTriangle className="w-4 h-4" /> },
      approved: { color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle className="w-4 h-4" /> },
      scheduled: { color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle className="w-4 h-4" /> },
      rejected: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-4 h-4" /> },
    };

    const config = statusConfig[application.status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${config.color}`}>
        {config.icon}
        {application.status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const getScoreBadge = () => {
    if (!application.screeningScore) return null;
    const colors = {
      green: "bg-green-500 text-white",
      yellow: "bg-yellow-500 text-white",
      red: "bg-red-500 text-white",
    };
    return (
      <span className={`px-3 py-1 rounded text-sm font-medium ${colors[application.screeningScore]}`}>
        {application.screeningScore.toUpperCase()}
      </span>
    );
  };

  return (
    <AuthWrapper>
      <PageLayout>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-slate-900">
                {application.applicantName}
              </h1>
              {getStatusBadge()}
              {getScoreBadge()}
            </div>
            <p className="text-slate-600 text-lg">
              Application received {new Date(application.receivedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={loadApplication}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleProcessDocuments}
              disabled={processing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              {processing ? "Processing..." : "Process Documents"}
            </button>
            <button
              onClick={handleCalculateScore}
              disabled={processing || !application.creditScore}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Calculate Score
            </button>
            <button
              onClick={handleRunBackgroundCheck}
              disabled={processing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Run Background Check
            </button>
            {application.status !== "approved" && application.status !== "scheduled" && (
              <button
                onClick={handleApprove}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            )}
            {application.status !== "rejected" && (
              <button
                onClick={handleReject}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            )}
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs
          items={[
            { key: "overview", label: "Overview" },
            { key: "documents", label: "Documents" },
            { key: "screening", label: "Screening" },
            { key: "background", label: "Background Check" },
            { key: "scheduling", label: "Scheduling" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Contact Information */}
            <SectionCard title="Contact Information">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-600">Name</div>
                    <div className="font-medium">{application.applicantName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-600">Email</div>
                    <div className="font-medium">{application.applicantEmail}</div>
                  </div>
                </div>
                {application.applicantPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-600">Phone</div>
                      <div className="font-medium">{application.applicantPhone}</div>
                    </div>
                  </div>
                )}
                {application.property && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-600">Property</div>
                      <div className="font-medium">{application.property.name}</div>
                      <div className="text-sm text-slate-500">{application.property.address}</div>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Financial Information */}
            <SectionCard title="Financial Information">
              <div className="space-y-3">
                {application.creditScore && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-600">Credit Score</div>
                      <div className="font-medium text-lg">{application.creditScore}</div>
                      {application.creditScoreDate && (
                        <div className="text-xs text-slate-500">
                          Date: {new Date(application.creditScoreDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {application.monthlyIncome && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-600">Monthly Income</div>
                      <div className="font-medium text-lg">
                        ${application.monthlyIncome.toLocaleString()}
                      </div>
                      {application.annualIncome && (
                        <div className="text-xs text-slate-500">
                          Annual: ${application.annualIncome.toLocaleString()}
                        </div>
                      )}
                      {application.payFrequency && (
                        <div className="text-xs text-slate-500">
                          Pay Frequency: {application.payFrequency}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {application.employerName && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-600">Employer</div>
                      <div className="font-medium">{application.employerName}</div>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* License Information */}
            {application.licenseName && (
              <SectionCard title="Driver's License">
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-slate-600">Name</div>
                    <div className="font-medium">{application.licenseName}</div>
                  </div>
                  {application.licenseNumber && (
                    <div>
                      <div className="text-sm text-slate-600">License Number</div>
                      <div className="font-mono text-sm">{application.licenseNumber}</div>
                    </div>
                  )}
                  {application.licenseDOB && (
                    <div>
                      <div className="text-sm text-slate-600">Date of Birth</div>
                      <div className="font-medium">
                        {new Date(application.licenseDOB).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {application.licenseExpiration && (
                    <div>
                      <div className="text-sm text-slate-600">Expiration</div>
                      <div className="font-medium">
                        {new Date(application.licenseExpiration).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {activeTab === "screening" && (
          <div className="mt-6">
            <SectionCard title="Screening Results">
              <div className="space-y-4">
                {application.screeningScore && (
                  <div>
                    <div className="text-sm text-slate-600 mb-2">Screening Score</div>
                    <div className="inline-block">
                      {getScoreBadge()}
                    </div>
                  </div>
                )}
                {application.screeningNotes && (
                  <div>
                    <div className="text-sm text-slate-600 mb-2">Notes</div>
                    <div className="p-4 bg-slate-50 rounded-lg text-slate-800">
                      {application.screeningNotes}
                    </div>
                  </div>
                )}
                {!application.screeningScore && (
                  <div className="text-center py-8 text-slate-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p>No screening score calculated yet</p>
                    <button
                      onClick={handleCalculateScore}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Calculate Score
                    </button>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {application.driversLicenseUrl && (
              <SectionCard title="Driver's License">
                <div className="space-y-3">
                  {application.driversLicenseUrl && (
                    <img
                      src={application.driversLicenseUrl}
                      alt="Driver's License"
                      className="w-full rounded-lg border"
                    />
                  )}
                  {application.driversLicenseText && (
                    <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono">
                      {application.driversLicenseText.substring(0, 200)}...
                    </div>
                  )}
                  <a
                    href={application.driversLicenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </SectionCard>
            )}

            {application.payStubUrls && application.payStubUrls.length > 0 && (
              <SectionCard title="Pay Stubs">
                <div className="space-y-3">
                  {application.payStubUrls.map((url: string, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <img
                        src={url}
                        alt={`Pay Stub ${idx + 1}`}
                        className="w-full rounded-lg border"
                      />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4" />
                        Download Pay Stub {idx + 1}
                      </a>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {application.creditScoreUrl && (
              <SectionCard title="Credit Score Document">
                <div className="space-y-3">
                  <img
                    src={application.creditScoreUrl}
                    alt="Credit Score"
                    className="w-full rounded-lg border"
                  />
                  <a
                    href={application.creditScoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {activeTab === "background" && (
          <div className="mt-6">
            <SectionCard title="Background Check Results">
              {application.backgroundCheckResult ? (
                <div className="space-y-6">
                  {/* Overall Status */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Overall Status</div>
                      <div className="flex items-center gap-2">
                        {application.backgroundCheckResult?.overall_status === "pass" ? (
                          <>
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-600">PASS</span>
                          </>
                        ) : application.backgroundCheckResult?.overall_status === "review" ? (
                          <>
                            <ShieldAlert className="w-5 h-5 text-yellow-600" />
                            <span className="font-semibold text-yellow-600">REVIEW REQUIRED</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-red-600">FAIL</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">Report ID</div>
                      <div className="font-mono text-sm">{application.backgroundCheckResult?.report_id || "N/A"}</div>
                      {application.backgroundCheckCompletedAt && (
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(application.backgroundCheckCompletedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Criminal History */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Criminal History</h3>
                      {application.backgroundCheckResult?.criminal_history?.status === "pass" ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">PASS</span>
                      ) : application.backgroundCheckResult?.criminal_history?.status === "review" ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">REVIEW</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">FAIL</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{application.backgroundCheckResult?.criminal_history?.summary || "N/A"}</p>
                      <div className="text-xs text-slate-500">
                      Jurisdictions checked: {application.backgroundCheckResult?.criminal_history?.jurisdictions_checked?.join(", ") || "N/A"}
                    </div>
                      {application.backgroundCheckResult?.criminal_history?.records && application.backgroundCheckResult.criminal_history.records.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {application.backgroundCheckResult.criminal_history.records.map((record, idx: number) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded text-sm">
                            <div className="font-medium">{record?.offense || "N/A"}</div>
                            <div className="text-xs text-slate-600">Date: {record?.date || "N/A"} • Status: {record?.status || "N/A"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Eviction History */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Eviction History</h3>
                      {application.backgroundCheckResult?.eviction_history?.status === "pass" ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">PASS</span>
                      ) : application.backgroundCheckResult?.eviction_history?.status === "review" ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">REVIEW</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">FAIL</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{application.backgroundCheckResult?.eviction_history?.summary || "N/A"}</p>
                      <div className="text-xs text-slate-500">
                      Databases checked: {application.backgroundCheckResult?.eviction_history?.databases_checked?.join(", ") || "N/A"}
                    </div>
                      {application.backgroundCheckResult?.eviction_history?.records && application.backgroundCheckResult.eviction_history.records.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {application.backgroundCheckResult.eviction_history.records.map((record, idx: number) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded text-sm">
                            <div className="font-medium">{record?.reason || "N/A"}</div>
                            <div className="text-xs text-slate-600">Date: {record?.date || "N/A"} • Status: {record?.status || "N/A"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Employment Verification */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Employment Verification</h3>
                      {application.backgroundCheckResult?.employment_verification?.status === "verified" ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">VERIFIED</span>
                      ) : application.backgroundCheckResult?.employment_verification?.status === "pending" ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">PENDING</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-sm font-medium">NOT PROVIDED</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{application.backgroundCheckResult?.employment_verification?.summary || "N/A"}</p>
                    <div className="text-sm">
                      <span className="font-medium">Employer:</span> {application.backgroundCheckResult?.employment_verification?.details?.employer || "N/A"}
                    </div>
                  </div>

                  {/* Identity Verification */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Identity Verification</h3>
                      {application.backgroundCheckResult?.identity_verification?.status === "verified" ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">VERIFIED</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">PARTIAL</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{application.backgroundCheckResult?.identity_verification?.summary || "N/A"}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Name Match:</span>{" "}
                        {application.backgroundCheckResult?.identity_verification?.details?.name_match ? "✓" : "✗"}
                      </div>
                      <div>
                        <span className="font-medium">DOB Verified:</span>{" "}
                        {application.backgroundCheckResult?.identity_verification?.details?.dob_verified ? "✓" : "✗"}
                      </div>
                      <div>
                        <span className="font-medium">License Verified:</span>{" "}
                        {application.backgroundCheckResult?.identity_verification?.details?.license_verified ? "✓" : "✗"}
                      </div>
                      <div>
                        <span className="font-medium">SSN Verified:</span>{" "}
                        {application.backgroundCheckResult?.identity_verification?.details?.ssn_verified ? "✓" : "✗"}
                      </div>
                    </div>
                  </div>

                  {/* Credit Check */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Credit Check</h3>
                      {(application.backgroundCheckResult?.credit_check?.status === "excellent" || 
                       application.backgroundCheckResult?.credit_check?.status === "good") ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                          {application.backgroundCheckResult?.credit_check?.status?.toUpperCase() || "N/A"}
                        </span>
                      ) : application.backgroundCheckResult?.credit_check?.status === "fair" ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">FAIR</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                          {application.backgroundCheckResult?.credit_check?.status === "poor" ? "POOR" : "NOT PROVIDED"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{application.backgroundCheckResult?.credit_check?.summary || "N/A"}</p>
                    <div className="text-xs text-slate-500">
                      Bureaus checked: {application.backgroundCheckResult?.credit_check?.bureaus_checked?.join(", ") || "N/A"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No background check performed yet</p>
                  <button
                    onClick={handleRunBackgroundCheck}
                    disabled={processing}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Shield className="w-4 h-4" />
                    Run Background Check
                  </button>
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {activeTab === "scheduling" && (
          <div className="mt-6">
            <SectionCard title="Scheduled Showing">
              {application.status === "scheduled" && application.scheduledDate && application.scheduledTime ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <div className="text-sm text-slate-600">Date & Time</div>
                      <div className="font-medium text-lg">
                        {new Date(application.scheduledDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {` at ${application.scheduledTime}`}
                      </div>
                    </div>
                  </div>
                  {application.property && (
                    <div>
                      <div className="text-sm text-slate-600">Property Address</div>
                      <div className="font-medium">{application.property.address}</div>
                    </div>
                  )}
                  {application.property?.settings?.parkingInstructions && (
                    <div>
                      <div className="text-sm text-slate-600">Parking Instructions</div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        {application.property.settings.parkingInstructions}
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <a
                      href={generateGoogleCalendarLink(
                        application.scheduledDate,
                        application.scheduledTime,
                        application.applicantName,
                        application.property?.address
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Open in Google Calendar</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {application.calendarEventId && (
                      <div className="mt-3 text-xs text-slate-500">
                        Calendar Event ID: {application.calendarEventId}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No showing scheduled yet</p>
                  {application.status === "approved" && (
                    <p className="text-sm mt-2">This application is approved and ready for scheduling</p>
                  )}
                </div>
              )}
            </SectionCard>
          </div>
        )}
      </PageLayout>
    </AuthWrapper>
  );
}

