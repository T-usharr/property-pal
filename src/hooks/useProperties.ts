import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property, ChecklistCategory } from '@/types/property';
import { defaultChecklist } from '@/data/defaultChecklist';
import { useAuth } from './useAuth';
import { Json } from '@/integrations/supabase/types';

export const useProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch properties from database
  const fetchProperties = useCallback(async () => {
    if (!user) {
      setProperties([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Property[] = (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        address: row.address || '',
        builderName: row.builder_name || '',
        visitDate: row.visit_date,
        tags: row.tags || [],
        notes: row.notes || '',
        rating: row.rating || 0,
        checklist: (row.checklist as unknown as ChecklistCategory[]) || defaultChecklist,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      setProperties(mapped);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const addProperty = useCallback(async (name: string, address: string, builderName: string) => {
    if (!user) return null;

    const newProperty = {
      user_id: user.id,
      name,
      address,
      builder_name: builderName,
      visit_date: new Date().toISOString().split('T')[0],
      tags: [] as string[],
      notes: '',
      rating: 0,
      checklist: defaultChecklist as unknown as Json,
    };

    try {
      const { data, error } = await supabase
        .from('properties')
        .insert(newProperty)
        .select()
        .single();

      if (error) throw error;

      const mapped: Property = {
        id: data.id,
        name: data.name,
        address: data.address || '',
        builderName: data.builder_name || '',
        visitDate: data.visit_date,
        tags: data.tags || [],
        notes: data.notes || '',
        rating: data.rating || 0,
        checklist: (data.checklist as unknown as ChecklistCategory[]) || defaultChecklist,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setProperties((prev) => [mapped, ...prev]);
      return data.id;
    } catch (error) {
      console.error('Error adding property:', error);
      return null;
    }
  }, [user]);

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    if (!user) return;

    // Convert to DB format
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.builderName !== undefined) dbUpdates.builder_name = updates.builderName;
    if (updates.visitDate !== undefined) dbUpdates.visit_date = updates.visitDate;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist as unknown as Json;

    try {
      const { error } = await supabase
        .from('properties')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setProperties((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        )
      );
    } catch (error) {
      console.error('Error updating property:', error);
    }
  }, [user]);

  const deleteProperty = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  }, [user]);

  const getProperty = useCallback((id: string) => {
    return properties.find((p) => p.id === id);
  }, [properties]);

  const duplicateProperty = useCallback(async (id: string) => {
    if (!user) return null;

    const property = properties.find((p) => p.id === id);
    if (!property) return null;

    const newProperty = {
      user_id: user.id,
      name: `${property.name} (Copy)`,
      address: property.address,
      builder_name: property.builderName,
      visit_date: new Date().toISOString().split('T')[0],
      tags: property.tags,
      notes: property.notes,
      rating: property.rating,
      checklist: property.checklist as unknown as Json,
    };

    try {
      const { data, error } = await supabase
        .from('properties')
        .insert(newProperty)
        .select()
        .single();

      if (error) throw error;

      const mapped: Property = {
        id: data.id,
        name: data.name,
        address: data.address || '',
        builderName: data.builder_name || '',
        visitDate: data.visit_date,
        tags: data.tags || [],
        notes: data.notes || '',
        rating: data.rating || 0,
        checklist: (data.checklist as unknown as ChecklistCategory[]) || defaultChecklist,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setProperties((prev) => [mapped, ...prev]);
      return data.id;
    } catch (error) {
      console.error('Error duplicating property:', error);
      return null;
    }
  }, [user, properties]);

  return {
    properties,
    isLoading,
    addProperty,
    updateProperty,
    deleteProperty,
    getProperty,
    duplicateProperty,
    refreshProperties: fetchProperties,
  };
};
