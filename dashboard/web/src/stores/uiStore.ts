/**
 * UI Store — Zustand store for filters/preferences
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  severityFilter: string | null
  statusFilter: string | null
  sortBy: 'priority' | 'created' | 'severity'
  setSeverityFilter: (filter: string | null) => void
  setStatusFilter: (filter: string | null) => void
  setSortBy: (sort: 'priority' | 'created' | 'severity') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      severityFilter: null,
      statusFilter: null,
      sortBy: 'priority',
      setSeverityFilter: (filter) => set({ severityFilter: filter }),
      setStatusFilter: (filter) => set({ statusFilter: filter }),
      setSortBy: (sort) => set({ sortBy: sort }),
    }),
    {
      name: 'eb-ui-store',
    }
  )
)
