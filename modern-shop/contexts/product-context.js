"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ProductContext = createContext()

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 1000])

  // Datos de ejemplo - en producción vendrían de una API
  const mockProducts = [
    {
      id: 1,
      name: "Audífonos Premium",
      price: "$199.99",
      originalPrice: "$249.99",
      rating: 4.8,
      reviews: 128,
      image: "/placeholder.svg?height=300&width=400",
      category: "electronics",
      badge: "Bestseller",
      discount: "20%",
      description: "Audífonos de alta calidad con cancelación de ruido activa",
      inStock: true,
    },
    {
      id: 2,
      name: "Reloj Inteligente",
      price: "$299.99",
      originalPrice: "$399.99",
      rating: 4.9,
      reviews: 256,
      image: "/placeholder.svg?height=300&width=400",
      category: "electronics",
      badge: "Nuevo",
      discount: "25%",
      description: "Smartwatch con GPS, monitor cardíaco y resistencia al agua",
      inStock: true,
    },
    {
      id: 3,
      name: "Altavoz Inalámbrico",
      price: "$149.99",
      originalPrice: "$199.99",
      rating: 4.7,
      reviews: 189,
      image: "/placeholder.svg?height=300&width=400",
      category: "electronics",
      badge: "Oferta",
      discount: "25%",
      description: "Altavoz Bluetooth portátil con sonido 360° y batería de larga duración",
      inStock: true,
    },
  ]

  const mockCategories = [
    { id: "all", name: "Todas las categorías", count: 150 },
    { id: "electronics", name: "Electrónica", count: 45 },
    { id: "fashion", name: "Moda", count: 38 },
    { id: "home", name: "Hogar y Decoración", count: 42 },
    { id: "sports", name: "Deportes", count: 25 },
  ]

  useEffect(() => {
    // Simular carga de datos
    setLoading(true)
    setTimeout(() => {
      setProducts(mockProducts)
      setCategories(mockCategories)
      setLoading(false)
    }, 1000)
  }, [])

  const getFilteredProducts = () => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const price = Number.parseFloat(product.price.replace("$", ""))
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1]

      return matchesSearch && matchesCategory && matchesPrice
    })
  }

  const getFeaturedProducts = () => {
    return products.filter((product) => product.badge === "Bestseller" || product.badge === "Nuevo")
  }

  const getProductById = (id) => {
    return products.find((product) => product.id === Number.parseInt(id))
  }

  const searchProducts = (term) => {
    setSearchTerm(term)
  }

  const filterByCategory = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  const filterByPrice = (range) => {
    setPriceRange(range)
  }

  const addToWishlist = (productId) => {
    // Implementar lógica de wishlist
    console.log("Added to wishlist:", productId)
  }

  const value = {
    products,
    categories,
    loading,
    searchTerm,
    selectedCategory,
    priceRange,
    getFilteredProducts,
    getFeaturedProducts,
    getProductById,
    searchProducts,
    filterByCategory,
    filterByPrice,
    addToWishlist,
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
