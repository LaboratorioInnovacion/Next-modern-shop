"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Package, Truck, Mail, ArrowRight, Download } from "lucide-react"
import Link from "next/link"

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const transactionId = searchParams.get("id")
  const [orderDetails] = useState({
    id: transactionId || "TXN_" + Date.now(),
    date: new Date().toLocaleDateString("es-ES"),
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES"),
    trackingNumber: "ES" + Math.random().toString(36).substr(2, 9).toUpperCase(),
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header de Confirmación */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">¡Pedido Confirmado!</h1>
          <p className="text-gray-400 text-lg">
            Gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando.
          </p>
        </div>

        {/* Detalles del Pedido */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Detalles del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Número de Pedido</p>
                <p className="text-white font-semibold">{orderDetails.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Fecha del Pedido</p>
                <p className="text-white font-semibold">{orderDetails.date}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Entrega Estimada</p>
                <p className="text-white font-semibold">{orderDetails.estimatedDelivery}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Número de Seguimiento</p>
                <p className="text-white font-semibold">{orderDetails.trackingNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximos Pasos */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle>¿Qué sigue ahora?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Confirmación por Email</h3>
                <p className="text-gray-400 text-sm">
                  Te hemos enviado un email de confirmación con todos los detalles de tu pedido.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full flex-shrink-0">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Preparación del Pedido</h3>
                <p className="text-gray-400 text-sm">
                  Nuestro equipo está preparando tu pedido para el envío. Esto puede tomar 1-2 días hábiles.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full flex-shrink-0">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Envío y Entrega</h3>
                <p className="text-gray-400 text-sm">
                  Una vez enviado, recibirás un email con el número de seguimiento para rastrear tu paquete.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Descargar Factura
          </Button>

          <Link href="/productos">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              Seguir Comprando
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Información Adicional */}
        <div className="mt-12 text-center">
          <h2 className="text-xl font-semibold mb-4 text-white">¿Necesitas Ayuda?</h2>
          <p className="text-gray-400 mb-4">Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 bg-transparent">
              Centro de Ayuda
            </Button>
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 bg-transparent">
              Contactar Soporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
