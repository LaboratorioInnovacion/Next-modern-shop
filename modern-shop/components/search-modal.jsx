"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, TrendingUp, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useProducts } from "@/contexts/product-context"
import Link from "next/link"

export default function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef(null)
  const { products } = useProducts()

  // Búsquedas populares predefinidas
  const popularSearches = ["Audífonos", "Smartphone", "Laptop", "Smartwatch", "Altavoz", "Cámara", "Gaming", "Fitness"]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    // Cargar búsquedas recientes del localStorage
    const saved = localStorage.getItem("recent-searches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (searchTerm.length > 0) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        const results = products
          .filter(
            (product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.category.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .slice(0, 6)
        setSearchResults(results)
        setIsSearching(false)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }, [searchTerm, products])

  const handleSearch = (term) => {
    if (term.trim()) {
      // Agregar a búsquedas recientes
      const newRecentSearches = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5)
      setRecentSearches(newRecentSearches)
      localStorage.setItem("recent-searches", JSON.stringify(newRecentSearches))

      // Redirigir a página de productos con búsqueda
      window.location.href = `/productos?search=${encodeURIComponent(term)}`
      onClose()
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recent-searches")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 h-full flex items-start">
        <div
          className="w-full max-w-2xl mx-auto bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-700 max-h-[80vh] sm:max-h-[70vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header de búsqueda */}
          <div className="flex items-center p-4 sm:p-6 border-b border-slate-700 flex-shrink-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch(searchTerm)}
              className="flex-1 bg-transparent border-0 text-white placeholder-gray-400 focus:ring-0 text-base sm:text-lg"
            />
            <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {searchTerm.length > 0 ? (
              // Resultados de búsqueda
              <div className="p-4 sm:p-6">
                {isSearching ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-gray-400 text-sm sm:text-base">Buscando...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold text-sm sm:text-base">Resultados de búsqueda</h3>
                      <Button
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                        onClick={() => handleSearch(searchTerm)}
                      >
                        Ver todos
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      </Button>
                    </div>
                    {searchResults.map((product) => (
                      <Link key={product.id} href={`/producto/${product.id}`} onClick={onClose}>
                        <Card className="bg-slate-700/50 border-slate-600 hover:bg-slate-700 transition-colors cursor-pointer">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium text-sm sm:text-base truncate">{product.name}</h4>
                                <p className="text-gray-400 text-xs sm:text-sm">{product.category}</p>
                              </div>
                              <div className="text-blue-400 font-bold text-sm sm:text-base flex-shrink-0">
                                {product.price}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-400 text-sm sm:text-base">No se encontraron productos</p>
                    <p className="text-gray-500 text-xs sm:text-sm">Intenta con otros términos de búsqueda</p>
                  </div>
                )}
              </div>
            ) : (
              // Búsquedas recientes y populares
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-white font-semibold flex items-center text-sm sm:text-base">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Búsquedas recientes
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-gray-400 hover:text-white text-xs sm:text-sm"
                      >
                        Limpiar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {recentSearches.map((search, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSearch(search)}
                          className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 h-auto"
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Búsquedas populares
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {popularSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(search)}
                        className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 h-auto"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
