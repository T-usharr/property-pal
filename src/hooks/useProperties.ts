import { useState, useEffect, useCallback } from 'react';
import { Property } from '@/types/property';
import { defaultChecklist } from '@/data/defaultChecklist';

const STORAGE_KEY = 'property-evaluator-data';

// Helper to save synchronously
const saveToStorage = (data: Property[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Helper to load from storage
const loadFromStorage = (): Property[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored properties:', e);
    }
  }
  return [];
};

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>(() => loadFromStorage());
  const [isLoading, setIsLoading] = useState(false);

  // Sync to localStorage whenever properties change
  useEffect(() => {
    saveToStorage(properties);
  }, [properties]);

  const addProperty = useCallback((name: string, address: string, builderName: string) => {
    const newProperty: Property = {
      id: crypto.randomUUID(),
      name,
      address,
      builderName,
      visitDate: new Date().toISOString().split('T')[0],
      tags: [],
      notes: '',
      rating: 0,
      checklist: JSON.parse(JSON.stringify(defaultChecklist)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Update state
    setProperties((prev) => {
      const updated = [newProperty, ...prev];
      // Also save synchronously to ensure it's available immediately
      saveToStorage(updated);
      return updated;
    });
    
    return newProperty.id;
  }, []);

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setProperties((prev) => {
      const updated = prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      );
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deleteProperty = useCallback((id: string) => {
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const getProperty = useCallback((id: string) => {
    // Always read fresh from localStorage to get latest data
    const freshData = loadFromStorage();
    return freshData.find((p) => p.id === id);
  }, []);

  const duplicateProperty = useCallback((id: string) => {
    const freshData = loadFromStorage();
    const property = freshData.find((p) => p.id === id);
    if (!property) return null;
    
    const newProperty: Property = {
      ...JSON.parse(JSON.stringify(property)),
      id: crypto.randomUUID(),
      name: `${property.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setProperties((prev) => {
      const updated = [newProperty, ...prev];
      saveToStorage(updated);
      return updated;
    });
    
    return newProperty.id;
  }, []);

  // Refresh properties from storage (useful after navigation)
  const refreshProperties = useCallback(() => {
    setProperties(loadFromStorage());
  }, []);

  return {
    properties,
    isLoading,
    addProperty,
    updateProperty,
    deleteProperty,
    getProperty,
    duplicateProperty,
    refreshProperties,
  };
};
