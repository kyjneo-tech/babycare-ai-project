import { useState, useCallback } from "react";

export function useSelection<T = string>(initialSelected: T[] = []) {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set(initialSelected));
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelection = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: T[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const setSelectionMode = useCallback((mode: boolean) => {
    setIsSelectionMode(mode);
    if (!mode) {
      setSelectedIds(new Set());
    }
  }, []);

  const toggleMode = useCallback(() => {
    setSelectionMode(!isSelectionMode);
  }, [isSelectionMode, setSelectionMode]);

  return {
    selectedIds,
    isSelectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleMode,
    setSelectionMode,
  };
}
