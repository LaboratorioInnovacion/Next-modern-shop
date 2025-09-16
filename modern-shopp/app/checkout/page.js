"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useCheckout } from "@/contexts/checkout-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, Check, CreditCard, MapPin, Package, Shield, Truck, Lock } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const {
    currentStep,
    shippingInfo,
    paymentMethod,
    billingInfo,
    loading,
    error,
    setStep,
    setShippingInfo,
    setPaymentMethod,
    setBillingInfo,
    processPayment,
    resetCheckout,
  } = useCheckout()

  const [formData, setFormData] = useState({
    // Información de envío
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "España",
    // Información de pago
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  })

  // Mostrar modal de login si no está autenticado
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    if (items.length > 0 && !isAuthenticated) {
      setShowLoginPrompt(true)
    }
  }, [items, isAuthenticated])

  // Redirigir si no hay items en el carrito
  useEffect(() => {
    if (items.length === 0) {
      router.push("/carrito")
    }
  }, [items, router])

  // Llenar datos del usuario si está autenticado
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ")[1] || "",
        email: user.email || "",
      }))
    }
  }, [user])

  const subtotal = getTotalPrice()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.21 // IVA 21%
  const total = subtotal + shipping + tax

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStepComplete = (step) => {
    switch (step) {
      case 1:
        // Validar información de envío
        const requiredShippingFields = ["firstName", "lastName", "email", "phone", "address", "city", "zipCode"]
        const isShippingValid = requiredShippingFields.every((field) => formData[field].trim() !== "")

        if (!isShippingValid) {
          alert("Por favor completa todos los campos requeridos")
          return
        }

        setShippingInfo({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        })
        setStep(2)
        break

      case 2:
        // Validar método de pago
        if (!paymentMethod) {
          alert("Por favor selecciona un método de pago")
          return
        }

        if (paymentMethod === "card") {
          const requiredPaymentFields = ["cardNumber", "expiryDate", "cvv", "cardName"]
          const isPaymentValid = requiredPaymentFields.every((field) => formData[field].trim() !== "")

          if (!isPaymentValid) {
            alert("Por favor completa todos los datos de la tarjeta")
            return
          }
        }

        setBillingInfo({
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          cardName: formData.cardName,
        })
        setStep(3)
        break

      case 3:
        // Procesar pago
        handlePayment()
        break
    }
  }

  const handlePayment = async () => {
    if (paymentMethod === "mercadopago") {
      // Redirigir a MercadoPago
      try {
        const res = await fetch("/api/mercadopago", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            payer: {
              email: formData.email || "usuario@email.com"
            }
          })
        });
        const data = await res.json();
        if (data.init_point && data.preference_id) {
          // Crear la orden en la base de datos con el external_reference (preference_id)
          const orderRes = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.id || null,
              status: "pendiente_pago",
              total,
              subtotal,
              tax,
              shipping,
              shippingAddress: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country
              },
              billingAddress: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country
              },
              paymentMethod,
              paymentStatus: "pendiente",
              externalReference: data.preference_id,
              items: items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
              }))
            })
          });
          // Redirigir a MercadoPago aunque la orden falle
          window.location.href = data.init_point;
          return;
        } else {
          alert("Error al iniciar pago con MercadoPago");
        }
      } catch (e) {
        alert("Error al conectar con MercadoPago");
      }
      return;
    }
    // Para cualquier método, crear la orden en la base de datos
    let status = "pendiente";
    let paymentStatus = "pendiente";
    if (paymentMethod === "card" || paymentMethod === "paypal") {
      status = "pagado";
      paymentStatus = "pagado";
    }
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || null,
          status,
          total,
          subtotal,
          tax,
          shipping,
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          },
          billingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          },
          paymentMethod,
          paymentStatus,
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });
      if (orderRes.ok) {
        const order = await orderRes.json();
        clearCart();
        resetCheckout();
        router.push(`/checkout/confirmacion?id=${order.id}`);
        return;
      } else {
        alert("Error al crear la orden");
        return;
      }
    } catch (err) {
      alert("Error al crear la orden");
      return;
    }
    // Flujo normal para otros métodos
    const paymentData = {
      amount: total,
      currency: "EUR",
      items: items,
      shippingInfo,
      paymentMethod,
      billingInfo,
    }
    const result = await processPayment(paymentData)
    if (result.success) {
      // Limpiar carrito y redirigir a confirmación
      clearCart()
      resetCheckout()
      router.push(`/checkout/confirmacion?id=${result.transactionId}`)
    }
  }

  if (items.length === 0) {
    return null // El useEffect redirigirá
  }

  if (showLoginPrompt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Inicia Sesión para Continuar</h1>
          <p className="text-gray-400 mb-8">Necesitas una cuenta para proceder con el checkout</p>
          <div className="space-y-4">
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              onClick={() => setShowLoginPrompt(false)}
            >
              Iniciar Sesión
            </Button>
            <Link href="/carrito">
              <Button
                variant="outline"
                className="w-full border-slate-600 text-white hover:bg-slate-800 bg-transparent"
              >
                Volver al Carrito
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: "Información de Envío", icon: <Truck className="w-5 h-5" /> },
    { number: 2, title: "Método de Pago", icon: <CreditCard className="w-5 h-5" /> },
    { number: 3, title: "Confirmación", icon: <Check className="w-5 h-5" /> },
  ]

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-400 text-sm sm:text-base">Completa tu pedido de {getTotalItems()} productos</p>
        </div>
        <Link href="/carrito">
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 bg-transparent w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Carrito
          </Button>
        </Link>
      </div>

      {/* Progress Steps */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center w-full sm:w-auto">
              <div
                className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${
                  currentStep >= step.number
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-slate-600 text-gray-400"
                }`}
              >
                {currentStep > step.number ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : step.icon}
              </div>
              <div className="ml-2 sm:ml-4">
                <div className={`font-medium text-xs sm:text-base ${currentStep >= step.number ? "text-white" : "text-gray-400"}`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`hidden sm:flex flex-1 h-0.5 mx-8 ${currentStep > step.number ? "bg-blue-500" : "bg-slate-600"}`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Formulario Principal */}
        <div className="w-full lg:col-span-2">
          {/* Paso 1: Información de Envío */}
          {currentStep === 1 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Información de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Nombre *</label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Apellidos *</label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                      placeholder="Tus apellidos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Teléfono *</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Dirección *</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                    placeholder="Calle, número, piso, puerta"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Ciudad *</label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                      placeholder="Madrid"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Provincia</label>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                      placeholder="Madrid"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Código Postal *</label>
                    <Input
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                      placeholder="28001"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4">
                  <Button
                    onClick={() => handleStepComplete(1)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 w-full sm:w-auto"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paso 2: Método de Pago */}
          {currentStep === 2 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Opciones de Pago */}
                <div className="space-y-4">
                  {/* Tarjeta */}
                  <div
                    className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          paymentMethod === "card" ? "border-blue-500 bg-blue-500" : "border-slate-400"
                        }`}
                      ></div>
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="font-medium text-xs sm:text-base">Tarjeta de Crédito/Débito</span>
                    </div>
                  </div>

                  {/* PayPal */}
                  <div
                    className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "paypal"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => setPaymentMethod("paypal")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          paymentMethod === "paypal" ? "border-blue-500 bg-blue-500" : "border-slate-400"
                        }`}
                      ></div>
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="font-medium text-xs sm:text-base">PayPal</span>
                    </div>
                  </div>

                  {/* MercadoPago */}
                  <div
                    className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "mercadopago"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => setPaymentMethod("mercadopago")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          paymentMethod === "mercadopago" ? "border-blue-500 bg-blue-500" : "border-slate-400"
                        }`}
                      ></div>
                      <img src="/mercadopago.svg" alt="MercadoPago" className="w-6 h-6 mr-2" />
                      <span className="font-medium text-xs sm:text-base">MercadoPago</span>
                    </div>
                  </div>

                  {/* Transferencia Bancaria */}
                  <div
                    className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "transferencia"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => setPaymentMethod("transferencia")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          paymentMethod === "transferencia" ? "border-blue-500 bg-blue-500" : "border-slate-400"
                        }`}
                      ></div>
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="font-medium text-xs sm:text-base">Transferencia Bancaria</span>
                    </div>
                  </div>
                </div>

                {/* Formulario de Tarjeta */}
                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t border-slate-600">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Nombre en la Tarjeta *</label>
                      <Input
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                        placeholder="Nombre como aparece en la tarjeta"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Número de Tarjeta *</label>
                      <Input
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Fecha de Vencimiento *</label>
                        <Input
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                          placeholder="MM/AA"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">CVV *</label>
                        <Input
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-white text-xs sm:text-sm"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-slate-600 text-white hover:bg-slate-700 bg-transparent w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                  <Button
                    onClick={() => handleStepComplete(2)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 w-full sm:w-auto order-1 sm:order-2"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paso 3: Confirmación */}
          {currentStep === 3 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Confirmar Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Información de Envío */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                    <MapPin className="w-4 h-4 mr-2" />
                    Dirección de Envío
                  </h3>
                  <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
                    <p className="text-white text-sm sm:text-base">
                      {shippingInfo?.firstName} {shippingInfo?.lastName}
                    </p>
                    <p className="text-gray-300 text-sm">{shippingInfo?.address}</p>
                    <p className="text-gray-300 text-sm">
                      {shippingInfo?.city}, {shippingInfo?.zipCode}
                    </p>
                    <p className="text-gray-300 text-sm">{shippingInfo?.phone}</p>
                  </div>
                </div>

                {/* Método de Pago */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Método de Pago
                  </h3>
                  <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
                    {paymentMethod === "card" ? (
                      <p className="text-white text-sm sm:text-base">
                        Tarjeta terminada en ****{formData.cardNumber.slice(-4)}
                      </p>
                    ) : paymentMethod === "paypal" ? (
                      <p className="text-white text-sm sm:text-base">PayPal</p>
                    ) : paymentMethod === "mercadopago" ? (
                      <p className="text-white text-sm sm:text-base">MercadoPago</p>
                    ) : paymentMethod === "transferencia" ? (
                      <p className="text-white text-sm sm:text-base">Transferencia Bancaria</p>
                    ) : null}
                  </div>
                </div>

                {/* Instrucciones de Transferencia Bancaria en confirmación */}
                {paymentMethod === "transferencia" && (
                  <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg p-4">
                    <h4 className="text-yellow-200 font-semibold mb-2 flex items-center"><Package className="w-4 h-4 mr-2" />Datos para Transferencia Bancaria</h4>
                    <p className="text-yellow-200 text-sm mb-2">Por favor, realiza una transferencia bancaria a la siguiente cuenta:</p>
                    <div className="bg-yellow-800/60 rounded p-3 mb-2">
                      <p className="text-yellow-100 text-sm font-semibold">Banco: Banco Ejemplo</p>
                      <p className="text-yellow-100 text-sm font-semibold">IBAN: ES12 3456 7890 1234 5678 9012</p>
                      <p className="text-yellow-100 text-sm font-semibold">Titular: Tienda Online S.L.</p>
                      <p className="text-yellow-100 text-sm font-semibold">Concepto: Tu nombre y número de pedido</p>
                    </div>
                    <p className="text-yellow-200 text-xs">Una vez recibamos el pago, procesaremos y enviaremos tu pedido. Si tienes dudas, contáctanos.</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between pt-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-slate-600 text-white hover:bg-slate-700 bg-transparent w-full sm:w-auto order-2 sm:order-1"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                  <Button
                    onClick={() => handleStepComplete(3)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 w-full sm:w-auto order-1 sm:order-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Confirmar y Pagar ${total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resumen del Pedido */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800 border-slate-700 sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs sm:text-sm font-medium truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="text-blue-400 font-semibold text-sm">{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-600 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Envío</span>
                  <span className="text-white">{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">IVA (21%)</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-600 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg sm:text-xl font-bold text-white">Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-blue-400">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Garantías */}
              <div className="border-t border-slate-600 pt-4 space-y-3">
                <div className="flex items-center text-xs sm:text-sm text-gray-300">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2 flex-shrink-0" />
                  <span>Compra 100% Segura</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-300">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-2 flex-shrink-0" />
                  <span>Envío en 24-48h</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-300">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 mr-2 flex-shrink-0" />
                  <span>Devoluciones gratuitas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

////////////////codigo anterior
// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { useCart } from "@/contexts/cart-context"
// import { useAuth } from "@/contexts/auth-context"
// import { useCheckout } from "@/contexts/checkout-context"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { ArrowLeft, ArrowRight, Check, CreditCard, MapPin, Package, Shield, Truck, Lock } from "lucide-react"
// import Link from "next/link"

// export default function CheckoutPage() {
//   const router = useRouter()
//   const { items, getTotalPrice, getTotalItems, clearCart } = useCart()
//   const { user, isAuthenticated } = useAuth()
//   const {
//     currentStep,
//     shippingInfo,
//     paymentMethod,
//     billingInfo,
//     loading,
//     error,
//     setStep,
//     setShippingInfo,
//     setPaymentMethod,
//     setBillingInfo,
//     processPayment,
//     resetCheckout,
//   } = useCheckout()

//   const [formData, setFormData] = useState({
//     // Información de envío
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     address: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     country: "España",
//     // Información de pago
//     cardNumber: "",
//     expiryDate: "",
//     cvv: "",
//     cardName: "",
//   })

//   // Mostrar modal de login si no está autenticado
//   const [showLoginPrompt, setShowLoginPrompt] = useState(false)

//   useEffect(() => {
//     if (items.length > 0 && !isAuthenticated) {
//       setShowLoginPrompt(true)
//     }
//   }, [items, isAuthenticated])

//   // Redirigir si no hay items en el carrito
//   useEffect(() => {
//     if (items.length === 0) {
//       router.push("/carrito")
//     }
//   }, [items, router])

//   // Llenar datos del usuario si está autenticado
//   useEffect(() => {
//     if (user) {
//       setFormData((prev) => ({
//         ...prev,
//         firstName: user.name?.split(" ")[0] || "",
//         lastName: user.name?.split(" ")[1] || "",
//         email: user.email || "",
//       }))
//     }
//   }, [user])

//   const subtotal = getTotalPrice()
//   const shipping = subtotal > 50 ? 0 : 9.99
//   const tax = subtotal * 0.21 // IVA 21%
//   const total = subtotal + shipping + tax

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleStepComplete = (step) => {
//     switch (step) {
//       case 1:
//         // Validar información de envío
//         const requiredShippingFields = ["firstName", "lastName", "email", "phone", "address", "city", "zipCode"]
//         const isShippingValid = requiredShippingFields.every((field) => formData[field].trim() !== "")

//         if (!isShippingValid) {
//           alert("Por favor completa todos los campos requeridos")
//           return
//         }

//         setShippingInfo({
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           email: formData.email,
//           phone: formData.phone,
//           address: formData.address,
//           city: formData.city,
//           state: formData.state,
//           zipCode: formData.zipCode,
//           country: formData.country,
//         })
//         setStep(2)
//         break

//       case 2:
//         // Validar método de pago
//         if (!paymentMethod) {
//           alert("Por favor selecciona un método de pago")
//           return
//         }

//         if (paymentMethod === "card") {
//           const requiredPaymentFields = ["cardNumber", "expiryDate", "cvv", "cardName"]
//           const isPaymentValid = requiredPaymentFields.every((field) => formData[field].trim() !== "")

//           if (!isPaymentValid) {
//             alert("Por favor completa todos los datos de la tarjeta")
//             return
//           }
//         }

//         setBillingInfo({
//           cardNumber: formData.cardNumber,
//           expiryDate: formData.expiryDate,
//           cvv: formData.cvv,
//           cardName: formData.cardName,
//         })
//         setStep(3)
//         break

//       case 3:
//         // Procesar pago
//         handlePayment()
//         break
//     }
//   }

//   const handlePayment = async () => {
//     if (paymentMethod === "mercadopago") {
//       // Redirigir a MercadoPago
//       try {
//         const res = await fetch("/api/mercadopago", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             items: items.map(item => ({
//               name: item.name,
//               quantity: item.quantity,
//               price: item.price
//             })),
//             payer: {
//               email: formData.email || "usuario@email.com"
//             }
//           })
//         });
//         const data = await res.json();
//         if (data.init_point && data.preference_id) {
//           // Crear la orden en la base de datos con el external_reference (preference_id)
//           const orderRes = await fetch("/api/orders", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               userId: user?.id || null,
//               status: "pendiente_pago",
//               total,
//               subtotal,
//               tax,
//               shipping,
//               shippingAddress: {
//                 firstName: formData.firstName,
//                 lastName: formData.lastName,
//                 email: formData.email,
//                 phone: formData.phone,
//                 address: formData.address,
//                 city: formData.city,
//                 state: formData.state,
//                 zipCode: formData.zipCode,
//                 country: formData.country
//               },
//               billingAddress: {
//                 firstName: formData.firstName,
//                 lastName: formData.lastName,
//                 email: formData.email,
//                 phone: formData.phone,
//                 address: formData.address,
//                 city: formData.city,
//                 state: formData.state,
//                 zipCode: formData.zipCode,
//                 country: formData.country
//               },
//               paymentMethod,
//               paymentStatus: "pendiente",
//               externalReference: data.preference_id,
//               items: items.map(item => ({
//                 productId: item.id,
//                 quantity: item.quantity,
//                 price: item.price
//               }))
//             })
//           });
//           // Redirigir a MercadoPago aunque la orden falle
//           window.location.href = data.init_point;
//           return;
//         } else {
//           alert("Error al iniciar pago con MercadoPago");
//         }
//       } catch (e) {
//         alert("Error al conectar con MercadoPago");
//       }
//       return;
//     }
//     // Para cualquier método, crear la orden en la base de datos
//     let status = "pendiente";
//     let paymentStatus = "pendiente";
//     if (paymentMethod === "card" || paymentMethod === "paypal") {
//       status = "pagado";
//       paymentStatus = "pagado";
//     }
//     try {
//       const orderRes = await fetch("/api/orders", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId: user?.id || null,
//           status,
//           total,
//           subtotal,
//           tax,
//           shipping,
//           shippingAddress: {
//             firstName: formData.firstName,
//             lastName: formData.lastName,
//             email: formData.email,
//             phone: formData.phone,
//             address: formData.address,
//             city: formData.city,
//             state: formData.state,
//             zipCode: formData.zipCode,
//             country: formData.country
//           },
//           billingAddress: {
//             firstName: formData.firstName,
//             lastName: formData.lastName,
//             email: formData.email,
//             phone: formData.phone,
//             address: formData.address,
//             city: formData.city,
//             state: formData.state,
//             zipCode: formData.zipCode,
//             country: formData.country
//           },
//           paymentMethod,
//           paymentStatus,
//           items: items.map(item => ({
//             productId: item.id,
//             quantity: item.quantity,
//             price: item.price
//           }))
//         })
//       });
//       if (orderRes.ok) {
//         const order = await orderRes.json();
//         clearCart();
//         resetCheckout();
//         router.push(`/checkout/confirmacion?id=${order.id}`);
//         return;
//       } else {
//         alert("Error al crear la orden");
//         return;
//       }
//     } catch (err) {
//       alert("Error al crear la orden");
//       return;
//     }
//     // Flujo normal para otros métodos
//     const paymentData = {
//       amount: total,
//       currency: "EUR",
//       items: items,
//       shippingInfo,
//       paymentMethod,
//       billingInfo,
//     }
//     const result = await processPayment(paymentData)
//     if (result.success) {
//       // Limpiar carrito y redirigir a confirmación
//       clearCart()
//       resetCheckout()
//       router.push(`/checkout/confirmacion?id=${result.transactionId}`)
//     }
//   }

//   if (items.length === 0) {
//     return null // El useEffect redirigirá
//   }

//   if (showLoginPrompt) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-md mx-auto text-center">
//           <h1 className="text-3xl font-bold mb-4">Inicia Sesión para Continuar</h1>
//           <p className="text-gray-400 mb-8">Necesitas una cuenta para proceder con el checkout</p>
//           <div className="space-y-4">
//             <Button
//               className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
//               onClick={() => setShowLoginPrompt(false)}
//             >
//               Iniciar Sesión
//             </Button>
//             <Link href="/carrito">
//               <Button
//                 variant="outline"
//                 className="w-full border-slate-600 text-white hover:bg-slate-800 bg-transparent"
//               >
//                 Volver al Carrito
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   const steps = [
//     { number: 1, title: "Información de Envío", icon: <Truck className="w-5 h-5" /> },
//     { number: 2, title: "Método de Pago", icon: <CreditCard className="w-5 h-5" /> },
//     { number: 3, title: "Confirmación", icon: <Check className="w-5 h-5" /> },
//   ]

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold mb-2">Checkout</h1>
//           <p className="text-gray-400">Completa tu pedido de {getTotalItems()} productos</p>
//         </div>
//         <Link href="/carrito">
//           <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 bg-transparent">
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Volver al Carrito
//           </Button>
//         </Link>
//       </div>

//       {/* Progress Steps */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between">
//           {steps.map((step, index) => (
//             <div key={step.number} className="flex items-center">
//               <div
//                 className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
//                   currentStep >= step.number
//                     ? "bg-blue-500 border-blue-500 text-white"
//                     : "border-slate-600 text-gray-400"
//                 }`}
//               >
//                 {currentStep > step.number ? <Check className="w-6 h-6" /> : step.icon}
//               </div>
//               <div className="ml-4">
//                 <div className={`font-medium ${currentStep >= step.number ? "text-white" : "text-gray-400"}`}>
//                   {step.title}
//                 </div>
//               </div>
//               {index < steps.length - 1 && (
//                 <div
//                   className={`flex-1 h-0.5 mx-8 ${currentStep > step.number ? "bg-blue-500" : "bg-slate-600"}`}
//                 ></div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
//         {/* Formulario Principal */}
//         <div className="lg:col-span-2">
//           {/* Paso 1: Información de Envío */}
//           {currentStep === 1 && (
//             <Card className="bg-slate-800 border-slate-700">
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg sm:text-xl">
//                   <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//                   Información de Envío
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
//                     <Input
//                       name="firstName"
//                       value={formData.firstName}
//                       onChange={handleInputChange}
//                       className="bg-slate-700 border-slate-600 text-white"
//                       placeholder="Tu nombre"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Apellidos *</label>
//                     <Input
//                       name="lastName"
//                       value={formData.lastName}
//                       onChange={handleInputChange}
//                       className="bg-slate-700 border-slate-600 text-white"
//                       placeholder="Tus apellidos"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
//                     <Input
//                       name="email"
//                       type="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       className="bg-slate-700 border-slate-600 text-white"
//                       placeholder="tu@email.com"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono *</label>
//                     <Input
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleInputChange}
//                       className="bg-slate-700 border-slate-600 text-white"
//                       placeholder="+34 600 000 000"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Dirección *</label>
//                   <Input
//                     name="address"
//                     value={formData.address}
//                     onChange={handleInputChange}
//                     className="bg-slate-700 border-slate-600 text-white"
//                     placeholder="Calle, número, piso, puerta"
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad *</label>
//                     <Input
//                       name="city"
//                       value={formData.city}
//                       onChange={handleInputChange}
//                       className="bg-slate-700 border-slate-600 text-white"
//                       placeholder="Madrid"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Provincia</label>
//                     <Input
//                       name="state"
//                       value={formData.state}
//                       onChange={handleInputChange}
//                       className="bg-slate-700 border-slate-600 text-white"
//                       placeholder="Madrid"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Código Postal *</label>
//                     <Input
//                       name="zipCode"
//                       value={formData.zipCode}
//                       onChange={handleInputChange}
//                       className="bg-slate-700 border-slate-600 text-white"
//                       placeholder="28001"
//                     />
//                   </div>
//                 </div>

