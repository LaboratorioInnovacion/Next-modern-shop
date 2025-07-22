"use client"

import { Star, Heart, Eye, ShoppingCart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCardSkeleton } from "@/components/ui/skeleton.jsx"
import { useCart } from "@/contexts/cart-context"
import { useProducts } from "@/contexts/product-context"
import { useToast } from "@/contexts/toast-context"
import Link from "next/link"
import { useState } from "react"

export default function FeaturedProducts() {
  const { addToCart } = useCart()
  const { getFeaturedProducts, loading } = useProducts()
  const { toast } = useToast()
  const [addingToCart, setAddingToCart] = useState(null)
  const featuredProducts = getFeaturedProducts()

  const handleAddToCart = async (product) => {
    setAddingToCart(product.id)

    // Simular un pequeño delay para mejor UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    addToCart(product)
    toast.success(`${product.name} agregado al carrito`, "¡Producto agregado!")

    setAddingToCart(null)
  }

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 backdrop-blur-sm rounded-full border border-blue-500/20 mb-4 md:mb-6">
              <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-blue-300 text-sm font-medium">Productos Destacados</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Los Más Populares
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
              Descubre los productos más valorados y populares entre nuestros clientes
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-12 md:py-20 bg-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/20 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-3 sm:px-4 relative">
        <div className="text-center mb-8 sm:mb-10 md:mb-16">
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500/10 backdrop-blur-sm rounded-full border border-blue-500/20 mb-3 sm:mb-4 md:mb-6 animate-pulse">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-1.5 sm:mr-2" />
            <span className="text-blue-300 text-xs sm:text-sm font-medium">Productos Destacados</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Los Más Populares
          </h2>

          <p className="text-gray-400 text-sm sm:text-base md:text-xl max-w-3xl mx-auto leading-relaxed px-4">
            Descubre los productos más valorados y populares entre nuestros clientes, seleccionados especialmente para
            ti
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {featuredProducts.map((product, index) => (
            <Card
              key={product.id}
              className="bg-slate-800/50 border-slate-700/50 overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-700 transform hover:scale-[1.02] hover:-translate-y-2"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <Link href={`/producto/${product.id}`}>
                <div className="relative aspect-square bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden cursor-pointer">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Badges actualizados */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 transform group-hover:scale-110 transition-transform duration-300">
                    <span
                      className={`px-2 py-1 sm:px-3 sm:py-1 text-xs font-semibold rounded-full backdrop-blur-sm shadow-lg ${
                        product.badge === "Bestseller"
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900"
                          : product.badge === "Nuevo"
                            ? "bg-gradient-to-r from-green-400 to-green-500 text-green-900"
                            : "bg-gradient-to-r from-red-400 to-red-500 text-red-900"
                      }`}
                    >
                      {product.badge}
                    </span>
                  </div>

                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 transform group-hover:scale-110 transition-transform duration-300">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
                      -{product.discount}
                    </span>
                  </div>

                  {/* Hover actions actualizados */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center space-x-3 sm:space-x-4">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white text-gray-900 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white text-gray-900 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-200"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </Button>
                  </div>
                </div>
              </Link>

              <CardContent className="p-3 sm:p-4 md:p-6 relative">
                <Link href={`/producto/${product.id}`}>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 md:mb-3 text-white group-hover:text-blue-300 transition-colors duration-300 cursor-pointer line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating actualizado */}
                <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-current transform group-hover:scale-110"
                            : "text-gray-600"
                        }`}
                        style={{ transitionDelay: `${i * 50}ms` }}
                      />
                    ))}
                    <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-300 font-medium">{product.rating}</span>
                  </div>
                  <span className="mx-1 sm:mx-2 text-gray-500">•</span>
                  <span className="text-xs sm:text-sm text-gray-400">({product.reviews})</span>
                </div>

                {/* Precio actualizado */}
                <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm sm:text-base md:text-lg text-gray-500 line-through">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-400 font-medium">Ahorras {product.discount}</div>
                  </div>
                </div>

                {/* Botones actualizados */}
                <div className="flex space-x-2 md:space-x-3">
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 h-8 sm:h-10 md:h-12 relative overflow-hidden group/btn text-xs sm:text-sm md:text-base"
                    onClick={() => handleAddToCart(product)}
                    disabled={addingToCart === product.id}
                  >
                    {addingToCart === product.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 border-b-2 border-white mr-1 sm:mr-2"></div>
                        <span className="hidden sm:inline">Agregando...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 md:mr-2 transition-transform group-hover/btn:scale-110" />
                        <span>Agregar</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700 bg-transparent h-8 sm:h-10 md:h-12 px-2 sm:px-3 md:px-6 transition-all duration-300 hover:border-blue-500 hover:text-blue-300 text-xs sm:text-sm md:text-base"
                    onClick={() => (window.location.href = `/producto/${product.id}`)}
                  >
                    Ver
                  </Button>
                </div>

                {/* Stock indicator actualizado */}
                <div className="mt-2 sm:mt-3 md:mt-4 flex items-center justify-center">
                  <div className="flex items-center text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1.5 sm:mr-2 animate-pulse"></div>
                    En stock • Envío gratis
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action actualizado */}
        <div className="text-center mt-8 sm:mt-10 md:mt-16">
          <Link href="/productos">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
              Ver Todos los Productos
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1.5 sm:ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
