"use client"

import { useState, useEffect } from "react"
import { X, Home, Package, Grid, ShoppingCart, User, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MobileMenu({ isOpen, onClose }) {
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Pequeño delay para permitir que la animación se ejecute
      setTimeout(() => setAnimateIn(true), 50)
    } else {
      setAnimateIn(false)
    }
  }, [isOpen])

  const navItems = [
    { href: "/", label: "Inicio", icon: <Home className="w-5 h-5" /> },
    { href: "/productos", label: "Productos", icon: <Package className="w-5 h-5" /> },
    { href: "/categorias", label: "Categorías", icon: <Grid className="w-5 h-5" /> },
    { href: "/carrito", label: "Carrito", icon: <ShoppingCart className="w-5 h-5" /> },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`fixed inset-y-0 left-0 w-[80%] max-w-sm bg-slate-900 shadow-xl transform transition-all duration-300 ease-in-out ${
          animateIn ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ModernShop
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-gray-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  {pathname === item.href && (
                    <span className="ml-auto">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Categories Section */}
            <div className="mt-8 px-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Categorías Populares
              </h3>
              <div className="space-y-1">
                {["Electrónica", "Moda", "Hogar", "Deportes"].map((category) => (
                  <Link
                    key={category}
                    href={`/categorias`}
                    onClick={onClose}
                    className="block px-4 py-2 text-gray-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* User Section */}
          <div className="border-t border-slate-800 p-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={user?.avatar || "/placeholder.svg"}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full border border-slate-700"
                  />
                  <div>
                    <p className="font-medium text-white">{user?.name}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/perfil" onClick={onClose}>
                    <Button variant="outline" className="w-full border-slate-700 text-white bg-transparent">
                      <User className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-transparent"
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-white bg-transparent"
                  onClick={() => {
                    if (onShowAuthModal) onShowAuthModal();
                    onClose();
                  }}
                >
                  Iniciar Sesión
                </Button>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={onClose}>
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