//                 <div className="flex flex-col sm:flex-row justify-end pt-4 gap-3">
//                   <Button
//                     onClick={() => handleStepComplete(1)}
//                     className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 w-full sm:w-auto"
//                   >
//                     Continuar
//                     <ArrowRight className="w-4 h-4 ml-2" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Paso 2: Método de Pago */}
//           {currentStep === 2 && (
//             <Card className="bg-slate-800 border-slate-700">
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg sm:text-xl">
//                   <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//                   Método de Pago
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Opciones de Pago */}
//                 <div className="space-y-4">
//                   {/* Tarjeta */}
//                   <div
//                     className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
//                       paymentMethod === "card"
//                         ? "border-blue-500 bg-blue-500/10"
//                         : "border-slate-600 hover:border-slate-500"
//                     }`}
//                     onClick={() => setPaymentMethod("card")}
//                   >
//                     <div className="flex items-center">
//                       <div
//                         className={`w-4 h-4 rounded-full border-2 mr-3 ${
//                           paymentMethod === "card" ? "border-blue-500 bg-blue-500" : "border-slate-400"
//                         }`}
//                       ></div>
//                       <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//                       <span className="font-medium text-sm sm:text-base">Tarjeta de Crédito/Débito</span>
//                     </div>
//                   </div>

