"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

const toastTypes = {
  success: {
    icon: CheckCircle,
    className: "bg-green-500/10 border-green-500/20 text-green-400",
    iconColor: "text-green-400",
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-500/10 border-red-500/20 text-red-400",
    iconColor: "text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    iconColor: "text-yellow-400",
  },
  info: {
    icon: Info,
    className: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    iconColor: "text-blue-400",
  },
}

export function Toast({ id, type = "info", title, message, duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const config = toastTypes[type]
  const Icon = config.icon

  useEffect(() => {
    setIsVisible(true)

    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div
        className={`
        border rounded-lg p-4 backdrop-blur-sm shadow-lg
        ${config.className}
      `}
      >
        <div className="flex items-start space-x-3">
          <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
          <div className="flex-1 min-w-0">
            {title && <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>}
            <p className="text-sm text-gray-300">{message}</p>
          </div>
          <button onClick={handleClose} className="flex-shrink-0 text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  )
}
