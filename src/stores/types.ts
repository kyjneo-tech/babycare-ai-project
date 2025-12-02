// Common types for all stores

export interface StoreState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncAction {
  pending: boolean;
  error: string | null;
}

// Temporary ID generator for optimistic updates
export const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Type guard for checking if ID is temporary
export const isTempId = (id: string): boolean => id.startsWith('temp-');