//                   {/* PayPal */}
//                   <div
//                     className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
//                       paymentMethod === "paypal"
//                         ? "border-blue-500 bg-blue-500/10"
//                         : "border-slate-600 hover:border-slate-500"
//                     }`}
//                     onClick={() => setPaymentMethod("paypal")}
//                   >
//                     <div className="flex items-center">
//                       <div
//                         className={`w-4 h-4 rounded-full border-2 mr-3 ${
//                           paymentMethod === "paypal" ? "border-blue-500 bg-blue-500" : "border-slate-400"
//                         }`}
//                       ></div>
//                       <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//                       <span className="font-medium text-sm sm:text-base">PayPal</span>
//                     </div>
//                   </div>

//                   {/* MercadoPago */}
//                   <div
//                     className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
//                       paymentMethod === "mercadopago"
//                         ? "border-blue-500 bg-blue-500/10"
//                         : "border-slate-600 hover:border-slate-500"
//                     }`}
//                     onClick={() => setPaymentMethod("mercadopago")}
//                   >
//                     <div className="flex items-center">
//                       <div
//                         className={`w-4 h-4 rounded-full border-2 mr-3 ${
//                           paymentMethod === "mercadopago" ? "border-blue-500 bg-blue-500" : "border-slate-400"
//                         }`}
//                       ></div>
//                       <img src="/mercadopago.svg" alt="MercadoPago" className="w-6 h-6 mr-2" />
//                       <span className="font-medium text-sm sm:text-base">MercadoPago</span>
//                     </div>
//                   </div>

