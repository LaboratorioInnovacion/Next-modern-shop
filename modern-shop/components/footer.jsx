import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, CreditCard, Shield, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-slate-950 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent"></div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              {/* Ajustar el logo en el footer */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  ModernShop
                </span>
              </div>

              <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                ModernShop es tu destino único para todas tus necesidades de compra. Ofrecemos productos de calidad
                premium a precios competitivos con la mejor experiencia de servicio al cliente.
              </p>

              {/* Ajustar los iconos de redes sociales */}
              <div className="flex space-x-4 mb-6">
                <div className="p-2.5 bg-slate-800 hover:bg-blue-600 rounded-lg transition-colors duration-300 cursor-pointer flex items-center justify-center">
                  <Facebook className="w-4 h-4 text-gray-400 hover:text-white" />
                </div>
                <div className="p-2.5 bg-slate-800 hover:bg-blue-400 rounded-lg transition-colors duration-300 cursor-pointer flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-gray-400 hover:text-white" />
                </div>
                <div className="p-2.5 bg-slate-800 hover:bg-pink-600 rounded-lg transition-colors duration-300 cursor-pointer flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-gray-400 hover:text-white" />
                </div>
                <div className="p-2.5 bg-slate-800 hover:bg-red-600 rounded-lg transition-colors duration-300 cursor-pointer flex items-center justify-center">
                  <Youtube className="w-4 h-4 text-gray-400 hover:text-white" />
                </div>
              </div>

              {/* Ajustar los iconos de información de contacto */}
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center space-x-3.5">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>123 Commerce Street, Ciudad, País</span>
                </div>
                <div className="flex items-center space-x-3.5">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3.5">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>contacto@modernshop.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Enlaces Rápidos</h3>
              <ul className="space-y-3">
                {["Productos", "Ofertas", "Carrito", "Mi Cuenta", "Lista de Deseos"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Servicio al Cliente</h3>
              <ul className="space-y-3">
                {[
                  "Contáctanos",
                  "Información de Envío",
                  "Política de Devoluciones",
                  "Preguntas Frecuentes",
                  "Términos y Condiciones",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Boletín</h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                Suscríbete para recibir ofertas especiales y actualizaciones sobre nuevos productos
              </p>
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="bg-slate-800/50 border-slate-700/50 text-white placeholder-gray-500 focus:border-blue-500"
                />
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold">
                  Suscribirse
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-slate-800">
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              {/* Ajustar los iconos de confianza */}
              <div className="flex items-center justify-center space-x-4 text-gray-400">
                <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm">Compra 100% Segura</span>
              </div>
              <div className="flex items-center justify-center space-x-4 text-gray-400">
                <Truck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">Envío Gratis +$50</span>
              </div>
              <div className="flex items-center justify-center space-x-4 text-gray-400">
                <CreditCard className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-sm">Múltiples Métodos de Pago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">© 2024 ModernShop. Todos los derechos reservados.</p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Privacidad
                </a>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Términos
                </a>
                <a href="#" className="hover:text-white transition-colors duration-300">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
