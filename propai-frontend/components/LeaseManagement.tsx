'use client';

import { useState, useEffect } from 'react';
import LeaseUpload, { LeaseCard } from './LeaseUpload';

interface LeaseManagementProps {
  propertyId: string;
  propertyName: string;
}

interface Lease {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  summary?: string;
  keyTerms?: string;
  startDate?: string;
  endDate?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  isActive: boolean;
  uploadedAt: string;
}

export default function LeaseManagement({ propertyId, propertyName }: LeaseManagementProps) {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchLeases();
  }, [propertyId]);

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leases?propertyId=${propertyId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leases');
      }
      
      const data = await response.json();
      setLeases(data.leases || []);
    } catch (err) {
      console.error('Error fetching leases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leases');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newLease: any) => {
    setLeases(prev => [newLease, ...prev]);
    setShowUpload(false);
    setError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const activeLeases = leases.filter(lease => lease.isActive);
  const inactiveLeases = leases.filter(lease => !lease.isActive);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Lease Documents</h3>
          <p className="text-sm text-gray-500">
            Upload and manage lease agreements for {propertyName}
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {showUpload ? 'Cancel' : 'Upload Lease'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="mb-6">
          <LeaseUpload
            propertyId={propertyId}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>
      )}

      {leases.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto text-gray-400 mb-4">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No lease documents</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload lease agreements to enable AI-powered tenant support
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Upload First Lease
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeLeases.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Active Leases</h4>
              <div className="space-y-3">
                {activeLeases.map((lease) => (
                  <LeaseCard key={lease.id} lease={lease} />
                ))}
              </div>
            </div>
          )}

          {inactiveLeases.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Previous Leases</h4>
              <div className="space-y-3">
                {inactiveLeases.map((lease) => (
                  <LeaseCard key={lease.id} lease={lease} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {leases.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            AI can use lease information to answer tenant questions about rent, policies, and terms
          </div>
        </div>
      )}
    </div>
  );
}
