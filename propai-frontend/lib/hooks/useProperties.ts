import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Property } from '@/lib/types';

export function useProperties() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load properties from database
  const loadProperties = async () => {
    if (!session?.user) {
      setProperties([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/properties');
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.properties);
      } else {
        setError(data.error || 'Failed to load properties');
      }
    } catch (err) {
      setError('Failed to load properties');
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new property
  const createProperty = async (property: Omit<Property, 'id'>) => {
    try {
      console.log('Creating property with data:', property);
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(property)
      });
      
      const data = await response.json();
      console.log('Property creation response:', data);
      
      if (data.success) {
        console.log('Adding property to state:', data.property);
        setProperties(prev => [...prev, data.property]);
        return data.property;
      } else {
        // Handle property limit error specifically
        if (data.limitReached) {
          throw new Error(data.error || 'Property limit reached');
        }
        throw new Error(data.error || 'Failed to create property');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create property');
      throw err;
    }
  };

  // Update a property
  const updateProperty = async (id: string, property: Omit<Property, 'id'>) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(property)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProperties(prev => 
          prev.map(p => p.id === id ? data.property : p)
        );
        return data.property;
      } else {
        throw new Error(data.error || 'Failed to update property');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property');
      throw err;
    }
  };

  // Delete a property
  const deleteProperty = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProperties(prev => prev.filter(p => p.id !== id));
      } else {
        throw new Error(data.error || 'Failed to delete property');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete property');
      throw err;
    }
  };

  // Load properties when session changes
  useEffect(() => {
    loadProperties();
  }, [session?.user]);

  return {
    properties,
    loading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    refreshProperties: loadProperties
  };
}
