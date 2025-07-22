"use client"

import { useState } from "react"
import { useProducts } from "@/contexts/product-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function CategoriasPage() {
  const { categories, products, filterByCategory } = useProducts()
  const [hoveredCategory, setHoveredCategory] = useState(null)

  const categoryDetails = [
    {
      id: "electronics",
      name: "Electrónica",
      description: "Últimas tecnologías y gadgets innovadores",
      image: "/placeholder.svg?height=300&width=400",
      gradient: "from-blue-600/80 to-purple-600/80",
      icon: <Package className="w-8 h-8" />,
      features: ["Smartphones", "Laptops", "Auriculares", "Smartwatches"],
    },
    {
      id: "fashion",
      name: "Moda",
      description: "Tendencias actuales y estilos únicos",
      image: "/placeholder.svg?height=300&width=400",
      gradient: "from-pink-600/80 to-rose-600/80",
      icon: <TrendingUp className="w-8 h-8" />,
      features: ["Ropa", "Zapatos", "Accesorios", "Bolsos"],
    },
    {
      id: "home",
      name: "Hogar y Decoración",
      description: "Todo para crear tu hogar ideal",
      image: "/placeholder.svg?height=300&width=400",
      gradient: "from-green-600/80 to-emerald-600/80",
      icon: <Package className="w-8 h-8" />,
      features: ["Muebles", "Decoración", "Cocina", "Jardín"],
    },
    {
      id: "sports",
      name: "Deportes",
      description: "Equipamiento para una vida activa",
      image: "/placeholder.svg?height=300&width=400",
      gradient: "from-orange-600/80 to-red-600/80",
      icon: <TrendingUp className="w-8 h-8" />,
      features: ["Fitness", "Deportes", "Outdoor", "Nutrición"],
    },
  ]

  const getProductCountByCategory = (categoryId) => {
    if (categoryId === "all") return products.length
    return products.filter((product) => product.category === categoryId).length
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Explora Nuestras Categorías
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Descubre productos organizados por categorías para encontrar exactamente lo que necesitas
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{products.length}+</div>
              <div className="text-gray-300">Productos Totales</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{categories.length - 1}</div>
              <div className="text-gray-300">Categorías</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-300">Marcas</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">4.8★</div>
              <div className="text-gray-300">Valoración Media</div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de Categorías */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {categoryDetails.map((category) => (
            <Card
              key={category.id}
              className="bg-slate-800/50 border-slate-700/50 overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-70 group-hover:opacity-90 transition-opacity duration-300`}
                ></div>

                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 text-white">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center mb-2 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg mr-2 sm:mr-4">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                        <p className="text-white/90">{getProductCountByCategory(category.id)} productos</p>
                      </div>
                    </div>

                    <p className="text-white/80 mb-4">{category.description}</p>

                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {category.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div
                      className={`flex items-center text-white font-medium transition-all duration-300 ${
                        hoveredCategory === category.id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
                      }`}
                    >
                      <Link href={`/productos?categoria=${category.id}`}>
                        <Button
                          variant="secondary"
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 text-xs sm:text-sm py-1 sm:py-2"
                          onClick={() => filterByCategory(category.id)}
                        >
                          Explorar Categoría
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Categorías Populares */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Categorías Más Populares</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "Smartphones",
              "Laptops",
              "Auriculares",
              "Relojes",
              "Cámaras",
              "Gaming",
              "Ropa Hombre",
              "Ropa Mujer",
              "Zapatos",
              "Bolsos",
              "Joyería",
              "Perfumes",
              "Muebles",
              "Decoración",
              "Cocina",
              "Baño",
              "Jardín",
              "Iluminación",
            ].map((subcategory, index) => (
              <Card
                key={index}
                className="bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-4 text-center">
                  <div className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {subcategory}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Contáctanos y te ayudaremos a encontrar el producto perfecto para ti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/productos">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8">
                Ver Todos los Productos
              </Button>
            </Link>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 bg-transparent">
              Contactar Soporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
