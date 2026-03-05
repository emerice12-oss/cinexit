'use client'

import { useToast } from '@/lib/context/toast-context'

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
}

const iconStyles = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

export function ToastDisplay() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg border-l-4 shadow-lg ${toastStyles[toast.type]} animate-in slide-in-from-right-5 fade-in`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold mt-0.5">{iconStyles[toast.type]}</span>
              <div>
                <p className="font-semibold">{toast.title}</p>
                {toast.description && <p className="text-sm opacity-75 mt-1">{toast.description}</p>}
              </div>
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-lg opacity-50 hover:opacity-100 transition-opacity ml-4"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