//                   {/* Transferencia Bancaria */}
//                   <div
//                     className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
//                       paymentMethod === "transferencia"
//                         ? "border-blue-500 bg-blue-500/10"
//                         : "border-slate-600 hover:border-slate-500"
//                     }`}
//                     onClick={() => setPaymentMethod("transferencia")}
//                   >
//                     <div className="flex items-center">
//                       <div
//                         className={`w-4 h-4 rounded-full border-2 mr-3 ${
//                           paymentMethod === "transferencia" ? "border-blue-500 bg-blue-500" : "border-slate-400"
//                         }`}
//                       ></div>
//                       <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//                       <span className="font-medium text-sm sm:text-base">Transferencia Bancaria</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Formulario de Tarjeta */}
//                 {paymentMethod === "card" && (
//                   <div className="space-y-4 pt-4 border-t border-slate-600">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-2">Nombre en la Tarjeta *</label>
//                       <Input
//                         name="cardName"
//                         value={formData.cardName}
//                         onChange={handleInputChange}
//                         className="bg-slate-700 border-slate-600 text-white"
//                         placeholder="Nombre como aparece en la tarjeta"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-2">Número de Tarjeta *</label>
//                       <Input
//                         name="cardNumber"
//                         value={formData.cardNumber}
//                         onChange={handleInputChange}
//                         className="bg-slate-700 border-slate-600 text-white"
//                         placeholder="1234 5678 9012 3456"
//                         maxLength={19}
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Vencimiento *</label>
//                         <Input
//                           name="expiryDate"
//                           value={formData.expiryDate}
//                           onChange={handleInputChange}
//                           className="bg-slate-700 border-slate-600 text-white"
//                           placeholder="MM/AA"
//                           maxLength={5}
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-300 mb-2">CVV *</label>
//                         <Input
//                           name="cvv"
//                           value={formData.cvv}
//                           onChange={handleInputChange}
//                           className="bg-slate-700 border-slate-600 text-white"
//                           placeholder="123"
//                           maxLength={4}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex flex-col sm:flex-row justify-between pt-4 gap-3">
//                   <Button
//                     variant="outline"
//                     onClick={() => setStep(1)}
//                     className="border-slate-600 text-white hover:bg-slate-700 bg-transparent w-full sm:w-auto order-2 sm:order-1"
//                   >
//                     <ArrowLeft className="w-4 h-4 mr-2" />
//                     Volver
//                   </Button>
//                   <Button
//                     onClick={() => handleStepComplete(2)}
//                     className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 w-full sm:w-auto order-1 sm:order-2"
//                   >
//                     Continuar
//                     <ArrowRight className="w-4 h-4 ml-2" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Paso 3: Confirmación */}
//           {currentStep === 3 && (
//             <Card className="bg-slate-800 border-slate-700">
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg sm:text-xl">
//                   <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//                   Confirmar Pedido
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Información de Envío */}
//                 <div>
//                   <h3 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
//                     <MapPin className="w-4 h-4 mr-2" />
//                     Dirección de Envío
//                   </h3>
//                   <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
//                     <p className="text-white text-sm sm:text-base">
//                       {shippingInfo?.firstName} {shippingInfo?.lastName}
//                     </p>
//                     <p className="text-gray-300 text-sm">{shippingInfo?.address}</p>
//                     <p className="text-gray-300 text-sm">
//                       {shippingInfo?.city}, {shippingInfo?.zipCode}
//                     </p>
//                     <p className="text-gray-300 text-sm">{shippingInfo?.phone}</p>
//                   </div>
//                 </div>

