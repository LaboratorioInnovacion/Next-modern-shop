"use client"

import { useState } from "react"
import { Search, ShoppingCart, User, Sun, Moon, Menu, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { useTheme } from "@/contexts/theme-context"
import Navigation from "./navigation"
import CartDropdown from "./cart-dropdown"
import MobileMenu from "./mobile-menu"
import SearchModal from "./search-modal"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import AuthModal from "./auth-modal"

export default function Header() {
  const { getTotalItems, toggleCart } = useCart()
  const { getWishlistCount } = useWishlist()
  const { theme, toggleTheme } = useTheme()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <>
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  ModernShop
                </span>
              </Link>
              <div className="hidden md:block">
                <Navigation />
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Búsqueda desktop */}
              <div className="relative hidden lg:block">
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-60 xl:w-72 bg-slate-800/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-blue-500 transition-all duration-300 cursor-pointer"
                  onClick={() => setShowSearchModal(true)}
                  readOnly
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* Búsqueda móvil */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-slate-800 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
                onClick={() => setShowSearchModal(true)}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              {/* Tema - oculto en móvil pequeño */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex hover:bg-slate-800 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 items-center justify-center"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>

              {/* Favoritos - oculto en móvil pequeño */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex hover:bg-slate-800 transition-all duration-300 relative w-8 h-8 sm:w-10 sm:h-10 items-center justify-center"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {/* {getWishlistCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {getWishlistCount()}
                  </span>
                )} */}
              </Button>

              {/* Carrito */}
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-slate-800 transition-all duration-300 relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
                onClick={toggleCart}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {getTotalItems()}
                  </span>
                )}
              </Button>

              {/* Usuario desktop */}
              {isAuthenticated ? (
                <div className="relative group hidden md:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-slate-800 transition-all duration-300 w-10 h-10 flex items-center justify-center"
                  >
                    <img
                      src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff"}
                      alt={user?.name}
                      className="w-6 h-6 rounded-full"
                    />
                  </Button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-slate-700">
                      <p className="text-white font-medium">{user?.name}</p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link href="/perfil">
                        <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded">
                          Mi Perfil
                        </button>
                      </Link>
                      <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded">
                        Mis Pedidos
                      </button>
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-slate-800 transition-all duration-300 w-10 h-10 items-center justify-center hidden md:flex"
                  onClick={() => setShowAuthModal(true)}
                >
                  <User className="w-5 h-5" />
                </Button>
              )}

              {/* Menú móvil */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-slate-800 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
                onClick={() => setShowMobileMenu(true)}
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <CartDropdown />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode="login" />
      <MobileMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </>
  )
}
