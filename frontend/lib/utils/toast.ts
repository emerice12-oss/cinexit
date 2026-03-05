/**
 * Production-grade toast notification system for DeFi transactions
 * Replaces browser alerts with proper user feedback
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  timestamp: number
  duration?: number
}

// In-memory toast queue for production UX
class ToastManager {
  private toasts: Toast[] = []
  private listeners: Set<(toasts: Toast[]) => void> = new Set()

  subscribe(callback: (toasts: Toast[]) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notify() {
    this.listeners.forEach(cb => cb([...this.toasts]))
  }

  show(type: ToastType, title: string, description?: string, duration = 5000) {
    const id = `${Date.now()}-${Math.random()}`
    const toast: Toast = { id, type, title, description, timestamp: Date.now(), duration }
    
    this.toasts.push(toast)
    this.notify()

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration)
    }

    return id
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  }

  success(title: string, description?: string, duration?: number) {
    return this.show('success', title, description, duration)
  }

  error(title: string, description?: string, duration?: number) {
    return this.show('error', title, description, duration ?? 6000)
  }

  warning(title: string, description?: string, duration?: number) {
    return this.show('warning', title, description, duration)
  }

  info(title: string, description?: string, duration?: number) {
    return this.show('info', title, description, duration)
  }

  clear() {
    this.toasts = []
    this.notify()
  }
}

export const toastManager = new ToastManager()
