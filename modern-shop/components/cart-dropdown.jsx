"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CartDropdown() {
  const { items, isOpen, removeFromCart, updateQuantity, getTotalPrice, toggleCart } = useCart()
  const router = useRouter()

  // Prevenir scroll cuando el carrito está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCheckout = () => {
    toggleCart()
    router.push("/checkout")
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={toggleCart}>
      <div
        className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-slate-900 shadow-2xl transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-slate-700">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Carrito de Compras</span>
              <span className="sm:hidden">Carrito</span>
              <span className="ml-2 text-sm font-normal text-gray-400">({items.length})</span>
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="text-gray-400 hover:text-white w-8 h-8 sm:w-10 sm:h-10"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {items.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Tu carrito está vacío</p>
                <Button
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-800 bg-transparent text-sm sm:text-base"
                  onClick={toggleCart}
                >
                  Continuar Comprando
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm sm:text-base truncate">{item.name}</h3>
                          <p className="text-blue-400 font-bold text-sm sm:text-base">{item.price}</p>
                          <div className="flex items-center mt-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-white w-6 sm:w-8 text-center text-sm sm:text-base">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 hover:text-red-300 flex-shrink-0"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-slate-700 p-3 sm:p-4 lg:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-gray-400">Envío:</span>
                  <span className="text-white font-medium">{getTotalPrice() > 50 ? "Gratis" : "$9.99"}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-700 pt-3 sm:pt-4">
                  <span className="text-base sm:text-lg font-semibold text-white">Total:</span>
                  <span className="text-lg sm:text-xl font-bold text-blue-400">
                    ${(getTotalPrice() + (getTotalPrice() > 50 ? 0 : 9.99)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 py-3 sm:py-6 text-sm sm:text-lg font-semibold"
                  onClick={handleCheckout}
                >
                  Proceder al Checkout
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-700 bg-transparent text-sm sm:text-base"
                  onClick={toggleCart}
                >
                  Continuar Comprando
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
