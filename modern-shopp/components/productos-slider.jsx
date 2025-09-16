"use client"

import { useProducts } from "@/contexts/product-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useRef } from "react"

export default function ProductosSlider() {
  const { products, loading } = useProducts()
  const { addToCart } = useCart()
  const sliderRef = useRef(null)
  const scrollStep = 260 // px, igual al ancho de la tarjeta

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -scrollStep * 2, behavior: "smooth" })
    }
  }
  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: scrollStep * 2, behavior: "smooth" })
    }
  }

  if (loading || !products.length) {
    return (
      <div className="min-h-[200px] flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-4"></div>
        <span className="text-gray-400">Cargando productos...</span>
      </div>
    )
  }

  return (
    <section className="w-full py-6 sm:py-8 bg-slate-900">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Productos Destacados</h2>
          <Link href="/productos">
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 bg-transparent text-sm">
              Ver todos
            </Button>
          </Link>
        </div>
        <div className="relative">
          {/* Flechas de navegación */}
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/80 hover:bg-blue-500/80 text-white rounded-full p-2 shadow-lg flex items-center justify-center"
            style={{ boxShadow: "0 0 16px 0 #0006" }}
            onClick={scrollLeft}
            aria-label="Anterior"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/80 hover:bg-blue-500/80 text-white rounded-full p-2 shadow-lg flex items-center justify-center"
            style={{ boxShadow: "0 0 16px 0 #0006" }}
            onClick={scrollRight}
            aria-label="Siguiente"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
          </button>
          {/* Fade lateral */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-slate-900/90 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-slate-900/90 to-transparent z-10" />
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {products.slice(0, 16).map((product) => (
              <Card
                key={product.id}
                className="min-w-[180px] max-w-[180px] sm:min-w-[220px] sm:max-w-[220px] md:min-w-[260px] md:max-w-[260px] bg-slate-800 border-slate-700 overflow-hidden group hover:shadow-2xl transition-all duration-300 flex-shrink-0 snap-start"
              >
                <Link href={`/producto/${product.id}`}>
                  <div className="relative aspect-square bg-slate-700 overflow-hidden cursor-pointer">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded">
                          $-{product.discount}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-2 sm:p-3">
                  <Link href={`/producto/${product.id}`}>
                    <h3 className="font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors cursor-pointer line-clamp-2 text-xs sm:text-sm">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center mb-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-gray-300">{product.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-base font-bold text-blue-400">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-500 line-through">${product.originalPrice}</span>
                    )}
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-xs h-8 mt-1"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Agregar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
