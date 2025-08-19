"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  MapPin,
  Package,
  CreditCard,
  Settings,
  Edit,
  Plus,
  Trash2,
  Check,
  X,
  Calendar,
  Truck,
  Star,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PerfilPage() {
  const { user, isAuthenticated, updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("perfil")
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [showAddAddress, setShowAddAddress] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
  })

  const [addressData, setAddressData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "España",
    phone: "",
  })

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate || "",
      })
    }
  }, [user])

  // Estado para las órdenes reales
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState(null)

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      setLoadingOrders(true)
      setOrdersError(null)
      try {
        const res = await fetch("/api/orders?userId=" + user.id)
        if (!res.ok) throw new Error("No se pudieron cargar las órdenes")
        const data = await res.json()
        setOrders(data.orders || [])
      } catch (err) {
        setOrdersError(err.message)
      } finally {
        setLoadingOrders(false)
      }
    }
    fetchOrders()
  }, [user])

  const handleProfileUpdate = () => {
    updateProfile(profileData)
    setEditingProfile(false)
  }

  const handleAddressSubmit = () => {
    if (editingAddress) {
      updateAddress(editingAddress, addressData)
      setEditingAddress(null)
    } else {
      addAddress(addressData)
      setShowAddAddress(false)
    }

    setAddressData({
      title: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "España",
      phone: "",
    })
  }

  const handleEditAddress = (address) => {
    setAddressData(address)
    setEditingAddress(address.id)
    setShowAddAddress(true)
  }

  // Mapear estados del backend a colores
  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
      case "ENTREGADO":
        return "text-green-500"
      case "SHIPPED":
      case "EN_TRANSITO":
        return "text-blue-500"
      case "PENDING":
      case "PROCESANDO":
        return "text-yellow-500"
      case "CANCELLED":
      case "CANCELADO":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar || "/placeholder.svg"}
            alt={user.name}
            className="w-16 h-16 rounded-full border-2 border-blue-500"
          />
          <div>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            <p className="text-gray-400">Gestiona tu cuenta y preferencias</p>
          </div>
        </div>
        <Link href="/">
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 bg-transparent">
            Volver a la Tienda
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800 border-b border-slate-700 w-full justify-start rounded-none p-0 mb-8">
          <TabsTrigger
            value="perfil"
            className="rounded-none px-8 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
          >
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger
            value="pedidos"
            className="rounded-none px-8 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
          >
            <Package className="w-4 h-4 mr-2" />
            Mis Pedidos
          </TabsTrigger>
          <TabsTrigger
            value="direcciones"
            className="rounded-none px-8 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Direcciones
          </TabsTrigger>
          <TabsTrigger
            value="configuracion"
            className="rounded-none px-8 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* Tab: Perfil */}
        <TabsContent value="perfil">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Información Personal</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setEditingProfile(!editingProfile)}>
                    {editingProfile ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo</label>
                  {editingProfile ? (
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  ) : (
                    <p className="text-white">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  {editingProfile ? (
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  ) : (
                    <p className="text-white">{user.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                  {editingProfile ? (
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="+34 600 000 000"
                    />
                  ) : (
                    <p className="text-white">{user.phone || "No especificado"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Nacimiento</label>
                  {editingProfile ? (
                    <Input
                      type="date"
                      value={profileData.birthDate}
                      onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  ) : (
                    <p className="text-white">{user.birthDate || "No especificado"}</p>
                  )}
                </div>

                {editingProfile && (
                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleProfileUpdate} className="bg-blue-500 hover:bg-blue-600">
                      <Check className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={() => setEditingProfile(false)} className="border-slate-600">
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Estadísticas de Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-blue-400 mr-3" />
                    <div>
                      <p className="font-semibold text-white">Pedidos Totales</p>
                      <p className="text-gray-400 text-sm">Desde que te registraste</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">{orders.length}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="w-8 h-8 text-green-400 mr-3" />
                    <div>
                      <p className="font-semibold text-white">Total Gastado</p>
                      <p className="text-gray-400 text-sm">En todos tus pedidos</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-400">
                    €{orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-purple-400 mr-3" />
                    <div>
                      <p className="font-semibold text-white">Miembro desde</p>
                      <p className="text-gray-400 text-sm">Fecha de registro</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-purple-400">
                    {new Date(user.createdAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Pedidos */}
        <TabsContent value="pedidos">
          <div className="space-y-6">
            {loadingOrders && (
              <div className="text-center text-gray-400 py-8">Cargando pedidos...</div>
            )}
            {ordersError && (
              <div className="text-center text-red-400 py-8">{ordersError}</div>
            )}
            {!loadingOrders && !ordersError && orders.length === 0 && (
              <div className="text-center text-gray-400 py-8">No tienes pedidos aún.</div>
            )}
            {!loadingOrders && !ordersError && orders.length > 0 && orders.map((order) => (
              <Card key={order.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-white">Pedido #{order.id}</h3>
                        <p className="text-gray-400 text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("es-ES") : ""}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} bg-current bg-opacity-10`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-400">€{order.total?.toFixed(2) ?? "-"}</p>
                      <p className="text-gray-400 text-sm">{order.items?.length || 0} productos</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Productos:</h4>
                      <div className="space-y-1">
                        {order.items?.map((item, index) => (
                          <p key={index} className="text-gray-300 text-sm">
                            {item.quantity}x {item.product?.name || item.productName} - €{item.price?.toFixed(2) ?? "-"}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      {order.trackingNumber && (
                        <div>
                          <h4 className="font-medium text-white mb-2">Seguimiento:</h4>
                          <p className="text-gray-300 text-sm">{order.trackingNumber}</p>
                        </div>
                      )}
                      <h4 className="font-medium text-white mb-2">Método de Pago:</h4>
                      <p className="text-gray-300 text-sm">{order.paymentMethod}</p>
                      <h4 className="font-medium text-white mb-2 mt-2">Estado de Pago:</h4>
                      <p className="text-gray-300 text-sm">{order.paymentStatus}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Dirección de Envío:</h4>
                      <p className="text-gray-300 text-sm">
                        {order.shippingAddress || "-"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">Datos de Facturación:</h4>
                      <p className="text-gray-300 text-sm">
                        {order.billingAddress || "-"}
                      </p>
                    </div>
                  </div>

                  {order.paymentMethod === "TRANSFERENCIA_BANCARIA" && (
                    <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-yellow-400 mb-2">Instrucciones para Transferencia Bancaria</h4>
                      <p className="text-yellow-200 text-sm">
                        Por favor, realiza la transferencia a la cuenta bancaria de la tienda. Recuerda indicar el número de pedido en el concepto. Una vez recibamos el pago, procesaremos tu pedido.
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {/* Aquí puedes añadir botones de acciones como Ver Detalles, Rastrear, Valorar, etc. */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Direcciones */}
        <TabsContent value="direcciones">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mis Direcciones</h2>
              <Button onClick={() => setShowAddAddress(true)} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Dirección
              </Button>
            </div>

            {/* Lista de Direcciones */}
            <div className="grid md:grid-cols-2 gap-6">
              {user.addresses?.map((address) => (
                <Card key={address.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-white">{address.title}</h3>
                        {address.isDefault && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Predeterminada</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditAddress(address)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAddress(address.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-gray-300 text-sm space-y-1">
                      <p>
                        {address.firstName} {address.lastName}
                      </p>
                      <p>{address.address}</p>
                      <p>
                        {address.city}, {address.zipCode}
                      </p>
                      <p>{address.phone}</p>
                    </div>

                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultAddress(address.id)}
                        className="mt-4 border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                      >
                        Establecer como Predeterminada
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Formulario Agregar/Editar Dirección */}
            {showAddAddress && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>{editingAddress ? "Editar Dirección" : "Agregar Nueva Dirección"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Título de la Dirección</label>
                    <Input
                      value={addressData.title}
                      onChange={(e) => setAddressData({ ...addressData, title: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Casa, Oficina, etc."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                      <Input
                        value={addressData.firstName}
                        onChange={(e) => setAddressData({ ...addressData, firstName: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Apellidos</label>
                      <Input
                        value={addressData.lastName}
                        onChange={(e) => setAddressData({ ...addressData, lastName: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                    <Input
                      value={addressData.address}
                      onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Calle, número, piso, puerta"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad</label>
                      <Input
                        value={addressData.city}
                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Provincia</label>
                      <Input
                        value={addressData.state}
                        onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Código Postal</label>
                      <Input
                        value={addressData.zipCode}
                        onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                    <Input
                      value={addressData.phone}
                      onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleAddressSubmit} className="bg-blue-500 hover:bg-blue-600">
                      <Check className="w-4 h-4 mr-2" />
                      {editingAddress ? "Actualizar" : "Guardar"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddAddress(false)
                        setEditingAddress(null)
                        setAddressData({
                          title: "",
                          firstName: "",
                          lastName: "",
                          address: "",
                          city: "",
                          state: "",
                          zipCode: "",
                          country: "España",
                          phone: "",
                        })
                      }}
                      className="border-slate-600"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Configuración */}
        <TabsContent value="configuracion">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Ofertas y Promociones</p>
                    <p className="text-gray-400 text-sm">Recibir emails sobre ofertas especiales</p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Actualizaciones de Pedidos</p>
                    <p className="text-gray-400 text-sm">Notificaciones sobre el estado de tus pedidos</p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Nuevos Productos</p>
                    <p className="text-gray-400 text-sm">Información sobre nuevos productos</p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                >
                  Cambiar Contraseña
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                >
                  Configurar Autenticación de Dos Factores
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                >
                  Descargar Mis Datos
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent"
                >
                  Eliminar Cuenta
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}





// "use client"

// import { useState } from "react"
// import { useAuth } from "@/contexts/auth-context"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//   User,
//   MapPin,
//   Package,
//   CreditCard,
//   Settings,
//   Edit,
//   Plus,
//   Trash2,
//   Check,
//   X,
//   Calendar,
//   Truck,
//   Star,
// } from "lucide-react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { useEffect } from "react"

// export default function PerfilPage() {
//   const { user, isAuthenticated, updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
//     useAuth()
//   const router = useRouter()
//   const [activeTab, setActiveTab] = useState("perfil")
//   const [editingProfile, setEditingProfile] = useState(false)
//   const [editingAddress, setEditingAddress] = useState(null)
//   const [showAddAddress, setShowAddAddress] = useState(false)

//   const [profileData, setProfileData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     birthDate: "",
//   })

//   const [addressData, setAddressData] = useState({
//     title: "",
//     firstName: "",
//     lastName: "",
//     address: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     country: "España",
//     phone: "",
//   })

//   // Redirigir si no está autenticado
//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push("/")
//     }
//   }, [isAuthenticated, router])

//   // Cargar datos del usuario
//   useEffect(() => {
//     if (user) {
//       setProfileData({
//         name: user.name || "",
//         email: user.email || "",
//         phone: user.phone || "",
//         birthDate: user.birthDate || "",
//       })
//     }
//   }, [user])

//   // Datos de ejemplo para pedidos
//   const mockOrders = [
//     {
//       id: "ORD-001",
//       date: "2024-01-15",
//       status: "Entregado",
//       total: 299.99,
//       items: 3,
//       trackingNumber: "ES123456789",
//       products: [
//         { name: "Audífonos Premium", quantity: 1, price: 199.99 },
//         { name: "Cable USB-C", quantity: 2, price: 49.99 },
//       ],
//     },
//     {
//       id: "ORD-002",
//       date: "2024-01-10",
//       status: "En tránsito",
//       total: 149.99,
//       items: 1,
//       trackingNumber: "ES987654321",
//       products: [{ name: "Altavoz Inalámbrico", quantity: 1, price: 149.99 }],
//     },
//     {
//       id: "ORD-003",
//       date: "2024-01-05",
//       status: "Procesando",
//       total: 89.99,
//       items: 2,
//       trackingNumber: null,
//       products: [{ name: "Funda para móvil", quantity: 2, price: 44.99 }],
//     },
//   ]

//   const handleProfileUpdate = () => {
//     updateProfile(profileData)
//     setEditingProfile(false)
//   }

//   const handleAddressSubmit = () => {
//     if (editingAddress) {
//       updateAddress(editingAddress, addressData)
//       setEditingAddress(null)
//     } else {
//       addAddress(addressData)
//       setShowAddAddress(false)
//     }

//     setAddressData({
//       title: "",
//       firstName: "",
//       lastName: "",
//       address: "",
//       city: "",
//       state: "",
//       zipCode: "",
//       country: "España",
//       phone: "",
//     })
//   }

//   const handleEditAddress = (address) => {
//     setAddressData(address)
//     setEditingAddress(address.id)
//     setShowAddAddress(true)
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Entregado":
//         return "text-green-500"
//       case "En tránsito":
//         return "text-blue-500"
//       case "Procesando":
//         return "text-yellow-500"
//       case "Cancelado":
//         return "text-red-500"
//       default:
//         return "text-gray-500"
//     }
//   }

//   if (!isAuthenticated || !user) {
//     return null
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div className="flex items-center space-x-4">
//           <img
//             src={user.avatar || "/placeholder.svg"}
//             alt={user.name}
//             className="w-16 h-16 rounded-full border-2 border-blue-500"
//           />
//           <div>
//             <h1 className="text-3xl font-bold">Mi Perfil</h1>
//             <p className="text-gray-400">Gestiona tu cuenta y preferencias</p>
//           </div>
//         </div>
//         <Link href="/">
//           <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 bg-transparent">
//             Volver a la Tienda
//           </Button>
//         </Link>
//       </div>

//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         <TabsList className="bg-slate-800 border-b border-slate-700 w-full justify-start rounded-none p-0 mb-8">
//           <TabsTrigger
//             value="perfil"
//             className="rounded-none px-8 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
//           >
//             <User className="w-4 h-4 mr-2" />
//             Perfil
//           </TabsTrigger>
//           <TabsTrigger
//             value="pedidos"
//             className="rounded-none px-8 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
//           >
//             <Package className="w-4 h-4 mr-2" />
//             Mis Pedidos
//           </TabsTrigger>
//           <TabsTrigger
//             value="direcciones"
//             className="rounded-none px-8 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
//           >
//             <MapPin className="w-4 h-4 mr-2" />
//             Direcciones
//           </TabsTrigger>
//           <TabsTrigger
//             value="configuracion"
//             className="rounded-none px-8 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none"
//           >
//             <Settings className="w-4 h-4 mr-2" />
//             Configuración
//           </TabsTrigger>
//         </TabsList>

//         {/* Tab: Perfil */}
//         <TabsContent value="perfil">
//           <div className="grid md:grid-cols-2 gap-8">
//             <Card className="bg-slate-800 border-slate-700">
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <CardTitle>Información Personal</CardTitle>
//                   <Button variant="ghost" size="icon" onClick={() => setEditingProfile(!editingProfile)}>
//                     {editingProfile ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo</label>
//                   {editingProfile ? (
//                     <Input
//                       value={profileData.name}
//                       onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
//                       className="bg-slate-700 border-slate-600 text-white"
//                     />
//                   ) : (
//                     <p className="text-white">{user.name}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
//                   {editingProfile ? (
//                     <Input
//                       type="email"
//                       value={profileData.email}
//                       onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
//                       className="bg-slate-700 border-slate-600 text-white"
//                     />
//                   ) : (
//                     <p className="text-white">{user.email}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
//                   {editingProfile ? (
//                     <Input
//                       value={profileData.phone}
//                       onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
//                       className="bg-slate-700 border-slate-600 text-white"
//                       placeholder="+34 600 000 000"
//                     />
//                   ) : (
//                     <p className="text-white">{user.phone || "No especificado"}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Nacimiento</label>
//                   {editingProfile ? (
//                     <Input
//                       type="date"
//                       value={profileData.birthDate}
//                       onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
//                       className="bg-slate-700 border-slate-600 text-white"
//                     />
//                   ) : (
//                     <p className="text-white">{user.birthDate || "No especificado"}</p>
//                   )}
//                 </div>

//                 {editingProfile && (
//                   <div className="flex space-x-2 pt-4">
//                     <Button onClick={handleProfileUpdate} className="bg-blue-500 hover:bg-blue-600">
//                       <Check className="w-4 h-4 mr-2" />
//                       Guardar
//                     </Button>
//                     <Button variant="outline" onClick={() => setEditingProfile(false)} className="border-slate-600">
//                       Cancelar
//                     </Button>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             <Card className="bg-slate-800 border-slate-700">
//               <CardHeader>
//                 <CardTitle>Estadísticas de Cuenta</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
//                   <div className="flex items-center">
//                     <Package className="w-8 h-8 text-blue-400 mr-3" />
//                     <div>
//                       <p className="font-semibold text-white">Pedidos Totales</p>
//                       <p className="text-gray-400 text-sm">Desde que te registraste</p>
//                     </div>
//                   </div>
//                   <span className="text-2xl font-bold text-blue-400">{mockOrders.length}</span>
//                 </div>

//                 <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
//                   <div className="flex items-center">
//                     <CreditCard className="w-8 h-8 text-green-400 mr-3" />
//                     <div>
//                       <p className="font-semibold text-white">Total Gastado</p>
//                       <p className="text-gray-400 text-sm">En todos tus pedidos</p>
//                     </div>
//                   </div>
//                   <span className="text-2xl font-bold text-green-400">
//                     €{mockOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
//                   <div className="flex items-center">
//                     <Calendar className="w-8 h-8 text-purple-400 mr-3" />
//                     <div>
//                       <p className="font-semibold text-white">Miembro desde</p>
//                       <p className="text-gray-400 text-sm">Fecha de registro</p>
//                     </div>
//                   </div>
//                   <span className="text-lg font-bold text-purple-400">
//                     {new Date(user.createdAt).toLocaleDateString("es-ES")}
//                   </span>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* Tab: Pedidos */}
//         <TabsContent value="pedidos">
//           <div className="space-y-6">
//             {mockOrders.map((order) => (
//               <Card key={order.id} className="bg-slate-800 border-slate-700">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-4">
//                       <div>
//                         <h3 className="font-semibold text-white">Pedido #{order.id}</h3>
//                         <p className="text-gray-400 text-sm">{new Date(order.date).toLocaleDateString("es-ES")}</p>
//                       </div>
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} bg-current bg-opacity-10`}
//                       >
//                         {order.status}
//                       </span>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-2xl font-bold text-blue-400">€{order.total.toFixed(2)}</p>
//                       <p className="text-gray-400 text-sm">{order.items} productos</p>
//                     </div>
//                   </div>

//                   <div className="grid md:grid-cols-2 gap-4 mb-4">
//                     <div>
//                       <h4 className="font-medium text-white mb-2">Productos:</h4>
//                       <div className="space-y-1">
//                         {order.products.map((product, index) => (
//                           <p key={index} className="text-gray-300 text-sm">
//                             {product.quantity}x {product.name} - €{product.price}
//                           </p>
//                         ))}
//                       </div>
//                     </div>
//                     <div>
//                       {order.trackingNumber && (
//                         <div>
//                           <h4 className="font-medium text-white mb-2">Seguimiento:</h4>
//                           <p className="text-gray-300 text-sm">{order.trackingNumber}</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex space-x-2">
//                     <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 bg-transparent">
//                       Ver Detalles
//                     </Button>
//                     {order.trackingNumber && (
//                       <Button
//                         variant="outline"
//                         className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
//                       >
//                         <Truck className="w-4 h-4 mr-2" />
//                         Rastrear Pedido
//                       </Button>
//                     )}
//                     {order.status === "Entregado" && (
//                       <Button
//                         variant="outline"
//                         className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
//                       >
//                         <Star className="w-4 h-4 mr-2" />
//                         Valorar
//                       </Button>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </TabsContent>

//         {/* Tab: Direcciones */}
//         <TabsContent value="direcciones">
//           <div className="space-y-6">
//             <div className="flex justify-between items-center">
//               <h2 className="text-2xl font-bold">Mis Direcciones</h2>
//               <Button onClick={() => setShowAddAddress(true)} className="bg-blue-500 hover:bg-blue-600">
//                 <Plus className="w-4 h-4 mr-2" />
//                 Agregar Dirección
//               </Button>
//             </div>

//             {/* Lista de Direcciones */}
//             <div className="grid md:grid-cols-2 gap-6">
//               {user.addresses?.map((address) => (
//                 <Card key={address.id} className="bg-slate-800 border-slate-700">
//                   <CardContent className="p-6">
//                     <div className="flex justify-between items-start mb-4">
//                       <div>
//                         <h3 className="font-semibold text-white">{address.title}</h3>
//                         {address.isDefault && (
//                           <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Predeterminada</span>
//                         )}
//                       </div>
//                       <div className="flex space-x-2">
//                         <Button variant="ghost" size="icon" onClick={() => handleEditAddress(address)}>
//                           <Edit className="w-4 h-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => deleteAddress(address.id)}
//                           className="text-red-400 hover:text-red-300"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </div>

//                     <div className="text-gray-300 text-sm space-y-1">
//                       <p>
//                         {address.firstName} {address.lastName}
//                       </p>
//                       <p>{address.address}</p>
//                       <p>
//                         {address.city}, {address.zipCode}
//                       </p>
//                       <p>{address.phone}</p>
//                     </div>

//                     {!address.isDefault && (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setDefaultAddress(address.id)}
//                         className="mt-4 border-slate-600 text-white hover:bg-slate-700 bg-transparent"
//                       >
//                         Establecer como Predeterminada
//                       </Button>
//                     )}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             {/* Formulario Agregar/Editar Dirección */}
//             {showAddAddress && (
//               <Card className="bg-slate-800 border-slate-700">
//                 <CardHeader>
//                   <CardTitle>{editingAddress ? "Editar Dirección" : "Agregar Nueva Dirección"}</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Título de la Dirección</label>
//                     <Input
//                       value={addressData.title}
//                       onChange={(e) => setAddressData({ ...addressData, title: e.target.value })}
//                       className="bg-slate-700 border-slate-600 text-white"
//                       placeholder="Casa, Oficina, etc."
//                     />
//                   </div>

//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
//                       <Input
//                         value={addressData.firstName}
//                         onChange={(e) => setAddressData({ ...addressData, firstName: e.target.value })}
//                         className="bg-slate-700 border-slate-600 text-white"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-2">Apellidos</label>
//                       <Input
//                         value={addressData.lastName}
//                         onChange={(e) => setAddressData({ ...addressData, lastName: e.target.value })}
//                         className="bg-slate-700 border-slate-600 text-white"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
//                     <Input
//                       value={addressData.address}
//                       onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
//                       className="bg-slate-700 border-slate-600 text-white"
//                       placeholder="Calle, número, piso, puerta"
//                     />
//                   </div>

//                   <div className="grid md:grid-cols-3 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad</label>
//                       <Input
//                         value={addressData.city}
//                         onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
//                         className="bg-slate-700 border-slate-600 text-white"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-2">Provincia</label>
//                       <Input
//                         value={addressData.state}
//                         onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
//                         className="bg-slate-700 border-slate-600 text-white"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-2">Código Postal</label>
//                       <Input
//                         value={addressData.zipCode}
//                         onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
//                         className="bg-slate-700 border-slate-600 text-white"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
//                     <Input
//                       value={addressData.phone}
//                       onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
//                       className="bg-slate-700 border-slate-600 text-white"
//                       placeholder="+34 600 000 000"
//                     />
//                   </div>

//                   <div className="flex space-x-2 pt-4">
//                     <Button onClick={handleAddressSubmit} className="bg-blue-500 hover:bg-blue-600">
//                       <Check className="w-4 h-4 mr-2" />
//                       {editingAddress ? "Actualizar" : "Guardar"}
//                     </Button>
//                     <Button
//                       variant="outline"
//                       onClick={() => {
//                         setShowAddAddress(false)
//                         setEditingAddress(null)
//                         setAddressData({
//                           title: "",
//                           firstName: "",
//                           lastName: "",
//                           address: "",
//                           city: "",
//                           state: "",
//                           zipCode: "",
//                           country: "España",
//                           phone: "",
//                         })
//                       }}
//                       className="border-slate-600"
//                     >
//                       Cancelar
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </TabsContent>

//         {/* Tab: Configuración */}
//         <TabsContent value="configuracion">
//           <div className="grid md:grid-cols-2 gap-8">
//             <Card className="bg-slate-800 border-slate-700">
//               <CardHeader>
//                 <CardTitle>Preferencias de Notificaciones</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="font-medium text-white">Ofertas y Promociones</p>
//                     <p className="text-gray-400 text-sm">Recibir emails sobre ofertas especiales</p>
//                   </div>
//                   <input type="checkbox" className="toggle" defaultChecked />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="font-medium text-white">Actualizaciones de Pedidos</p>
//                     <p className="text-gray-400 text-sm">Notificaciones sobre el estado de tus pedidos</p>
//                   </div>
//                   <input type="checkbox" className="toggle" defaultChecked />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="font-medium text-white">Nuevos Productos</p>
//                     <p className="text-gray-400 text-sm">Información sobre nuevos productos</p>
//                   </div>
//                   <input type="checkbox" className="toggle" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-slate-800 border-slate-700">
//               <CardHeader>
//                 <CardTitle>Seguridad</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <Button
//                   variant="outline"
//                   className="w-full border-slate-600 text-white hover:bg-slate-700 bg-transparent"
//                 >
//                   Cambiar Contraseña
//                 </Button>

//                 <Button
//                   variant="outline"
//                   className="w-full border-slate-600 text-white hover:bg-slate-700 bg-transparent"
//                 >
//                   Configurar Autenticación de Dos Factores
//                 </Button>

//                 <Button
//                   variant="outline"
//                   className="w-full border-slate-600 text-white hover:bg-slate-700 bg-transparent"
//                 >
//                   Descargar Mis Datos
//                 </Button>

//                 <Button
//                   variant="outline"
//                   className="w-full border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent"
//                 >
//                   Eliminar Cuenta
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }
