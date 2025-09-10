"use client"

import { useEffect, useState } from "react"
import { useProducts } from "@/contexts/product-context"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Grid, List, Star, Heart, Eye, ShoppingCart, Filter } from "lucide-react"
import Link from "next/link"

export default function ProductosPage() {
  const {
    products,
    categories,
    loading,
    searchTerm,
    selectedCategory,
    getFilteredProducts,
    searchProducts,
    filterByCategory,
  } = useProducts()

  const { addToCart } = useCart()
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("name")
  const [showFilters, setShowFilters] = useState(false)

  const filteredProducts = getFilteredProducts()

  useEffect(() => {
    console.log(products)
  }, [products])

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return Number.parseFloat(a.price.replace("$", "")) - Number.parseFloat(b.price.replace("$", ""))
      case "price-high":
        return Number.parseFloat(b.price.replace("$", "")) - Number.parseFloat(a.price.replace("$", ""))
      case "rating":
        return b.rating - a.rating
      case "name":
      default:
        return a.name.localeCompare(b.name)
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando productos...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4">Todos los Productos</h1>
        <p className="text-gray-400">Descubre nuestra amplia selección de productos premium</p>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-4">
          {/* Barra de búsqueda */}
          <div className="flex w-full">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => searchProducts(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Controles de filtro y vista */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex-1 min-w-[180px]">
              <select
                value={selectedCategory}
                onChange={(e) => filterByCategory(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2 w-full text-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2 w-full text-sm"
              >
                <option value="name">Ordenar por Nombre</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
                <option value="rating">Mejor Valorados</option>
              </select>
            </div>

            <div className="flex border border-slate-600 rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none h-10 w-10"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-l-none h-10 w-10"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="border-slate-600 h-10">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Precio</h3>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      className="bg-slate-700 border-slate-600 text-white text-sm"
                    />
                    <span className="text-gray-400">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      className="bg-slate-700 border-slate-600 text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Valoración</h3>
                  <div className="flex items-center gap-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <Button
                        key={rating}
                        variant="outline"
                        className="border-slate-600 h-8 px-2 text-sm bg-transparent"
                      >
                        {rating}★
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Disponibilidad</h3>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" className="rounded bg-slate-700 border-slate-600" />
                      En stock
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" className="rounded bg-slate-700 border-slate-600" />
                      Ofertas
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" className="border-slate-600 text-sm mr-2 bg-transparent">
                  Limpiar
                </Button>
                <Button className="bg-blue-500 hover:bg-blue-600 text-sm">Aplicar filtros</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4 sm:mb-6">
        <p className="text-gray-400 text-sm">
          Mostrando {sortedProducts.length} de {products.length} productos
        </p>
      </div>

      {/* Grid de Productos */}
      <div
        className={`grid gap-3 sm:gap-4 md:gap-6 ${
          viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
        }`}
      >
        {sortedProducts.map((product) => (
          <Card
            key={product.id}
            className={`bg-slate-800 border-slate-700 overflow-hidden group hover:shadow-xl transition-all duration-300 ${
              viewMode === "list" ? "flex flex-col sm:flex-row" : ""
            }`}
          >
            <Link href={`/producto/${product.id}`}>
              <div
                className={`relative bg-slate-700 overflow-hidden cursor-pointer ${
                  viewMode === "list" ? "w-full sm:w-48 aspect-square sm:aspect-auto sm:h-full" : "aspect-square"
                }`}
              >
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {product.badge && (
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.badge === "Bestseller"
                          ? "bg-yellow-500 text-yellow-900"
                          : product.badge === "Nuevo"
                            ? "bg-green-500 text-green-900"
                            : "bg-red-500 text-red-900"
                      }`}
                    >
                      {product.badge}
                    </span>
                  </div>
                )}

                {product.discount && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <span className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded">
                      -{product.discount}
                    </span>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center space-x-2 sm:space-x-4">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-gray-900 w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-gray-900 w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-200"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </Link>

            <CardContent className={`p-3 sm:p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
              <Link href={`/producto/${product.id}`}>
                <h3 className="font-semibold text-white mb-1 sm:mb-2 group-hover:text-blue-300 transition-colors cursor-pointer line-clamp-2 text-sm sm:text-base">
                  {product.name}
                </h3>
              </Link>

              {viewMode === "list" && (
                <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{product.description}</p>
              )}

              {/* Rating */}
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-600"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs sm:text-sm text-gray-300">{product.rating}</span>
                </div>
                <span className="mx-1 sm:mx-2 text-gray-500">•</span>
                <span className="text-xs sm:text-sm text-gray-400">({product.reviews})</span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-base sm:text-xl font-bold text-blue-400">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs sm:text-sm text-gray-500 line-through">${product.originalPrice}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-xs sm:text-sm h-8 sm:h-10"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Agregar
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700 bg-transparent text-xs sm:text-sm h-8 sm:h-10"
                  onClick={() => (window.location.href = `/producto/${product.id}`)}
                >
                  Ver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No se encontraron productos que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  )
}
