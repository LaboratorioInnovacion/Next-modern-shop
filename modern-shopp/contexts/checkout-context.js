"use client"

import { createContext, useContext, useReducer } from "react"

const CheckoutContext = createContext()

const checkoutReducer = (state, action) => {
  switch (action.type) {
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.payload,
      }

    case "SET_SHIPPING_INFO":
      return {
        ...state,
        shippingInfo: action.payload,
      }

    case "SET_PAYMENT_METHOD":
      return {
        ...state,
        paymentMethod: action.payload,
      }

    case "SET_BILLING_INFO":
      return {
        ...state,
        billingInfo: action.payload,
      }

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      }

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      }

    case "RESET_CHECKOUT":
      return {
        currentStep: 1,
        shippingInfo: null,
        paymentMethod: null,
        billingInfo: null,
        loading: false,
        error: null,
      }

    default:
      return state
  }
}

export function CheckoutProvider({ children }) {
  const [state, dispatch] = useReducer(checkoutReducer, {
    currentStep: 1,
    shippingInfo: null,
    paymentMethod: null,
    billingInfo: null,
    loading: false,
    error: null,
  })

  const setStep = (step) => {
    dispatch({ type: "SET_STEP", payload: step })
  }

  const setShippingInfo = (info) => {
    dispatch({ type: "SET_SHIPPING_INFO", payload: info })
  }

  const setPaymentMethod = (method) => {
    dispatch({ type: "SET_PAYMENT_METHOD", payload: method })
  }

  const setBillingInfo = (info) => {
    dispatch({ type: "SET_BILLING_INFO", payload: info })
  }

  const setLoading = (loading) => {
    dispatch({ type: "SET_LOADING", payload: loading })
  }

  const setError = (error) => {
    dispatch({ type: "SET_ERROR", payload: error })
  }

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  const resetCheckout = () => {
    dispatch({ type: "RESET_CHECKOUT" })
  }

  const processPayment = async (paymentData) => {
    setLoading(true)
    clearError()

    try {
      // Simular procesamiento de pago
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simular éxito/fallo aleatorio para demo
      if (Math.random() > 0.1) {
        // 90% de éxito
        return {
          success: true,
          transactionId: `TXN_${Date.now()}`,
          message: "Pago procesado exitosamente",
        }
      } else {
        throw new Error("Error al procesar el pago. Intenta nuevamente.")
      }
    } catch (error) {
      setError(error.message)
      return {
        success: false,
        error: error.message,
      }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    currentStep: state.currentStep,
    shippingInfo: state.shippingInfo,
    paymentMethod: state.paymentMethod,
    billingInfo: state.billingInfo,
    loading: state.loading,
    error: state.error,
    setStep,
    setShippingInfo,
    setPaymentMethod,
    setBillingInfo,
    setLoading,
    setError,
    clearError,
    resetCheckout,
    processPayment,
  }

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext)
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider")
  }
  return context
}
