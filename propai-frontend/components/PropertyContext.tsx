'use client';

import { useState, useEffect } from 'react';
import { MapPin, Home, School, Car, ShoppingBag, TrendingUp, Users, Star, Clock, Shield } from 'lucide-react';

interface PropertyContext {
  id: string;
  propertyId: string;
  
  // Basic Property Details
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  propertyType?: string;
  yearBuilt?: number;
  lotSize?: string;
  
  // Architectural & Style
  architecturalStyle?: string;
  exteriorFeatures?: string;
  interiorFeatures?: string;
  
  // Location & Neighborhood
  neighborhood?: string;
  walkScore?: number;
  transitScore?: number;
  bikeScore?: number;
  crimeRate?: string;
  
  // Schools & Education
  elementarySchool?: string;
  middleSchool?: string;
  highSchool?: string;
  schoolDistrict?: string;
  schoolRatings?: string;
  
  // Transportation & Commute
  nearbyTransit?: string;
  majorHighways?: string;
  commuteTimes?: string;
  
  // Amenities & Services
  nearbyAmenities?: string;
  healthcareFacilities?: string;
  entertainment?: string;
  
  // Market Information
  estimatedValue?: number;
  pricePerSqFt?: number;
  marketTrends?: string;
  comparableProperties?: string;
  
  // AI-Generated Content
  propertyDescription?: string;
  keySellingPoints?: string;
  potentialConcerns?: string;
  targetDemographics?: string;
  
  // Metadata
  lastUpdated: string;
  createdAt: string;
  aiModel?: string;
  confidenceScore?: number;
}

interface PropertyContextProps {
  propertyId: string;
  propertyAddress: string;
  onContextUpdate?: (context: PropertyContext) => void;
}

export default function PropertyContextComponent({ propertyId, propertyAddress, onContextUpdate }: PropertyContextProps) {
  const [context, setContext] = useState<PropertyContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContext();
  }, [propertyId]);

  const fetchContext = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/property-context?propertyId=${propertyId}`);
      
      if (response.ok) {
        const data = await response.json();
        setContext(data.context);
        onContextUpdate?.(data.context);
      }
    } catch (err) {
      console.error('Error fetching property context:', err);
      setError('Failed to load property context');
    } finally {
      setLoading(false);
    }
  };

  const collectContext = async () => {
    try {
      setCollecting(true);
      setError(null);
      
      const response = await fetch('/api/property-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          address: propertyAddress
        })
      });

      if (response.ok) {
        const data = await response.json();
        setContext(data.context);
        onContextUpdate?.(data.context);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to collect property context');
      }
    } catch (err) {
      console.error('Error collecting property context:', err);
      setError('Failed to collect property context');
    } finally {
      setCollecting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCrimeRateColor = (rate: string) => {
    switch (rate?.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto text-gray-400 mb-4">
            <Home className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Property Context Not Available</h3>
          <p className="text-gray-500 mb-6">
            Collect detailed property information using AI to help prospective tenants learn about this property.
          </p>
          <button
            onClick={collectContext}
            disabled={collecting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {collecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Collecting Context...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Collect Property Context
              </>
            )}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Property Context</h3>
          <p className="text-sm text-gray-500">
            AI-generated property information for prospective tenants
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {context.confidenceScore && (
            <div className="flex items-center text-sm text-gray-500">
              <Star className="w-4 h-4 mr-1" />
              {Math.round(context.confidenceScore * 100)}% confidence
            </div>
          )}
          <button
            onClick={collectContext}
            disabled={collecting}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {collecting ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Property Details */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Home className="w-4 h-4 mr-2" />
            Property Details
          </h4>
          <div className="space-y-2 text-sm">
            {context.bedrooms && (
              <div className="flex justify-between">
                <span className="text-gray-500">Bedrooms:</span>
                <span className="font-medium">{context.bedrooms}</span>
              </div>
            )}
            {context.bathrooms && (
              <div className="flex justify-between">
                <span className="text-gray-500">Bathrooms:</span>
                <span className="font-medium">{context.bathrooms}</span>
              </div>
            )}
            {context.squareFootage && (
              <div className="flex justify-between">
                <span className="text-gray-500">Square Feet:</span>
                <span className="font-medium">{context.squareFootage.toLocaleString()}</span>
              </div>
            )}
            {context.propertyType && (
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium">{context.propertyType}</span>
              </div>
            )}
            {context.yearBuilt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Year Built:</span>
                <span className="font-medium">{context.yearBuilt}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location & Neighborhood */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Location
          </h4>
          <div className="space-y-2 text-sm">
            {context.neighborhood && (
              <div className="flex justify-between">
                <span className="text-gray-500">Neighborhood:</span>
                <span className="font-medium">{context.neighborhood}</span>
              </div>
            )}
            {context.walkScore !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-500">Walk Score:</span>
                <span className={`font-medium ${getScoreColor(context.walkScore)}`}>
                  {context.walkScore}/100
                </span>
              </div>
            )}
            {context.transitScore !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-500">Transit Score:</span>
                <span className={`font-medium ${getScoreColor(context.transitScore)}`}>
                  {context.transitScore}/100
                </span>
              </div>
            )}
            {context.crimeRate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Crime Rate:</span>
                <span className={`font-medium ${getCrimeRateColor(context.crimeRate)}`}>
                  {context.crimeRate}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Schools */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <School className="w-4 h-4 mr-2" />
            Schools
          </h4>
          <div className="space-y-2 text-sm">
            {context.elementarySchool && (
              <div>
                <span className="text-gray-500">Elementary:</span>
                <div className="font-medium">{context.elementarySchool}</div>
              </div>
            )}
            {context.middleSchool && (
              <div>
                <span className="text-gray-500">Middle:</span>
                <div className="font-medium">{context.middleSchool}</div>
              </div>
            )}
            {context.highSchool && (
              <div>
                <span className="text-gray-500">High School:</span>
                <div className="font-medium">{context.highSchool}</div>
              </div>
            )}
            {context.schoolDistrict && (
              <div>
                <span className="text-gray-500">District:</span>
                <div className="font-medium">{context.schoolDistrict}</div>
              </div>
            )}
          </div>
        </div>

        {/* Market Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Market Info
          </h4>
          <div className="space-y-2 text-sm">
            {context.estimatedValue && (
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Value:</span>
                <span className="font-medium">{formatCurrency(context.estimatedValue)}</span>
              </div>
            )}
            {context.pricePerSqFt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Price/sqft:</span>
                <span className="font-medium">{formatCurrency(context.pricePerSqFt)}</span>
              </div>
            )}
            {context.marketTrends && (
              <div className="flex justify-between">
                <span className="text-gray-500">Market Trend:</span>
                <span className="font-medium">{context.marketTrends}</span>
              </div>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Amenities
          </h4>
          <div className="space-y-2 text-sm">
            {context.nearbyAmenities && (
              <div>
                <span className="text-gray-500">Nearby:</span>
                <div className="font-medium">{context.nearbyAmenities}</div>
              </div>
            )}
            {context.healthcareFacilities && (
              <div>
                <span className="text-gray-500">Healthcare:</span>
                <div className="font-medium">{context.healthcareFacilities}</div>
              </div>
            )}
            {context.entertainment && (
              <div>
                <span className="text-gray-500">Entertainment:</span>
                <div className="font-medium">{context.entertainment}</div>
              </div>
            )}
          </div>
        </div>

        {/* Transportation */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Car className="w-4 h-4 mr-2" />
            Transportation
          </h4>
          <div className="space-y-2 text-sm">
            {context.nearbyTransit && (
              <div>
                <span className="text-gray-500">Transit:</span>
                <div className="font-medium">{context.nearbyTransit}</div>
              </div>
            )}
            {context.majorHighways && (
              <div>
                <span className="text-gray-500">Highways:</span>
                <div className="font-medium">{context.majorHighways}</div>
              </div>
            )}
            {context.commuteTimes && (
              <div>
                <span className="text-gray-500">Commute:</span>
                <div className="font-medium">{context.commuteTimes}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI-Generated Content */}
      {(context.propertyDescription || context.keySellingPoints || context.targetDemographics) && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">AI-Generated Insights</h4>
          <div className="space-y-4">
            {context.propertyDescription && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Property Description</h5>
                <p className="text-sm text-gray-600 leading-relaxed">{context.propertyDescription}</p>
              </div>
            )}
            {context.keySellingPoints && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Key Selling Points</h5>
                <p className="text-sm text-gray-600 leading-relaxed">{context.keySellingPoints}</p>
              </div>
            )}
            {context.targetDemographics && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Target Demographics</h5>
                <p className="text-sm text-gray-600 leading-relaxed">{context.targetDemographics}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
        Last updated: {new Date(context.lastUpdated).toLocaleString()}
        {context.aiModel && ` • Powered by ${context.aiModel}`}
      </div>
    </div>
  );
}
