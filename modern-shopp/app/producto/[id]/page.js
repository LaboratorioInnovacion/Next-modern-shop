"use client"
import React, { useState } from "react"
import { useProducts } from "@/contexts/product-context"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Heart, Share2, ShoppingCart, Truck, Shield, Plus, Minus, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProductoDetalle({ params }) {
  // Estado para modo cine y zoom
  const [showCine, setShowCine] = useState(false);
  const [zoom, setZoom] = useState(1);
  const handleOpenCine = () => {
    setShowCine(true);
    setZoom(1);
  };
  const handleCloseCine = () => {
    setShowCine(false);
    setZoom(1);
  };
  const handleWheel = (e) => {
    e.preventDefault();
    let newZoom = zoom + (e.deltaY < 0 ? 0.2 : -0.2);
    newZoom = Math.max(1, Math.min(newZoom, 3));
    setZoom(newZoom);
  };
  const { getProductById } = useProducts()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Obtener producto por ID o usar datos de ejemplo
  const baseProduct = getProductById(params.id) || getProductById(Number(params.id))
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(undefined)

  // Espera a que baseProduct esté definido
  React.useEffect(() => {
    if (baseProduct) {
      setProduct(baseProduct)
      setLoading(false)
      console.log(baseProduct)
    }
  }, [baseProduct])

  // Si no hay producto, muestra loading
  if (loading || !product) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center py-20 text-white">
          <h2 className="text-2xl font-bold mb-4">Cargando producto...</h2>
          <p className="text-gray-400">Por favor espera mientras se carga la información del producto.</p>
        </div>
      </div>
    )
  }

  // Galería de imágenes reales del producto
  const productImages = [
    ...(product.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(url => !!url)
      : [product.image || "/placeholder.svg"]),
  ];

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product.stock || 10)) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true)

    // Simular un pequeño delay para mejor UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Agregar al carrito con la cantidad seleccionada
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }

    setIsAddingToCart(false)
  }

  const isOutOfStock = !product.inStock || (product.stock && product.stock === 0)
  const isLowStock = product.stock && product.stock < 5

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 md:mb-8 gap-1">
        <Link href="/" className="hover:text-white transition-colors">
          Inicio
        </Link>
        <span className="mx-1 sm:mx-2">/</span>
        <Link href="/productos" className="hover:text-white transition-colors">
          Productos
        </Link>
        <span className="mx-1 sm:mx-2">/</span>
        <Link href={`/categorias`} className="hover:text-white transition-colors">
          {product.category === "electronics" ? "Electrónica" : product.category}
        </Link>
        <span className="mx-1 sm:mx-2">/</span>
        <span className="text-gray-300 truncate">{product.name}</span>
      </div>

      {/* Botón Volver */}
      <div className="mb-4 sm:mb-6">
        <Link href="/productos">
          <Button
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-800 bg-transparent text-sm sm:text-base"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Volver a Productos
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
        {/* Galería de Imágenes */}
        <div className="space-y-3 sm:space-y-4">
          <div className="relative aspect-square bg-slate-800 rounded-lg overflow-hidden">
            <img
              src={productImages[activeImage] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-contain p-2 sm:p-4 cursor-zoom-in"
              onClick={handleOpenCine}
            />
            {product.badge && (
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                <span
                  className={`px-2 py-1 sm:px-3 sm:py-1 text-xs font-semibold rounded-full ${
                    product.badge === "Bestseller"
                      ? "bg-yellow-500 text-yellow-900"
                      : product.badge === "Nuevo"
                        ? "bg-green-500 text-green-900"
                        : "bg-red-500 text-red-900"
                  }`}
                >
                  {product.badge}
                </span>
              </div>
            )}
            {product.discount && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                <span className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded-lg">
                  -{product.discount}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {/* Modal Cine */}
          {showCine && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-all"
              onClick={handleCloseCine}
            >
              <div className="relative max-w-3xl w-full h-full flex items-center justify-center">
                <img
                  src={productImages[activeImage] || "/placeholder.svg"}
                  alt={product.name}
                  style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
                  className="max-h-[80vh] max-w-[90vw] object-contain cursor-zoom-out"
                  onWheel={handleWheel}
                  onClick={e => e.stopPropagation()}
                />
                {/* Navegación de imágenes */}
                {productImages.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2"
                      onClick={e => { e.stopPropagation(); setActiveImage((activeImage - 1 + productImages.length) % productImages.length); }}
                    >
                      &#8592;
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2"
                      onClick={e => { e.stopPropagation(); setActiveImage((activeImage + 1) % productImages.length); }}
                    >
                      &#8594;
                    </button>
                  </>
                )}
                {/* Indicador de zoom */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded text-xs">Zoom: {zoom.toFixed(1)}x</div>
                {/* Cerrar */}
                <button
                  className="absolute top-4 right-4 bg-black bg-opacity-60 text-white rounded-full p-2 text-lg"
                  onClick={handleCloseCine}
                >
                  &times;
                </button>
              </div>
            </div>
          )}
            {productImages.map((image, index) => (
              <div
                key={index}
                className={`aspect-square bg-slate-800 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                  activeImage === index ? "border-blue-500" : "border-transparent hover:border-slate-600"
                }`}
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} - Vista ${index + 1}`}
                  className="w-full h-full object-contain p-1 sm:p-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Información del Producto */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">{product.name}</h1>
          {/* <div className="text-xs text-gray-400">ID: {product.id}</div> */}
          <div className="text-xl text-gray-400">Marca: {product.brand}</div>
          {/* <div className="text-xs text-gray-400">Creado: {product.createdAt}</div> */}
          {/* <div className="text-xs text-gray-400">Actualizado: {product.updatedAt}</div> */}

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                />
              ))}
              <span className="ml-1 sm:ml-2 text-gray-300 font-medium">{product.rating}</span>
            </div>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">({product.reviews} reseñas)</span>
            <span className="text-gray-500">•</span>
            <span
              className={`flex items-center ${isOutOfStock ? "text-red-500" : isLowStock ? "text-yellow-500" : "text-green-500"}`}
            >
              <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {isOutOfStock ? "Agotado" : isLowStock ? `Solo ${product.stock} disponibles` : "En stock"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400">${product.price}</span>
            {product.originalPrice && (
              <span className="text-lg sm:text-xl lg:text-2xl text-gray-500 line-through">${product.originalPrice}</span>
            )}
            {product.discount && (
              <span className="bg-blue-500/10 text-blue-400 px-2 py-1 sm:px-3 sm:py-1 text-sm font-semibold rounded">
                Ahorras {product.discount}
              </span>
            )}
          </div>
{/* 
          <div className="border-t border-slate-700 pt-4 sm:pt-6">
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">{product.description}</p>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6"> */}
              {/* {product.features && product.features.length > 0 && ( */}
                <>
                  {/* <div className="font-semibold text-white mb-2">Características:</div>
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                    </div>
                  ))} */}
                </>
              {/* )} */}
              {/* <div className="text-xs text-gray-400">Stock: {product.stock}</div>
              <div className="text-xs text-gray-400">En stock: {product.inStock ? "Sí" : "No"}</div>
              <div className="text-xs text-gray-400">Destacado: {product.featured ? "Sí" : "No"}</div> */}
            {/* </div> */}
          {/* </div> */}

          {/* Selector de Cantidad */}
          <div className="space-y-3">
            <label className="block text-gray-300 font-medium text-sm sm:text-base">Cantidad</label>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center border border-slate-600 rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-r-none hover:bg-slate-700"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <div className="w-12 sm:w-16 h-10 sm:h-12 flex items-center justify-center bg-slate-800 text-white font-bold text-base sm:text-lg border-x border-slate-600">
                  {quantity}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-l-none hover:bg-slate-700"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= (product.stock || 10)}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              <div className="text-xs sm:text-sm text-gray-400">{product.stock && `${product.stock} disponibles`}</div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 sm:py-6 text-base sm:text-lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
            >
              {isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                  Agregando...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {isOutOfStock ? "Agotado" : `Agregar ${quantity} al Carrito`}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800 bg-transparent py-4 sm:py-6"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Favoritos
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800 bg-transparent py-4 sm:py-6 sm:w-auto"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Información Adicional */}
          <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-3">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-white text-sm sm:text-base">Envío Gratis</p>
                <p className="text-xs sm:text-sm text-gray-400">En pedidos superiores a $50</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-white text-sm sm:text-base">Garantía de 2 años</p>
                <p className="text-xs sm:text-sm text-gray-400">Devolución sin preguntas en 30 días</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Información */}
      <div className="mt-12 sm:mt-16">
        <Tabs defaultValue="descripcion" className="w-full">
          <TabsList className="bg-slate-800 border-b border-slate-700 w-full justify-start rounded-none p-0 overflow-x-auto">
            <TabsTrigger
              value="descripcion"
              className="rounded-none px-4 sm:px-6 lg:px-8 py-2 sm:py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none text-sm sm:text-base whitespace-nowrap"
            >
              Descripción
            </TabsTrigger>
            <TabsTrigger
              value="especificaciones"
              className="rounded-none px-4 sm:px-6 lg:px-8 py-2 sm:py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none text-sm sm:text-base whitespace-nowrap"
            >
              Especificaciones
            </TabsTrigger>
            <TabsTrigger
              value="resenas"
              className="rounded-none px-4 sm:px-6 lg:px-8 py-2 sm:py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none text-sm sm:text-base whitespace-nowrap"
            >
              Reseñas ({product.reviews})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="descripcion" className="pt-4 sm:pt-6">
            <div className="prose prose-invert max-w-none">
              {/* <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">{product.description}</p> */}
              <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
                Estos audífonos representan la perfecta combinación entre tecnología avanzada y comodidad excepcional.
                Diseñados para audiófilos y usuarios exigentes, ofrecen una experiencia de audio inmersiva sin
                precedentes.
              </p>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Características Principales</h3>
              <ul className="space-y-2">
                {product.features?.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="especificaciones" className="pt-4 sm:pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Especificaciones Técnicas</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {product.specifications && typeof product.specifications === 'object' ? (
                      Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between border-b border-slate-700 pb-2">
                          <span className="text-gray-400 text-sm sm:text-base">{key}</span>
                          <span className="text-white font-medium text-sm sm:text-base">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400">Sin especificaciones</div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contenido del Paquete</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm sm:text-base">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>1 x {product.name}</span>
                    </li>
                    <li className="flex items-center text-sm sm:text-base">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Marca: {product.brand}</span>
                    </li>
                    <li className="flex items-center text-sm sm:text-base">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>ID: {product.id}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resenas" className="pt-4 sm:pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <div className="bg-slate-800 rounded-lg p-4 sm:p-6">
                  <div className="text-center mb-3 sm:mb-4">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">{product.rating}</div>
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                        />
                      ))}
                    </div>
                    <div className="text-gray-400 mt-2 text-sm sm:text-base">Basado en {product.reviews} reseñas</div>
                  </div>

                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center text-sm">
                        <div className="w-8 sm:w-12 text-gray-400">{rating} ★</div>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden mx-2">
                          <div
                            className="h-full bg-yellow-400"
                            style={{
                              width: `${
                                rating === 5
                                  ? "70"
                                  : rating === 4
                                    ? "20"
                                    : rating === 3
                                      ? "5"
                                      : rating === 2
                                        ? "3"
                                        : "2"
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="w-8 sm:w-12 text-right text-gray-400 text-xs sm:text-sm">
                          {rating === 5
                            ? "70%"
                            : rating === 4
                              ? "20%"
                              : rating === 3
                                ? "5%"
                                : rating === 2
                                  ? "3%"
                                  : "2%"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="space-y-4 sm:space-y-6">
                  {[
                    {
                      name: "María González",
                      rating: 5,
                      date: "15/04/2023",
                      comment:
                        "Excelente producto, cumple con todas mis expectativas. La calidad de sonido es increíble y la cancelación de ruido funciona perfectamente. Lo recomiendo totalmente.",
                    },
                    {
                      name: "Carlos Rodríguez",
                      rating: 4,
                      date: "02/03/2023",
                      comment:
                        "Muy buen producto, aunque el empaque venía un poco dañado. La funcionalidad es perfecta y la batería dura exactamente lo que promete.",
                    },
                    {
                      name: "Laura Martínez",
                      rating: 5,
                      date: "18/02/2023",
                      comment:
                        "Increíble relación calidad-precio. Los uso todos los días para trabajar desde casa y son súper cómodos. El micrófono tiene excelente calidad para videollamadas.",
                    },
                  ].map((review, index) => (
                    <Card key={index} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-2 sm:mr-3 flex-shrink-0">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm sm:text-base">{review.name}</div>
                              <div className="text-xs sm:text-sm text-gray-400">{review.date}</div>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

/////////////////////////////////////
// "use client"

// import { useState } from "react"
// import { useProducts } from "@/contexts/product-context"
// import { useCart } from "@/contexts/cart-context"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Star, Heart, Share2, ShoppingCart, Truck, Shield, Plus, Minus, Check, ArrowLeft } from "lucide-react"
// import Link from "next/link"

// export default function ProductoDetalle({ params }) {
//   const { getProductById } = useProducts()
//   const { addToCart } = useCart()
//   const [quantity, setQuantity] = useState(1)
//   const [activeImage, setActiveImage] = useState(0)
//   const [isAddingToCart, setIsAddingToCart] = useState(false)

//   // Obtener producto por ID o usar datos de ejemplo
//   const baseProduct = getProductById(Number.parseInt(params.id))

//   const product = baseProduct || {
//     id: Number.parseInt(params.id),
//     name: "Audífonos Premium Inalámbricos",
//     price: "$199.99",
//     originalPrice: "$249.99",
//     rating: 4.8,
//     reviews: 128,
//     image: "/placeholder.svg?height=600&width=600",
//     category: "electronics",
//     badge: "Bestseller",
//     discount: "20%",
//     description:
//       "Audífonos premium con cancelación de ruido activa, sonido de alta fidelidad y batería de larga duración. Perfectos para música, llamadas y entretenimiento.",
//     inStock: true,
//     stock: 15,
//     features: [
//       "Cancelación de ruido activa avanzada",
//       "Batería de hasta 30 horas de reproducción",
//       "Conectividad Bluetooth 5.0",
//       "Micrófono integrado para llamadas",
//       "Diseño ergonómico y cómodo",
//       "Resistente al agua IPX4",
//     ],
//     specifications: {
//       Marca: "ModernShop Audio",
//       Modelo: "MSA-2024-PRO",
//       Color: "Negro Mate",
//       Conectividad: "Bluetooth 5.0, USB-C",
//       Batería: "30 horas",
//       Peso: "250g",
//       Garantía: "2 años",
//       "Cancelación de ruido": "Activa",
//     },
//   }

//   // Simulamos múltiples imágenes
//   const productImages = [
//     product.image,
//     "/placeholder.svg?height=600&width=600&text=Vista+Lateral",
//     "/placeholder.svg?height=600&width=600&text=Vista+Superior",
//     "/placeholder.svg?height=600&width=600&text=Accesorios",
//   ]

//   const handleQuantityChange = (newQuantity) => {
//     if (newQuantity >= 1 && newQuantity <= (product.stock || 10)) {
//       setQuantity(newQuantity)
//     }
//   }

//   const handleAddToCart = async () => {
//     setIsAddingToCart(true)

//     // Simular un pequeño delay para mejor UX
//     await new Promise((resolve) => setTimeout(resolve, 500))

//     // Agregar al carrito con la cantidad seleccionada
//     for (let i = 0; i < quantity; i++) {
//       addToCart(product)
//     }

//     setIsAddingToCart(false)
//   }

//   const isOutOfStock = !product.inStock || (product.stock && product.stock === 0)
//   const isLowStock = product.stock && product.stock < 5

//   return (
//     <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
//       {/* Breadcrumb */}
//       <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 md:mb-8 gap-1">
//         <Link href="/" className="hover:text-white transition-colors">
//           Inicio
//         </Link>
//         <span className="mx-1 sm:mx-2">/</span>
//         <Link href="/productos" className="hover:text-white transition-colors">
//           Productos
//         </Link>
//         <span className="mx-1 sm:mx-2">/</span>
//         <Link href={`/categorias`} className="hover:text-white transition-colors">
//           {product.category === "electronics" ? "Electrónica" : product.category}
//         </Link>
//         <span className="mx-1 sm:mx-2">/</span>
//         <span className="text-gray-300 truncate">{product.name}</span>
//       </div>

//       {/* Botón Volver */}
//       <div className="mb-4 sm:mb-6">
//         <Link href="/productos">
//           <Button
//             variant="outline"
//             className="border-slate-600 text-white hover:bg-slate-800 bg-transparent text-sm sm:text-base"
//           >
//             <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
//             Volver a Productos
//           </Button>
//         </Link>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
//         {/* Galería de Imágenes */}
//         <div className="space-y-3 sm:space-y-4">
//           <div className="relative aspect-square bg-slate-800 rounded-lg overflow-hidden">
//             <img
//               src={productImages[activeImage] || "/placeholder.svg"}
//               alt={product.name}
//               className="w-full h-full object-contain p-2 sm:p-4"
//             />
//             {product.badge && (
//               <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
//                 <span
//                   className={`px-2 py-1 sm:px-3 sm:py-1 text-xs font-semibold rounded-full ${
//                     product.badge === "Bestseller"
//                       ? "bg-yellow-500 text-yellow-900"
//                       : product.badge === "Nuevo"
//                         ? "bg-green-500 text-green-900"
//                         : "bg-red-500 text-red-900"
//                   }`}
//                 >
//                   {product.badge}
//                 </span>
//               </div>
//             )}
//             {product.discount && (
//               <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
//                 <span className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded-lg">
//                   -{product.discount}
//                 </span>
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
//             {productImages.map((image, index) => (
//               <div
//                 key={index}
//                 className={`aspect-square bg-slate-800 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
//                   activeImage === index ? "border-blue-500" : "border-transparent hover:border-slate-600"
//                 }`}
//                 onClick={() => setActiveImage(index)}
//               >
//                 <img
//                   src={image || "/placeholder.svg"}
//                   alt={`${product.name} - Vista ${index + 1}`}
//                   className="w-full h-full object-contain p-1 sm:p-2"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Información del Producto */}
//         <div className="space-y-4 sm:space-y-6">
//           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">{product.name}</h1>

//           <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base">
//             <div className="flex items-center">
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
//                 />
//               ))}
//               <span className="ml-1 sm:ml-2 text-gray-300 font-medium">{product.rating}</span>
//             </div>
//             <span className="text-gray-500">•</span>
//             <span className="text-gray-400">({product.reviews} reseñas)</span>
//             <span className="text-gray-500">•</span>
//             <span
//               className={`flex items-center ${isOutOfStock ? "text-red-500" : isLowStock ? "text-yellow-500" : "text-green-500"}`}
//             >
//               <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
//               {isOutOfStock ? "Agotado" : isLowStock ? `Solo ${product.stock} disponibles` : "En stock"}
//             </span>
//           </div>

//           <div className="flex flex-wrap items-center gap-3 sm:gap-4">
//             <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400">{product.price}</span>
//             {product.originalPrice && (
//               <span className="text-lg sm:text-xl lg:text-2xl text-gray-500 line-through">{product.originalPrice}</span>
//             )}
//             {product.discount && (
//               <span className="bg-blue-500/10 text-blue-400 px-2 py-1 sm:px-3 sm:py-1 text-sm font-semibold rounded">
//                 Ahorras {product.discount}
//               </span>
//             )}
//           </div>

//           <div className="border-t border-slate-700 pt-4 sm:pt-6">
//             <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">{product.description}</p>

//             <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
//               {product.features &&
//                 product.features.map((feature, index) => (
//                   <div key={index} className="flex items-start">
//                     <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
//                     <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
//                   </div>
//                 ))}
//             </div>
//           </div>

//           {/* Selector de Cantidad */}
//           <div className="space-y-3">
//             <label className="block text-gray-300 font-medium text-sm sm:text-base">Cantidad</label>
//             <div className="flex items-center gap-3 sm:gap-4">
//               <div className="flex items-center border border-slate-600 rounded-lg">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-10 w-10 sm:h-12 sm:w-12 rounded-r-none hover:bg-slate-700"
//                   onClick={() => handleQuantityChange(quantity - 1)}
//                   disabled={quantity <= 1}
//                 >
//                   <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
//                 </Button>
//                 <div className="w-12 sm:w-16 h-10 sm:h-12 flex items-center justify-center bg-slate-800 text-white font-bold text-base sm:text-lg border-x border-slate-600">
//                   {quantity}
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-10 w-10 sm:h-12 sm:w-12 rounded-l-none hover:bg-slate-700"
//                   onClick={() => handleQuantityChange(quantity + 1)}
//                   disabled={quantity >= (product.stock || 10)}
//                 >
//                   <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
//                 </Button>
//               </div>
//               <div className="text-xs sm:text-sm text-gray-400">{product.stock && `${product.stock} disponibles`}</div>
//             </div>
//           </div>

//           {/* Botones de Acción */}
//           <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//             <Button
//               className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 sm:py-6 text-base sm:text-lg"
//               onClick={handleAddToCart}
//               disabled={isOutOfStock || isAddingToCart}
//             >
//               {isAddingToCart ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
//                   Agregando...
//                 </>
//               ) : (
//                 <>
//                   <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//                   {isOutOfStock ? "Agotado" : `Agregar ${quantity} al Carrito`}
//                 </>
//               )}
//             </Button>
//             <Button
//               variant="outline"
//               className="border-slate-600 text-white hover:bg-slate-800 bg-transparent py-4 sm:py-6"
//             >
//               <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//               Favoritos
//             </Button>
//             <Button
//               variant="outline"
//               className="border-slate-600 text-white hover:bg-slate-800 bg-transparent py-4 sm:py-6 sm:w-auto"
//             >
//               <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
//             </Button>
//           </div>

//           {/* Información Adicional */}
//           <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4">
//             <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-3">
//               <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
//               <div>
//                 <p className="font-medium text-white text-sm sm:text-base">Envío Gratis</p>
//                 <p className="text-xs sm:text-sm text-gray-400">En pedidos superiores a $50</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3 sm:space-x-4">
//               <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
//               <div>
//                 <p className="font-medium text-white text-sm sm:text-base">Garantía de 2 años</p>
//                 <p className="text-xs sm:text-sm text-gray-400">Devolución sin preguntas en 30 días</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs de Información */}
//       <div className="mt-12 sm:mt-16">
//         <Tabs defaultValue="descripcion" className="w-full">
//           <TabsList className="bg-slate-800 border-b border-slate-700 w-full justify-start rounded-none p-0 overflow-x-auto">
//             <TabsTrigger
//               value="descripcion"
//               className="rounded-none px-4 sm:px-6 lg:px-8 py-2 sm:py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none text-sm sm:text-base whitespace-nowrap"
//             >
//               Descripción
//             </TabsTrigger>
//             <TabsTrigger
//               value="especificaciones"
//               className="rounded-none px-4 sm:px-6 lg:px-8 py-2 sm:py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none text-sm sm:text-base whitespace-nowrap"
//             >
//               Especificaciones
//             </TabsTrigger>
//             <TabsTrigger
//               value="resenas"
//               className="rounded-none px-4 sm:px-6 lg:px-8 py-2 sm:py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none text-sm sm:text-base whitespace-nowrap"
//             >
//               Reseñas ({product.reviews})
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="descripcion" className="pt-4 sm:pt-6">
//             <div className="prose prose-invert max-w-none">
//               <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">{product.description}</p>
//               <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
//                 Estos audífonos representan la perfecta combinación entre tecnología avanzada y comodidad excepcional.
//                 Diseñados para audiófilos y usuarios exigentes, ofrecen una experiencia de audio inmersiva sin
//                 precedentes.
//               </p>
//               <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Características Principales</h3>
//               <ul className="space-y-2">
//                 {product.features?.map((feature, index) => (
//                   <li key={index} className="flex items-start">
//                     <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
//                     <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </TabsContent>

//           <TabsContent value="especificaciones" className="pt-4 sm:pt-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
//               <Card className="bg-slate-800 border-slate-700">
//                 <CardContent className="p-4 sm:p-6">
//                   <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Especificaciones Técnicas</h3>
//                   <div className="space-y-2 sm:space-y-3">
//                     {product.specifications &&
//                       Object.entries(product.specifications).map(([key, value]) => (
//                         <div key={key} className="flex justify-between border-b border-slate-700 pb-2">
//                           <span className="text-gray-400 text-sm sm:text-base">{key}</span>
//                           <span className="text-white font-medium text-sm sm:text-base">{value}</span>
//                         </div>
//                       ))}
//                   </div>
//                 </CardContent>
//               </Card>
//               <Card className="bg-slate-800 border-slate-700">
//                 <CardContent className="p-4 sm:p-6">
//                   <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contenido del Paquete</h3>
//                   <ul className="space-y-2">
//                     <li className="flex items-center text-sm sm:text-base">
//                       <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
//                       <span>1 x {product.name}</span>
//                     </li>
//                     <li className="flex items-center text-sm sm:text-base">
//                       <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
//                       <span>1 x Cable de carga USB-C</span>
//                     </li>
//                     <li className="flex items-center text-sm sm:text-base">
//                       <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
//                       <span>1 x Estuche de transporte</span>
//                     </li>
//                     <li className="flex items-center text-sm sm:text-base">
//                       <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
//                       <span>1 x Manual de usuario</span>
//                     </li>
//                     <li className="flex items-center text-sm sm:text-base">
//                       <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
//                       <span>1 x Tarjeta de garantía</span>
//                     </li>
//                   </ul>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>

//           <TabsContent value="resenas" className="pt-4 sm:pt-6">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
//               <div>
//                 <div className="bg-slate-800 rounded-lg p-4 sm:p-6">
//                   <div className="text-center mb-3 sm:mb-4">
//                     <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">{product.rating}</div>
//                     <div className="flex justify-center">
//                       {[...Array(5)].map((_, i) => (
//                         <Star
//                           key={i}
//                           className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
//                         />
//                       ))}
//                     </div>
//                     <div className="text-gray-400 mt-2 text-sm sm:text-base">Basado en {product.reviews} reseñas</div>
//                   </div>

//                   <div className="space-y-2">
//                     {[5, 4, 3, 2, 1].map((rating) => (
//                       <div key={rating} className="flex items-center text-sm">
//                         <div className="w-8 sm:w-12 text-gray-400">{rating} ★</div>
//                         <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden mx-2">
//                           <div
//                             className="h-full bg-yellow-400"
//                             style={{
//                               width: `${
//                                 rating === 5
//                                   ? "70"
//                                   : rating === 4
//                                     ? "20"
//                                     : rating === 3
//                                       ? "5"
//                                       : rating === 2
//                                         ? "3"
//                                         : "2"
//                               }%`,
//                             }}
//                           ></div>
//                         </div>
//                         <div className="w-8 sm:w-12 text-right text-gray-400 text-xs sm:text-sm">
//                           {rating === 5
//                             ? "70%"
//                             : rating === 4
//                               ? "20%"
//                               : rating === 3
//                                 ? "5%"
//                                 : rating === 2
//                                   ? "3%"
//                                   : "2%"}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               <div className="lg:col-span-2">
//                 <div className="space-y-4 sm:space-y-6">
//                   {[
//                     {
//                       name: "María González",
//                       rating: 5,
//                       date: "15/04/2023",
//                       comment:
//                         "Excelente producto, cumple con todas mis expectativas. La calidad de sonido es increíble y la cancelación de ruido funciona perfectamente. Lo recomiendo totalmente.",
//                     },
//                     {
//                       name: "Carlos Rodríguez",
//                       rating: 4,
//                       date: "02/03/2023",
//                       comment:
//                         "Muy buen producto, aunque el empaque venía un poco dañado. La funcionalidad es perfecta y la batería dura exactamente lo que promete.",
//                     },
//                     {
//                       name: "Laura Martínez",
//                       rating: 5,
//                       date: "18/02/2023",
//                       comment:
//                         "Increíble relación calidad-precio. Los uso todos los días para trabajar desde casa y son súper cómodos. El micrófono tiene excelente calidad para videollamadas.",
//                     },
//                   ].map((review, index) => (
//                     <Card key={index} className="bg-slate-800 border-slate-700">
//                       <CardContent className="p-4 sm:p-6">
//                         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
//                           <div className="flex items-center">
//                             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-2 sm:mr-3 flex-shrink-0">
//                               {review.name.charAt(0)}
//                             </div>
//                             <div>
//                               <div className="font-semibold text-white text-sm sm:text-base">{review.name}</div>
//                               <div className="text-xs sm:text-sm text-gray-400">{review.date}</div>
//                             </div>
//                           </div>
//                           <div className="flex">
//                             {[...Array(5)].map((_, i) => (
//                               <Star
//                                 key={i}
//                                 className={`w-3 h-3 sm:w-4 sm:h-4 ${
//                                   i < review.rating ? "text-yellow-400 fill-current" : "text-gray-600"
//                                 }`}
//                               />
//                             ))}
//                           </div>
//                         </div>
//                         <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{review.comment}</p>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   )
// }

