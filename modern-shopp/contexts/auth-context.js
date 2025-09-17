"use client"

import { createContext, useContext, useEffect, useReducer } from "react"
import { signIn, signOut, useSession } from "next-auth/react"

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: true, error: null }

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
      }

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }

    case "CLEAR_ERROR":
      return { ...state, error: null }

    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const { data: session, status } = useSession()
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  })

  // Sync NextAuth session with context state
  useEffect(() => {
    if (status === "loading") {
      dispatch({ type: "SET_LOADING" })
    } else if (status === "authenticated") {
      // Asegurarse de que el rol esté presente en session.user
      const userWithRole = {
        ...session.user,
        role: session.user.role || "USER"
      }
      console.log("User role:", userWithRole.role) // Debugging line
      dispatch({ type: "SET_USER", payload: userWithRole })
    } else {
      dispatch({ type: "SET_USER", payload: null })
    }
  }, [session, status])

  const login = async (email, password) => {
    dispatch({ type: "SET_LOADING" })
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res.ok) {
      return { success: true }
    } else {
      dispatch({ type: "SET_ERROR", payload: res.error || "Error al iniciar sesión" })
      return { success: false, error: res.error }
    }
  }

  const register = async (userData) => {
    dispatch({ type: "SET_LOADING" })
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Error al registrar")

      // login inmediato
      await login(userData.email, userData.password)
      return { success: true }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    dispatch({ type: "SET_USER", payload: null })
  }

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    role: state.user?.role || "USER",
    isAdmin: state.user?.role === "ADMIN",
    login,
    register,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

// // auth-context.js
// "use client"

// import { createContext, useContext, useReducer, useEffect } from "react"

// const AuthContext = createContext()

// const authReducer = (state, action) => {
//   switch (action.type) {
//     case "LOGIN_START":
//       return {
//         ...state,
//         loading: true,
//         error: null,
//       }

//     case "LOGIN_SUCCESS":
//       return {
//         ...state,
//         user: action.payload,
//         isAuthenticated: true,
//         loading: false,
//         error: null,
//       }

//     case "LOGIN_ERROR":
//       return {
//         ...state,
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//         error: action.payload,
//       }

//     case "LOGOUT":
//       return {
//         ...state,
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//         error: null,
//       }

//     case "UPDATE_PROFILE":
//       return {
//         ...state,
//         user: { ...state.user, ...action.payload },
//       }

//     case "CLEAR_ERROR":
//       return {
//         ...state,
//         error: null,
//       }

//     default:
//       return state
//   }
// }

// export function AuthProvider({ children }) {
//   const [state, dispatch] = useReducer(authReducer, {
//     user: null,
//     isAuthenticated: false,
//     loading: false,
//     error: null,
//   })

//   // Verificar si hay usuario guardado al cargar
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const savedUser = localStorage.getItem("modernshop-user")
//       if (savedUser) {
//         try {
//           const user = JSON.parse(savedUser)
//           dispatch({ type: "LOGIN_SUCCESS", payload: user })
//         } catch (error) {
//           localStorage.removeItem("modernshop-user")
//         }
//       }
//     }
//   }, [])

//   // Guardar usuario en localStorage cuando cambie
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       if (state.user) {
//         localStorage.setItem("modernshop-user", JSON.stringify(state.user))
//       } else {
//         localStorage.removeItem("modernshop-user")
//       }
//     }
//   }, [state.user])

//   const login = async (email, password) => {
//     dispatch({ type: "LOGIN_START" })

//     try {
//       // Simular llamada a API
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       // Validación básica
//       if (email && password.length >= 6) {
//         const cleanEmail = email.trim().toLowerCase()

//         const user = {
//           id: Date.now(),
//           email: cleanEmail,
//           name: cleanEmail.split("@")[0],
//           avatar: `https://ui-avatars.com/api/?name=${cleanEmail.split("@")[0]}&background=3b82f6&color=fff`,
//           addresses: [],
//           orders: [],
//           createdAt: new Date().toISOString(),
//         }

//         dispatch({ type: "LOGIN_SUCCESS", payload: user })
//         return { success: true }
//       } else {
//         throw new Error("Credenciales inválidas")
//       }
//     } catch (error) {
//       dispatch({ type: "LOGIN_ERROR", payload: error.message })
//       return { success: false, error: error.message }
//     }
//   }

//   const register = async (userData) => {
//     dispatch({ type: "LOGIN_START" })

//     try {
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       const { name, email, password } = userData

//       if (!name || !email || password.length < 6) {
//         throw new Error("Todos los campos son requeridos y la contraseña debe tener al menos 6 caracteres")
//       }

//       const user = {
//         id: Date.now(),
//         name,
//         email,
//         avatar: `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff`,
//         addresses: [],
//         orders: [],
//         createdAt: new Date().toISOString(),
//       }

//       dispatch({ type: "LOGIN_SUCCESS", payload: user })
//       return { success: true }
//     } catch (error) {
//       dispatch({ type: "LOGIN_ERROR", payload: error.message })
//       return { success: false, error: error.message }
//     }
//   }

//   const logout = () => {
//     dispatch({ type: "LOGOUT" })
//   }

//   const updateProfile = (profileData) => {
//     dispatch({ type: "UPDATE_PROFILE", payload: profileData })
//   }

//   const addAddress = (address) => {
//     const newAddress = {
//       id: Date.now(),
//       ...address,
//       isDefault: state.user.addresses.length === 0,
//     }

//     const updatedAddresses = [...state.user.addresses, newAddress]
//     updateProfile({ addresses: updatedAddresses })
//   }

//   const updateAddress = (addressId, addressData) => {
//     const updatedAddresses = state.user.addresses.map((addr) =>
//       addr.id === addressId ? { ...addr, ...addressData } : addr,
//     )
//     updateProfile({ addresses: updatedAddresses })
//   }

//   const deleteAddress = (addressId) => {
//     const updatedAddresses = state.user.addresses.filter((addr) => addr.id !== addressId)
//     updateProfile({ addresses: updatedAddresses })
//   }

//   const setDefaultAddress = (addressId) => {
//     const updatedAddresses = state.user.addresses.map((addr) => ({
//       ...addr,
//       isDefault: addr.id === addressId,
//     }))
//     updateProfile({ addresses: updatedAddresses })
//   }

//   const clearError = () => {
//     dispatch({ type: "CLEAR_ERROR" })
//   }

//   const value = {
//     user: state.user,
//     isAuthenticated: state.isAuthenticated,
//     loading: state.loading,
//     error: state.error,
//     login,
//     register,
//     logout,
//     updateProfile,
//     addAddress,
//     updateAddress,
//     deleteAddress,
//     setDefaultAddress,
//     clearError,
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }
