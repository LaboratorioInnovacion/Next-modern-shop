"use client"

import * as React from "react"

const Tabs = ({ value, onValueChange, className, children, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(value)

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleValueChange = (newValue) => {
    setActiveTab(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <div className={className} {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { activeTab, onValueChange: handleValueChange })
          : child,
      )}
    </div>
  )
}

const TabsList = React.forwardRef(({ className, children, activeTab, onValueChange, ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ${className || ""}`}
    {...props}
  >
    {React.Children.map(children, (child) =>
      React.isValidElement(child) ? React.cloneElement(child, { activeTab, onValueChange }) : child,
    )}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, children, activeTab, onValueChange, ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      activeTab === value
        ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50"
        : "hover:bg-slate-200 dark:hover:bg-slate-700"
    } ${className || ""}`}
    onClick={() => onValueChange && onValueChange(value)}
    {...props}
  >
    {children}
  </button>
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, children, activeTab, ...props }, ref) => (
  <div
    ref={ref}
    className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 ${
      activeTab === value ? "block" : "hidden"
    } ${className || ""}`}
    {...props}
  >
    {children}
  </div>
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
