import { TrendingUp, Package, Truck, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function Features() {
  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Calidad Premium",
      description: "Solo los mejores productos de marcas confiables y reconocidas mundialmente",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Devoluciones Gratis",
      description: "Garantía de devolución de dinero por 30 días sin preguntas",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Envío Rápido",
      description: "Entrega gratuita en pedidos superiores a $50 en 24-48 horas",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Compra Segura",
      description: "Transacciones 100% seguras con encriptación de nivel bancario",
      color: "from-orange-500 to-orange-600",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            ¿Por qué elegir ModernShop?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Ofrecemos la mejor experiencia de compra online con garantías que nos respaldan
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
            >
              <CardContent className="p-8 text-center">
                <div
                  className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
