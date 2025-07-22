import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function Categories() {
  const categories = [
    {
      name: "Electrónica",
      image: "/placeholder.svg?height=250&width=400",
      description: "Últimas tecnologías",
      itemCount: "2,500+ productos",
      gradient: "from-blue-600/80 to-purple-600/80",
    },
    {
      name: "Moda",
      image: "/placeholder.svg?height=250&width=400",
      description: "Tendencias actuales",
      itemCount: "1,800+ productos",
      gradient: "from-pink-600/80 to-rose-600/80",
    },
    {
      name: "Hogar y Decoración",
      image: "/placeholder.svg?height=250&width=400",
      description: "Para tu hogar ideal",
      itemCount: "3,200+ productos",
      gradient: "from-green-600/80 to-emerald-600/80",
    },
    {
      name: "Deportes",
      image: "/placeholder.svg?height=250&width=400",
      description: "Vida activa y saludable",
      itemCount: "1,500+ productos",
      gradient: "from-orange-600/80 to-red-600/80",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Compra por Categoría
          </h2>
          <p className="text-gray-400 text-lg">
            Encuentra exactamente lo que buscas en nuestras categorías especializadas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="bg-slate-800/50 border-slate-700/50 overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-60 group-hover:opacity-80 transition-opacity duration-300`}
                ></div>

                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm opacity-90 mb-1">{category.description}</p>
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-75 mb-3">{category.itemCount}</p>

                    <div className="flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      Explorar categoría
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
