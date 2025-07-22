"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Gift, Bell } from "lucide-react"

export default function Newsletter() {
  const [email, setEmail] = useState("")

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600"></div>
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200')] opacity-10 bg-cover bg-center"></div>

      <div className="relative container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-white/20 backdrop-blur-sm rounded-full mb-8">
            <Mail className="w-5 h-5 text-white" />
          </div>

          <h2 className="text-5xl font-bold mb-6 text-white">Únete a Nuestro Boletín</h2>

          <p className="text-xl mb-12 text-blue-100 max-w-2xl mx-auto leading-relaxed">
            ¡Mantente actualizado con los últimos productos, ofertas exclusivas y descuentos especiales! Sé el primero
            en conocer nuestras promociones.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto mb-12">
            <div className="relative flex-1">
              <Input
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/95 backdrop-blur-sm text-gray-900 border-0 h-14 px-6 text-lg placeholder-gray-500 focus:ring-2 focus:ring-white/50"
              />
            </div>
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 h-14 text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">
              Suscribirse
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-4 text-white/90">
              <Gift className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Ofertas Exclusivas</span>
            </div>
            <div className="flex items-center justify-center space-x-4 text-white/90">
              <Bell className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Nuevos Productos</span>
            </div>
            <div className="flex items-center justify-center space-x-4 text-white/90">
              <Mail className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Sin Spam</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
