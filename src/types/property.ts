export interface ChecklistItem {
  id: string;
  label: string;
  type: 'checkbox' | 'text' | 'number' | 'select' | 'rating';
  value: string | boolean | number | null;
  options?: string[];
  note?: string;
  redFlag?: boolean;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
}

export interface Property {
  id: string;
  name: string;
  address: string;
  builderName: string;
  visitDate: string;
  tags: string[];
  notes: string;
  rating: number;
  checklist: ChecklistCategory[];
  createdAt: string;
  updatedAt: string;
}

export type PropertyTag = 
  | 'favorite'
  | 'shortlisted'
  | 'rejected'
  | 'under-review'
  | 'negotiating'
  | 'visited'
  | 'needs-second-visit';
