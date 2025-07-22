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

  // Datos de ejemplo
  const mockProducts = [
    {
      id: 1,
      name: "Audífonos Premium",
      price: "$199.99",
      originalPrice: "$249.99",
      rating: 4.8,
      reviews: 128,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
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
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
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
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
      category: "electronics",
      badge: "Oferta",
      discount: "25%",
      description: "Altavoz Bluetooth portátil con sonido 360° y batería de larga duración",
      inStock: true,
    },
    {
      id: 4,
      name: "Cámara Digital",
      price: "$599.99",
      originalPrice: "$799.99",
      rating: 4.6,
      reviews: 95,
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop",
      category: "electronics",
      badge: "Bestseller",
      discount: "25%",
      description: "Cámara profesional con lente intercambiable y grabación 4K",
      inStock: true,
    },
    {
      id: 5,
      name: "Laptop Gaming",
      price: "$1299.99",
      originalPrice: "$1599.99",
      rating: 4.8,
      reviews: 342,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
      category: "electronics",
      badge: "Nuevo",
      discount: "19%",
      description: "Laptop gaming de alto rendimiento con RTX y procesador Intel i7",
      inStock: true,
    },
    {
      id: 6,
      name: "Smartphone Pro",
      price: "$899.99",
      originalPrice: "$1099.99",
      rating: 4.7,
      reviews: 567,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
      category: "electronics",
      badge: "Oferta",
      discount: "18%",
      description: "Smartphone con cámara triple, pantalla OLED y carga rápida",
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
