"use client"

import { createContext, useContext, useState } from "react"
import { ToastContainer } from "@/components/ui/toast.jsx"

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = ({ type = "info", title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random()
    const newToast = { id, type, title, message, duration }

    setToasts((prev) => [...prev, newToast])

    return id
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const toast = {
    success: (message, title) => addToast({ type: "success", title, message }),
    error: (message, title) => addToast({ type: "error", title, message }),
    warning: (message, title) => addToast({ type: "warning", title, message }),
    info: (message, title) => addToast({ type: "info", title, message }),
  }

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
