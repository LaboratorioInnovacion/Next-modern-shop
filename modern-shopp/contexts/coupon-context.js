
// coupon-context.js
"use client"

import { createContext, useContext, useState } from "react"
import { useToast } from "./toast-context"

const CouponContext = createContext()

export function CouponProvider({ children }) {
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const { toast } = useToast()

  // Cupones disponibles
  const availableCoupons = [
    {
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      description: "10% de descuento para nuevos usuarios",
      minAmount: 0,
      maxDiscount: 50,
      isActive: true,
    },
    {
      code: "SAVE20",
      type: "percentage",
      value: 20,
      description: "20% de descuento en compras superiores a $100",
      minAmount: 100,
      maxDiscount: 100,
      isActive: true,
    },
    {
      code: "FREE15",
      type: "fixed",
      value: 15,
      description: "$15 de descuento",
      minAmount: 50,
      maxDiscount: 15,
      isActive: true,
    },
    {
      code: "FREESHIP",
      type: "shipping",
      value: 0,
      description: "Envío gratuito",
      minAmount: 0,
      maxDiscount: 9.99,
      isActive: true,
    },
  ]

  const applyCoupon = (code, cartTotal) => {
    const coupon = availableCoupons.find((c) => c.code.toLowerCase() === code.toLowerCase() && c.isActive)

    if (!coupon) {
      toast.error("Código de cupón inválido")
      return false
    }

    if (cartTotal < coupon.minAmount) {
      toast.error(`Este cupón requiere una compra mínima de $${coupon.minAmount}`)
      return false
    }

    if (appliedCoupon?.code === coupon.code) {
      toast.warning("Este cupón ya está aplicado")
      return false
    }

    setAppliedCoupon(coupon)
    toast.success(`¡Cupón aplicado! ${coupon.description}`)
    return true
  }

  const removeCoupon = () => {
    if (appliedCoupon) {
      setAppliedCoupon(null)
      toast.info("Cupón removido")
    }
  }

  const calculateDiscount = (cartTotal, shippingCost = 0) => {
    if (!appliedCoupon) return { discount: 0, newShipping: shippingCost }

    let discount = 0
    let newShipping = shippingCost

    switch (appliedCoupon.type) {
      case "percentage":
        discount = Math.min((cartTotal * appliedCoupon.value) / 100, appliedCoupon.maxDiscount)
        break
      case "fixed":
        discount = Math.min(appliedCoupon.value, cartTotal)
        break
      case "shipping":
        newShipping = 0
        discount = shippingCost
        break
    }

    return { discount: Math.round(discount * 100) / 100, newShipping }
  }

  const value = {
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    calculateDiscount,
    availableCoupons: availableCoupons.filter((c) => c.isActive),
  }

  return <CouponContext.Provider value={value}>{children}</CouponContext.Provider>
}

export const useCoupon = () => {
  const context = useContext(CouponContext)
  if (!context) {
    throw new Error("useCoupon must be used within a CouponProvider")
  }
  return context
}
