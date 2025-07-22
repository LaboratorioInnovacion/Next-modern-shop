"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Respuestas automáticas del bot
  const botResponses = {
    hola: "¡Hola! ¿Cómo puedo ayudarte hoy?",
    ayuda: "Estoy aquí para ayudarte. Puedes preguntarme sobre productos, pedidos, envíos o cualquier otra consulta.",
    productos:
      "Tenemos una amplia gama de productos en electrónica, moda, hogar y deportes. ¿Hay algo específico que buscas?",
    envio: "Ofrecemos envío gratuito en pedidos superiores a $50. Los pedidos se procesan en 1-2 días hábiles.",
    devolucion:
      "Aceptamos devoluciones dentro de 30 días de la compra. El producto debe estar en condiciones originales.",
    pago: "Aceptamos tarjetas de crédito, débito y PayPal. Todos los pagos son procesados de forma segura.",
    cuenta:
      "Puedes crear una cuenta para guardar tus productos favoritos, ver el historial de pedidos y acelerar el checkout.",
    default:
      "Gracias por tu consulta. Un representante de servicio al cliente se pondrá en contacto contigo pronto. ¿Hay algo más en lo que pueda ayudarte?",
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simular respuesta del bot
    setTimeout(
      () => {
        const lowerInput = inputMessage.toLowerCase()
        let response = botResponses.default

        // Buscar respuesta apropiada
        for (const [key, value] of Object.entries(botResponses)) {
          if (lowerInput.includes(key)) {
            response = value
            break
          }
        }

        const botMessage = {
          id: Date.now() + 1,
          text: response,
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)
      },
      1000 + Math.random() * 2000,
    )
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <Card
        className={`bg-slate-800 border-slate-700 shadow-2xl transition-all duration-300 ${
          isMinimized ? "w-72 sm:w-80 h-14 sm:h-16" : "w-72 sm:w-80 h-80 sm:h-96"
        }`}
      >
        <CardHeader className="p-3 sm:p-4 border-b border-slate-700 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base">Soporte ModernShop</h3>
              <p className="text-xs text-green-400">En línea</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 hover:text-white"
            >
              <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 hover:text-white"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-64 sm:h-80">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-xs px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg ${
                      message.sender === "user" ? "bg-blue-500 text-white" : "bg-slate-700 text-gray-100"
                    }`}
                  >
                    <div className="flex items-start space-x-1.5 sm:space-x-2">
                      {message.sender === "bot" && (
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                      )}
                      {message.sender === "user" && (
                        <User className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-white flex-shrink-0" />
                      )}
                      <p className="text-xs sm:text-sm">{message.text}</p>
                    </div>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-gray-100 max-w-[85%] sm:max-w-xs px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-slate-700">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 text-sm sm:text-base"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 px-2.5 sm:px-3 flex-shrink-0"
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
