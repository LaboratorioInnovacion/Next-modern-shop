// context/wishlist-context.js
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  // Load wishlist when session is available
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!session?.user) return
      setLoading(true)
      try {
        const res = await fetch('/api/wishlist')
        const data = await res.json()
        if (res.ok) {
          setWishlist(data)
        } else {
          console.error(data.error || 'Error fetching wishlist')
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [session])

  const addToWishlist = async (productId) => {
    if (!session?.user) return
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (res.ok) {
        setWishlist(prev => {
          if (prev.find(item => item.id === productId)) return prev
          return [...prev, { id: productId }] // Simplificado si no tenés el objeto entero
        })
      } else {
        console.error(data.error || 'Error adding to wishlist')
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const removeFromWishlist = async (productId) => {
    if (!session?.user) return
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (res.ok) {
        setWishlist(prev => prev.filter(item => item.id !== productId))
      } else {
        console.error(data.error || 'Error removing from wishlist')
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId)
  }

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)

// // wishlist-context.js
// "use client"

// import { createContext, useContext, useReducer, useEffect } from "react"
// import { useToast } from "./toast-context"

// const WishlistContext = createContext()

// const wishlistReducer = (state, action) => {
//   switch (action.type) {
//     case "ADD_TO_WISHLIST":
//       if (state.items.find((item) => item.id === action.payload.id)) {
//         return state
//       }
//       return {
//         ...state,
//         items: [...state.items, action.payload],
//       }

//     case "REMOVE_FROM_WISHLIST":
//       return {
//         ...state,
//         items: state.items.filter((item) => item.id !== action.payload),
//       }

//     case "CLEAR_WISHLIST":
//       return {
//         ...state,
//         items: [],
//       }

//     case "LOAD_WISHLIST":
//       return {
//         ...state,
//         items: action.payload,
//       }

//     default:
//       return state
//   }
// }

// export function WishlistProvider({ children }) {
//   const [state, dispatch] = useReducer(wishlistReducer, {
//     items: [],
//   })
//   const { toast } = useToast()

//   // Cargar wishlist del localStorage al iniciar
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const savedWishlist = localStorage.getItem("modernshop-wishlist")
//       if (savedWishlist) {
//         try {
//           const parsedWishlist = JSON.parse(savedWishlist)
//           dispatch({ type: "LOAD_WISHLIST", payload: parsedWishlist })
//         } catch (error) {
//           console.error("Error loading wishlist:", error)
//         }
//       }
//     }
//   }, [])

//   // Guardar wishlist en localStorage cuando cambie
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("modernshop-wishlist", JSON.stringify(state.items))
//     }
//   }, [state.items])

//   const addToWishlist = (product) => {
//     dispatch({ type: "ADD_TO_WISHLIST", payload: product })
//     toast.success(`${product.name} agregado a favoritos`, "¡Agregado a favoritos!")
//   }

//   const removeFromWishlist = (productId) => {
//     const product = state.items.find((item) => item.id === productId)
//     dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId })
//     if (product) {
//       toast.info(`${product.name} eliminado de favoritos`)
//     }
//   }

//   const toggleWishlist = (product) => {
//     const isInWishlist = state.items.find((item) => item.id === product.id)
//     if (isInWishlist) {
//       removeFromWishlist(product.id)
//     } else {
//       addToWishlist(product)
//     }
//   }

//   const isInWishlist = (productId) => {
//     return state.items.some((item) => item.id === productId)
//   }

//   const clearWishlist = () => {
//     dispatch({ type: "CLEAR_WISHLIST" })
//     toast.info("Lista de favoritos limpiada")
//   }

//   const getWishlistCount = () => {
//     return state.items.length
//   }

//   const value = {
//     items: state.items,
//     addToWishlist,
//     removeFromWishlist,
//     toggleWishlist,
//     isInWishlist,
//     clearWishlist,
//     getWishlistCount,
//   }

//   return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
// }

// export const useWishlist = () => {
//   const context = useContext(WishlistContext)
//   if (!context) {
//     throw new Error("useWishlist must be used within a WishlistProvider")
//   }
//   return context
// }
