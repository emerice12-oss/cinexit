'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toastManager, type ToastType } from '@/lib/utils/toast'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  timestamp: number
}

interface ToastContextType {
  toasts: Toast[]
  show: (type: ToastType, title: string, description?: string, duration?: number) => string
  dismiss: (id: string) => void
  success: (title: string, description?: string, duration?: number) => string
  error: (title: string, description?: string, duration?: number) => string
  warning: (title: string, description?: string, duration?: number) => string
  info: (title: string, description?: string, duration?: number) => string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts)
    return () => {
      unsubscribe()
    }
  }, [])

  const value: ToastContextType = {
    toasts,
    show: (type, title, description, duration) => toastManager.show(type, title, description, duration),
    dismiss: (id) => toastManager.dismiss(id),
    success: (title, description, duration) => toastManager.success(title, description, duration),
    error: (title, description, duration) => toastManager.error(title, description, duration),
    warning: (title, description, duration) => toastManager.warning(title, description, duration),
    info: (title, description, duration) => toastManager.info(title, description, duration),
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
