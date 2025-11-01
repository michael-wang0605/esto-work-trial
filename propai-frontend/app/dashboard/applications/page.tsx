"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Topbar from "@/components/Topbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import AuthWrapper from "@/components/AuthWrapper";
import { FileText, Mail, User, Calendar, MapPin, Phone, DollarSign, CreditCard, CheckCircle, Clock, XCircle, AlertTriangle, MessageSquare } from "lucide-react";

interface TenantApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "scheduled";
  screeningScore?: "green" | "yellow" | "red";
  creditScore?: number;
  monthlyIncome?: number;
  emailSubject?: string;
  emailBody?: string;
  receivedAt: string;
  property?: {
    id: string;
    name: string;
    address: string;
  };
}

export default function DashboardApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<TenantApplication | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/applications");
      if (!response.ok) {
        throw new Error("Failed to load applications");
      }
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleThread = (applicationId: string) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedThreads(newExpanded);
  };

  const getStatusBadge = (status: string, score?: string) => {
    const scoreColors: Record<string, string> = {
      green: "bg-emerald-100 text-emerald-800",
      yellow: "bg-amber-100 text-amber-800",
      red: "bg-red-100 text-red-800"
    };

    if (status === "approved" || status === "scheduled") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <CheckCircle className="w-3 h-3" />
          {status === "scheduled" ? "Scheduled" : "Approved"}
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    }
    if (status === "under_review") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <AlertTriangle className="w-3 h-3" />
          Under Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const getScoreBadge = (score?: string) => {
    if (!score) return null;
    
    const colors: Record<string, string> = {
      green: "bg-emerald-500",
      yellow: "bg-amber-500",
      red: "bg-red-500"
    };

    return (
      <span className={`inline-block w-2 h-2 rounded-full ${colors[score] || "bg-slate-500"}`} />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-background">
          <AnimatedBackground />
          <div className="relative z-10">
            <Topbar />
            <div className="flex items-center justify-center min-h-[60vh] pt-24">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-primary/40 border-t-primary rounded-full animate-spin"></div>
                <p className="text-foreground/70">Loading applications...</p>
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
                    Applications
                  </h1>
                  <p className="text-foreground/70">Tenant applications submitted via email</p>
                </div>
              </div>
            </div>

            {/* Applications List */}
            {applications.length === 0 ? (
              <div className="glass-strong rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-foreground/40" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Applications Yet</h3>
                <p className="text-foreground/60">Applications submitted via email will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="glass-strong rounded-xl p-6 hover:scale-[1.01] transition-all"
                  >
                    {/* Application Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {application.applicantName}
                          </h3>
                          {getScoreBadge(application.screeningScore)}
                          {getStatusBadge(application.status, application.screeningScore)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4" />
                            {application.applicantEmail}
                          </div>
                          {application.applicantPhone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-4 h-4" />
                              {application.applicantPhone}
                            </div>
                          )}
                          {application.property && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {application.property.name}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(application.receivedAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {application.creditScore && (
                        <div className="p-3 rounded-lg bg-card/40 border border-border/50">
                          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-1">
                            <CreditCard className="w-4 h-4" />
                            Credit Score
                          </div>
                          <div className="text-xl font-bold text-foreground">{application.creditScore}</div>
                        </div>
                      )}
                      {application.monthlyIncome && (
                        <div className="p-3 rounded-lg bg-card/40 border border-border/50">
                          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-1">
                            <DollarSign className="w-4 h-4" />
                            Monthly Income
                          </div>
                          <div className="text-xl font-bold text-foreground">
                            ${application.monthlyIncome.toLocaleString()}
                          </div>
                        </div>
                      )}
                      {application.property && (
                        <div className="p-3 rounded-lg bg-card/40 border border-border/50">
                          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-1">
                            <MapPin className="w-4 h-4" />
                            Property
                          </div>
                          <div className="text-lg font-semibold text-foreground truncate">
                            {application.property.address}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email Thread */}
                    {(application.emailSubject || application.emailBody) && (
                      <div className="mt-4 border-t border-border/50 pt-4">
                        <button
                          onClick={() => toggleThread(application.id)}
                          className="flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors w-full"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>View Email Thread</span>
                          <span className="ml-auto">
                            {expandedThreads.has(application.id) ? "−" : "+"}
                          </span>
                        </button>
                        
                        {expandedThreads.has(application.id) && (
                          <div className="mt-4 p-4 rounded-lg bg-card/40 border border-border/50">
                            {application.emailSubject && (
                              <div className="mb-3">
                                <div className="text-xs font-medium text-foreground/60 mb-1">Subject</div>
                                <div className="text-sm font-semibold text-foreground">
                                  {application.emailSubject}
                                </div>
                              </div>
                            )}
                            {application.emailBody && (
                              <div>
                                <div className="text-xs font-medium text-foreground/60 mb-2">Email Body</div>
                                <div className="text-sm text-foreground/80 whitespace-pre-wrap max-h-96 overflow-y-auto">
                                  {application.emailBody}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}

