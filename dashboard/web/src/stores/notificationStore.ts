/**
 * notificationStore.ts — Global notification banner store
 *
 * Push notifications from anywhere (SSE handlers, TeamsWatch, etc.),
 * displayed as a banner at the top of the app.
 */
import { create } from 'zustand'

export interface AppNotification {
  id: string
  msg: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
  autoDismissMs?: number
}

interface NotificationStore {
  notifications: AppNotification[]
  push: (msg: string, type?: AppNotification['type'], autoDismissMs?: number) => void
  dismiss: (id: string) => void
  clear: () => void
}

let counter = 0

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  push: (msg, type = 'info', autoDismissMs = 10000) => {
    const id = `notif-${++counter}-${Date.now()}`
    const notification: AppNotification = { id, msg, type, timestamp: Date.now(), autoDismissMs }
    set((s) => ({ notifications: [...s.notifications.slice(-4), notification] }))

    if (autoDismissMs > 0) {
      setTimeout(() => {
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }))
      }, autoDismissMs)
    }
  },

  dismiss: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  clear: () => set({ notifications: [] }),
}))
