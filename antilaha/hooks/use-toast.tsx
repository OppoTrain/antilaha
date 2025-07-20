// This file is based on the shadcn/ui toast component
// https://ui.shadcn.com/docs/components/toast

import { useState, useEffect, useCallback } from "react"

type ToastProps = {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
}

type Toast = ToastProps & {
  id: string
  visible: boolean
}

type ToastActionType = {
  toast: (props: ToastProps) => void
  dismiss: (toastId?: string) => void
  update: (id: string, props: ToastProps) => void
}

// Create a unique ID for each toast
const generateId = () => Math.random().toString(36).substring(2, 9)

export function useToast(): ToastActionType {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    // Set up timers for auto-dismissing toasts
    const timers = toasts.map((toast) => {
      if (toast.visible && toast.duration !== Infinity) {
        const timer = setTimeout(() => {
          dismiss(toast.id)
        }, toast.duration || 5000)
        return { id: toast.id, timer }
      }
      return null
    }).filter(Boolean) as { id: string; timer: NodeJS.Timeout }[]

    // Clean up timers on unmount
    return () => {
      timers.forEach((timer) => {
        clearTimeout(timer.timer)
      })
    }
  }, [toasts])

  const toast = useCallback((props: ToastProps) => {
    const id = props.id || generateId()
    const duration = props.duration || 5000

    setToasts((prevToasts) => {
      // Check if toast with this ID already exists
      const existingToastIndex = prevToasts.findIndex((t) => t.id === id)

      // If it exists, update it
      if (existingToastIndex !== -1) {
        const updatedToasts = [...prevToasts]
        updatedToasts[existingToastIndex] = {
          ...updatedToasts[existingToastIndex],
          ...props,
          id,
          visible: true,
          duration,
        }
        return updatedToasts
      }

      // Otherwise, add a new toast
      return [
        ...prevToasts,
        {
          ...props,
          id,
          visible: true,
          duration,
        },
      ]
    })

    return id
  }, [])

  const dismiss = useCallback((toastId?: string) => {
    setToasts((prevToasts) => {
      if (toastId) {
        // Dismiss specific toast
        return prevToasts.map((t) => (t.id === toastId ? { ...t, visible: false } : t))
      }
      // Dismiss all toasts
      return prevToasts.map((t) => ({ ...t, visible: false }))
    })

    // Remove toast from state after animation completes
    setTimeout(() => {
      setToasts((prevToasts) => {
        if (toastId) {
          return prevToasts.filter((t) => t.id !== toastId)
        }
        return []
      })
    }, 300) // Animation duration
  }, [])

  const update = useCallback((id: string, props: ToastProps) => {
    setToasts((prevToasts) => {
      const toastIndex = prevToasts.findIndex((t) => t.id === id)
      if (toastIndex === -1) return prevToasts

      const updatedToasts = [...prevToasts]
      updatedToasts[toastIndex] = {
        ...updatedToasts[toastIndex],
        ...props,
        id,
      }
      return updatedToasts
    })
  }, [])

  return {
    toast,
    dismiss,
    update,
  }
}