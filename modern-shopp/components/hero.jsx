"use client"

import { ArrowRight, Play, Sparkles, TrendingUp, Users, Award } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState([])

  const slides = [
    {
      title: "Descubre Tu Estilo",
      subtitle: "Perfecto",
      description:
        "Explora nuestra colección seleccionada de productos premium con ofertas exclusivas. Calidad garantizada y envío gratuito en pedidos superiores a $50.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=700&fit=crop",
      gradient: "from-blue-600/80 via-purple-600/60 to-pink-600/40",
    },
    {
      title: "Tecnología",
      subtitle: "Innovadora",
      description:
        "Los últimos gadgets y dispositivos tecnológicos que transformarán tu día a día. Innovación al alcance de tus manos.",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&h=700&fit=crop",
      gradient: "from-cyan-600/80 via-blue-600/60 to-indigo-600/40",
    },
    {
      title: "Calidad",
      subtitle: "Premium",
      description:
        "Productos cuidadosamente seleccionados de las mejores marcas mundiales. Experimenta la diferencia de la calidad superior.",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1400&h=700&fit=crop",
      gradient: "from-emerald-600/80 via-teal-600/60 to-cyan-600/40",
    },
  ]

  useEffect(() => {
    setIsVisible(true)
    // Generar partículas solo en el cliente
    const generatedParticles = Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }))
    setParticles(generatedParticles)

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const currentSlideData = slides[currentSlide]

  return (
    <section className="relative min-h-[70vh] sm:min-h-[80vh] md:min-h-[90vh] lg:h-screen bg-cover bg-center overflow-hidden">
      {/* Background Images with Transition */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transform scale-105 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url('${slide.image}')`,
          }}
        />
      ))}

      {/* Gradient Overlays */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.gradient} transition-all duration-1000`}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/60"></div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-0 h-full flex items-center">
        <div className="max-w-4xl space-y-4 sm:space-y-6 md:space-y-8">
          {/* Badge with Animation */}
          <div
            className={`inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-500/30 transform transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-300 mr-1.5 sm:mr-2 animate-pulse" />
            <span className="text-blue-300 text-xs sm:text-sm font-medium">✨ Nuevas ofertas disponibles</span>
          </div>

          {/* Main Title with Stagger Animation */}
          <div className="space-y-1 sm:space-y-2 md:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold leading-tight">
              <span
                className={`block bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent transform transition-all duration-1000 delay-200 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                {currentSlideData.title}
              </span>
              <span
                className={`block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transform transition-all duration-1000 delay-400 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                {currentSlideData.subtitle}
              </span>
            </h1>
          </div>

          {/* Description */}
          <p
            className={`text-sm sm:text-base md:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-3xl transform transition-all duration-1000 delay-600 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            {currentSlideData.description}
          </p>

          {/* Action Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 transform transition-all duration-1000 delay-800 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <Link href="/productos">
            <Button className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 md:px-10 md:py-6 text-sm sm:text-base md:text-xl font-semibold shadow-2xl shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 rounded-full relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center">
                Comprar Ahora
                <ArrowRight className="ml-1.5 sm:ml-2 md:ml-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            </Link>
              <Link href="/productos">
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-4 py-2.5 sm:px-6 sm:py-3 md:px-10 md:py-6 text-sm sm:text-base md:text-xl backdrop-blur-sm transition-all duration-300 bg-transparent rounded-full hover:border-white/50 hover:shadow-lg hover:shadow-white/10 group"
            >
              <Play className="mr-1.5 sm:mr-2 md:mr-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110" />
              Ver Catálogo
            </Button>
          </Link>
          </div>

          {/* Stats with Animation - Hidden on small screens */}
          <div
            className={`hidden md:flex items-center space-x-12 pt-8 transform transition-all duration-1000 delay-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="text-center group cursor-pointer">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-blue-400 mr-2 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">10K+</div>
              </div>
              <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Productos</div>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-green-400 mr-2 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white group-hover:text-green-300 transition-colors">50K+</div>
              </div>
              <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Clientes</div>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-yellow-400 mr-2 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white group-hover:text-yellow-300 transition-colors">4.9★</div>
              </div>
              <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Valoración</div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white shadow-lg shadow-white/50" : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator - Hidden on small screens */}
      <div className="absolute bottom-8 right-8 animate-bounce hidden md:block">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
