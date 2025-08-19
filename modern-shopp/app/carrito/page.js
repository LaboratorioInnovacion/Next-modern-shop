"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CarritoPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart()

  useEffect(() => {
    console.log(items)
  }, [items])

  const subtotal = getTotalPrice()
  // const shipping = subtotal > 50 ? 0 : 9.99
  const shipping = subtotal > 50 ? 0 : 9.99
  // const tax = subtotal * 0.08
  const tax = subtotal
  // const total = subtotal + shipping + tax
  const total = subtotal

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16">
          <div className="text-center py-12 sm:py-20">
            <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-600 mx-auto mb-6 sm:mb-8" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Tu carrito está vacío</h1>
            <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8 px-4">
              ¡Agrega algunos productos increíbles a tu carrito!
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-3 sm:px-8 sm:py-3 text-sm sm:text-base">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Carrito de Compras</h1>
            <p className="text-gray-400 text-sm sm:text-base">{getTotalItems()} productos en tu carrito</p>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800 bg-transparent w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuar Comprando
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Items del Carrito */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full sm:w-20 md:w-24 aspect-square object-cover rounded-lg flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1 sm:mb-2 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-sm sm:text-base md:text-lg text-gray-500 line-through">
                            {item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-8 h-8 sm:w-10 sm:h-10 border-slate-600 bg-transparent flex-shrink-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <span className="text-white w-8 sm:w-12 text-center font-semibold text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-8 h-8 sm:w-10 sm:h-10 border-slate-600 bg-transparent flex-shrink-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 gap-4">
              <Button
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent w-full sm:w-auto"
                onClick={clearCart}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vaciar Carrito
              </Button>
            </div>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-8">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Resumen del Pedido</h2>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-400">Envío</span>
                    <span className="text-white font-semibold">
                      {shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {/* <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-400">Impuestos</span>
                    <span className="text-white font-semibold">${tax.toFixed(2)}</span>
                  </div> */}
                  <div className="border-t border-slate-600 pt-3 sm:pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg sm:text-xl font-bold text-white">Total</span>
                      <span className="text-xl sm:text-2xl font-bold text-blue-400">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {subtotal < 50 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-blue-300 text-xs sm:text-sm">
                      ¡Agrega ${(50 - subtotal).toFixed(2)} más para obtener envío gratuito!
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                    onClick={() => router.push("/checkout")}
                  >
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Proceder al Checkout
                  </Button>

                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm mb-2">Código de descuento</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ingresa tu código"
                        className="bg-slate-700 border-slate-600 text-white text-sm flex-1"
                      />
                      <Button variant="outline" className="border-slate-600 bg-transparent text-sm px-3">
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-600">
                  <div className="flex items-center justify-center space-x-4 text-xs sm:text-sm text-gray-400">
                    <span>🔒 Compra segura</span>
                    <span>📦 Envío rápido</span>
                    <span>↩️ Devoluciones fáciles</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
