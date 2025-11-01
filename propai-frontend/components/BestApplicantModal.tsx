"use client";

import { X, Trophy, CheckCircle, AlertTriangle, User, Mail, CreditCard, DollarSign, FileText } from "lucide-react";

interface BestApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    success: boolean;
    bestApplicant?: {
      application_id: string;
      applicant_name: string;
      applicant_email: string;
      credit_score?: number;
      monthly_income?: number;
      income_ratio?: number;
      screening_score?: string;
      status?: string;
      summary?: string;
    };
    agentAnalysis?: {
      reasoning: string;
      keyStrengths?: string[];
      concerns?: string[];
      recommendation?: string;
    };
    totalApplicants?: number;
    error?: string;
  };
  loading: boolean;
}

export default function BestApplicantModal({
  isOpen,
  onClose,
  result,
  loading,
}: BestApplicantModalProps) {
  if (!isOpen) return null;

  const getRecommendationColor = (rec?: string) => {
    switch (rec) {
      case "APPROVE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "REVIEW":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "DECLINE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Best Applicant Analysis</h2>
              <p className="text-sm text-slate-600">AI-powered selection based on comprehensive criteria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Analyzing applicants with AI...</p>
            </div>
          ) : result.error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Applicants Found</h3>
              <p className="text-slate-600">{result.error}</p>
            </div>
          ) : result.bestApplicant ? (
            <div className="space-y-6">
              {/* Best Applicant Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Selected Applicant</h3>
                      <p className="text-sm text-slate-600">Based on AI analysis</p>
                    </div>
                  </div>
                  {result.agentAnalysis?.recommendation && (
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getRecommendationColor(result.agentAnalysis.recommendation)}`}>
                      {result.agentAnalysis.recommendation}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-600">Name</div>
                      <div className="font-semibold text-slate-900">{result.bestApplicant.applicant_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-600">Email</div>
                      <div className="font-semibold text-slate-900">{result.bestApplicant.applicant_email}</div>
                    </div>
                  </div>
                  {result.bestApplicant.credit_score && (
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-sm text-slate-600">Credit Score</div>
                        <div className={`font-semibold ${result.bestApplicant.credit_score >= 680 ? 'text-emerald-600' : result.bestApplicant.credit_score >= 620 ? 'text-amber-600' : 'text-red-600'}`}>
                          {result.bestApplicant.credit_score}
                        </div>
                      </div>
                    </div>
                  )}
                  {result.bestApplicant.monthly_income && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-sm text-slate-600">Monthly Income</div>
                        <div className="font-semibold text-slate-900">
                          ${result.bestApplicant.monthly_income.toLocaleString()}
                          {result.bestApplicant.income_ratio && (
                            <span className="text-emerald-600 ml-2">
                              ({result.bestApplicant.income_ratio.toFixed(1)}x rent)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {result.bestApplicant.screening_score && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-sm text-slate-600">Screening Score</div>
                        <span className={`px-2.5 py-1 rounded text-xs font-semibold ${getScoreColor(result.bestApplicant.screening_score)}`}>
                          {result.bestApplicant.screening_score.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                  {result.bestApplicant.status && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-sm text-slate-600">Status</div>
                        <div className="font-semibold text-slate-900 capitalize">{result.bestApplicant.status.replace('_', ' ')}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Reasoning */}
              {result.agentAnalysis?.reasoning && (
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    AI Analysis & Reasoning
                  </h4>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {result.agentAnalysis.reasoning}
                  </p>
                </div>
              )}

              {/* Key Strengths */}
              {result.agentAnalysis?.keyStrengths && result.agentAnalysis.keyStrengths.length > 0 && (
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                  <h4 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {result.agentAnalysis.keyStrengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-emerald-800">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Concerns */}
              {result.agentAnalysis?.concerns && result.agentAnalysis.concerns.length > 0 && result.agentAnalysis.concerns[0] !== "null" && (
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <h4 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Considerations
                  </h4>
                  <ul className="space-y-2">
                    {result.agentAnalysis.concerns.map((concern, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-amber-800">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary Stats */}
              {result.totalApplicants && (
                <div className="bg-slate-100 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-600">
                    Analyzed <span className="font-semibold text-slate-900">{result.totalApplicants}</span> applicant{result.totalApplicants !== 1 ? 's' : ''} for this property
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to Analyze</h3>
              <p className="text-slate-600">No applicant data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          {result.bestApplicant && (
            <button
              onClick={() => {
                window.location.href = `/applications/${result.bestApplicant?.application_id}`;
              }}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              View Application Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