//                 {/* Método de Pago */}
//                 <div>
//                   <h3 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
//                     <CreditCard className="w-4 h-4 mr-2" />
//                     Método de Pago
//                   </h3>
//                   <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
//                     {paymentMethod === "card" ? (
//                       <p className="text-white text-sm sm:text-base">
//                         Tarjeta terminada en ****{formData.cardNumber.slice(-4)}
//                       </p>
//                     ) : paymentMethod === "paypal" ? (
//                       <p className="text-white text-sm sm:text-base">PayPal</p>
//                     ) : paymentMethod === "mercadopago" ? (
//                       <p className="text-white text-sm sm:text-base">MercadoPago</p>
//                     ) : paymentMethod === "transferencia" ? (
//                       <p className="text-white text-sm sm:text-base">Transferencia Bancaria</p>
//                     ) : null}
//                   </div>
//                 </div>

//                 {/* Instrucciones de Transferencia Bancaria en confirmación */}
//                 {paymentMethod === "transferencia" && (
//                   <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg p-4">
//                     <h4 className="text-yellow-200 font-semibold mb-2 flex items-center"><Package className="w-4 h-4 mr-2" />Datos para Transferencia Bancaria</h4>
//                     <p className="text-yellow-200 text-sm mb-2">Por favor, realiza una transferencia bancaria a la siguiente cuenta:</p>
//                     <div className="bg-yellow-800/60 rounded p-3 mb-2">
//                       <p className="text-yellow-100 text-sm font-semibold">Banco: Banco Ejemplo</p>
//                       <p className="text-yellow-100 text-sm font-semibold">IBAN: ES12 3456 7890 1234 5678 9012</p>
//                       <p className="text-yellow-100 text-sm font-semibold">Titular: Tienda Online S.L.</p>
//                       <p className="text-yellow-100 text-sm font-semibold">Concepto: Tu nombre y número de pedido</p>
//                     </div>
//                     <p className="text-yellow-200 text-xs">Una vez recibamos el pago, procesaremos y enviaremos tu pedido. Si tienes dudas, contáctanos.</p>
//                   </div>
//                 )}

//                 {error && (
//                   <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4">
//                     <p className="text-red-400 text-sm">{error}</p>
//                   </div>
//                 )}

//                 <div className="flex flex-col sm:flex-row justify-between pt-4 gap-3">
//                   <Button
//                     variant="outline"
//                     onClick={() => setStep(2)}
//                     className="border-slate-600 text-white hover:bg-slate-700 bg-transparent w-full sm:w-auto order-2 sm:order-1"
//                     disabled={loading}
//                   >
//                     <ArrowLeft className="w-4 h-4 mr-2" />
//                     Volver
//                   </Button>
//                   <Button
//                     onClick={() => handleStepComplete(3)}
//                     className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 w-full sm:w-auto order-1 sm:order-2"
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <>
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                         Procesando...
//                       </>
//                     ) : (
//                       <>
//                         <Lock className="w-4 h-4 mr-2" />
//                         Confirmar y Pagar ${total.toFixed(2)}
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         {/* Resumen del Pedido */}
//         <div className="lg:col-span-1">
//           <Card className="bg-slate-800 border-slate-700 sticky top-8">
//             <CardHeader>
//               <CardTitle className="text-lg sm:text-xl">Resumen del Pedido</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {/* Items */}
//               <div className="space-y-3">
//                 {items.map((item) => (
//                   <div key={item.id} className="flex items-center space-x-3">
//                     <img
//                       src={item.image || "/placeholder.svg"}
//                       alt={item.name}
//                       className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
//                     />
//                     <div className="flex-1 min-w-0">
//                       <p className="text-white text-xs sm:text-sm font-medium truncate">{item.name}</p>
//                       <p className="text-gray-400 text-xs">Cantidad: {item.quantity}</p>
//                     </div>
//                     <p className="text-blue-400 font-semibold text-sm">{item.price}</p>
//                   </div>
//                 ))}
//               </div>

//               <div className="border-t border-slate-600 pt-4 space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-400">Subtotal</span>
//                   <span className="text-white">${subtotal.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-400">Envío</span>
//                   <span className="text-white">{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-400">IVA (21%)</span>
//                   <span className="text-white">${tax.toFixed(2)}</span>
//                 </div>
//                 <div className="border-t border-slate-600 pt-2">
//                   <div className="flex justify-between">
//                     <span className="text-lg sm:text-xl font-bold text-white">Total</span>
//                     <span className="text-xl sm:text-2xl font-bold text-blue-400">${total.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Garantías */}
//               <div className="border-t border-slate-600 pt-4 space-y-3">
//                 <div className="flex items-center text-xs sm:text-sm text-gray-300">
//                   <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-2 flex-shrink-0" />
//                   <span>Compra 100% Segura</span>
//                 </div>
//                 <div className="flex items-center text-xs sm:text-sm text-gray-300">
//                   <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-2 flex-shrink-0" />
//                   <span>Envío en 24-48h</span>
//                 </div>
//                 <div className="flex items-center text-xs sm:text-sm text-gray-300">
//                   <Package className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 mr-2 flex-shrink-0" />
//                   <span>Devoluciones gratuitas</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }

