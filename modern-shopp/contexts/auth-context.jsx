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
    console.log("Session data:", session) // Debugging line
    if (status === "loading") {
      dispatch({ type: "SET_LOADING" })
    } else if (status === "authenticated") {
      // Normalizar campos para compatibilidad Google/Credentials
      const userWithRole = {
        ...session.user,
        role: session.user.role || "USER",
        avatar: session.user.avatar || session.user.image,
        name: session.user.name || (session.user.email ? session.user.email.split("@")[0] : "Usuario")
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