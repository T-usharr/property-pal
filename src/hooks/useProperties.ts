import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { defaultChecklist } from '@/data/defaultChecklist';

const STORAGE_KEY = 'property-evaluator-data';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProperties(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored properties:', e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    }
  }, [properties, isLoading]);

  const addProperty = (name: string, address: string, builderName: string) => {
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
    setProperties((prev) => [newProperty, ...prev]);
    return newProperty.id;
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const getProperty = (id: string) => {
    return properties.find((p) => p.id === id);
  };

  const duplicateProperty = (id: string) => {
    const property = getProperty(id);
    if (!property) return null;
    
    const newProperty: Property = {
      ...JSON.parse(JSON.stringify(property)),
      id: crypto.randomUUID(),
      name: `${property.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProperties((prev) => [newProperty, ...prev]);
    return newProperty.id;
  };

  return {
    properties,
    isLoading,
    addProperty,
    updateProperty,
    deleteProperty,
    getProperty,
    duplicateProperty,
  };
};
