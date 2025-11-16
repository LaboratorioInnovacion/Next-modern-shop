"use client";
import { useEffect, useState } from "react";
const TABS = [
  { key: "products", label: "Productos" },
  { key: "users", label: "Usuarios" },
  { key: "orders", label: "Órdenes" },
  { key: "coupons", label: "Cupones" },
  { key: "addresses", label: "Direcciones" },
];
function TabNav({ active, setActive }) {
  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            active === tab.key
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActive(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
function UsersTable({ users, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded shadow bg-white dark:bg-gray-900 dark:text-gray-100">
        <thead>
          <tr>
            <th className="p-2">Nombre</th>
            <th className="p-2">Email</th>
            <th className="p-2">Rol</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2 flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(user.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTable({ orders, onRowClick }) {
  // OrdersTable soporta dos formas de items:
  // 1) objeto completo de orden (como el JSON de ejemplo)
  // 2) objeto resumido con campos: id, userName, total, status, address, createdAt, itemCount
  const fmtMoney = (value) => {
    if (value == null) return "-";
    try {
      return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(Number(value));
    } catch (e) {
      return `$${Number(value).toFixed(2)}`;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded shadow bg-white dark:bg-gray-900 dark:text-gray-100">
        <thead>
          <tr>
            <th className="p-2 text-left">Orden</th>
            <th className="p-2 text-left">Usuario</th>
            <th className="p-2 text-right">Total</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Dirección</th>
            <th className="p-2 text-center">Items</th>
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const id = o.id || o.orderId || "-";
            const userName = o.user?.name || o.userName || o.userId || "-";
            const total = o.total ?? o.totalAmount ?? "-";
            const status = o.status || o.paymentStatus || "-";
            const address =
              (o.shippingAddress && (o.shippingAddress.address || `${o.shippingAddress.city || ""} ${o.shippingAddress.zipCode || ""}`)) ||
              o.address ||
              "-";
            const itemsCount = o.items?.length ?? o.itemCount ?? "-";
            const createdAt = o.createdAt || o.date || o.created || null;
            // Accordion expand state (local to table)
            if (typeof OrdersTable._expandedIds === 'undefined') OrdersTable._expandedIds = [];
            const expandedIds = OrdersTable._expandedIds;
            const isExpanded = expandedIds.includes(id);
            const toggleExpand = () => {
              if (isExpanded) OrdersTable._expandedIds = expandedIds.filter(x => x !== id);
              else OrdersTable._expandedIds = [...expandedIds, id];
              // force re-render by updating a dummy state on the component via a setter attached below
              if (typeof OrdersTable._setTick === 'function') OrdersTable._setTick(t => t + 1);
            };

            const handleView = () => {
              if (typeof onRowClick === "function") return onRowClick(o);
              try {
                const url = `/administrador/ordenes/${id}`;
                window.open(url, "_blank");
              } catch (e) {
                console.warn("No se pudo abrir la orden:", e);
              }
            };

            return (
              <>
                <tr key={id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-2 font-medium">{id}</td>
                  <td className="p-2">{userName}</td>
                  <td className="p-2 text-right text-blue-500">{fmtMoney(total)}</td>
                  <td className="p-2">{status}</td>
                  <td className="p-2 truncate max-w-xs">{address}</td>
                  <td className="p-2 text-center">{itemsCount}</td>
                  <td className="p-2">{createdAt ? new Date(createdAt).toLocaleString("es-ES") : "-"}</td>
                  <td className="p-2 flex gap-2 justify-center">
                    <button onClick={toggleExpand} className="px-2 py-1 bg-slate-700 text-white rounded text-sm hover:bg-slate-600">{isExpanded ? 'Ocultar' : 'Detalle'}</button>
                    <button onClick={handleView} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Ver</button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-slate-50 dark:bg-slate-900">
                    <td colSpan={8} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-800 dark:text-gray-100">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Usuario</h4>
                          <div>{o.user?.name || userName}</div>
                          <div className="text-xs text-gray-400">{o.user?.email || '-'}</div>
                          <hr className="my-2" />
                          <h4 className="font-semibold">Dirección de Envío</h4>
                          <div>{o.shippingAddress?.firstName} {o.shippingAddress?.lastName}</div>
                          <div>{o.shippingAddress?.address}</div>
                          <div>{o.shippingAddress?.city} {o.shippingAddress?.zipCode}</div>
                          <div>{o.shippingAddress?.phone}</div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <h4 className="font-semibold">Items</h4>
                          <div className="space-y-2">
                            {o.items && o.items.length ? (
                              o.items.map(it => (
                                <div key={it.id} className="flex items-center justify-between bg-slate-800/20 p-2 rounded">
                                  <div className="flex items-center gap-3">
                                    <img src={it.product?.image || it.productImage || '/placeholder.svg'} alt={it.product?.name || it.productName} className="w-12 h-12 object-cover rounded" />
                                    <div>
                                      <div className="font-medium">{it.product?.name || it.productName}</div>
                                      <div className="text-xs text-gray-400">SKU: {it.product?.sku || it.productId}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div>{it.quantity} x {fmtMoney(it.price)}</div>
                                    <div className="font-semibold">{fmtMoney((it.price || 0) * (it.quantity || 1))}</div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-400">No hay items</div>
                            )}

                            <div className="mt-3 border-t pt-3 flex justify-end gap-6">
                              <div className="text-sm text-gray-400">Subtotal:</div>
                              <div className="font-semibold">{fmtMoney(o.subtotal)}</div>
                            </div>
                            <div className="flex justify-end gap-6">
                              <div className="text-sm text-gray-400">Envío:</div>
                              <div className="font-semibold">{fmtMoney(o.shipping)}</div>
                            </div>
                            <div className="flex justify-end gap-6">
                              <div className="text-sm text-gray-400">IVA:</div>
                              <div className="font-semibold">{fmtMoney(o.tax)}</div>
                            </div>
                            <div className="flex justify-end gap-6">
                              <div className="text-sm text-gray-400">Total:</div>
                              <div className="font-bold text-lg">{fmtMoney(o.total)}</div>
                            </div>
                          </div>
                          <div className="mt-4 text-xs text-gray-400">
                            <div>Pago: {o.paymentMethod} — Estado pago: {o.paymentStatus}</div>
                            <div>Referencia externa: {o.externalReference}</div>
                            <div>ViewToken: {o.viewToken}</div>
                            <div>Tracking: {o.trackingNumber || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CouponsTable({ coupons, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded shadow bg-white dark:bg-gray-900 dark:text-gray-100">
        <thead>
          <tr>
            <th className="p-2">Código</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Valor</th>
            <th className="p-2">Activo</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr
              key={coupon.id}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              <td className="p-2">{coupon.code}</td>
              <td className="p-2">{coupon.type}</td>
              <td className="p-2">{coupon.value}</td>
              <td className="p-2">{coupon.isActive ? "Sí" : "No"}</td>
              <td className="p-2 flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(coupon.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddressesTable({ addresses, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded shadow bg-white dark:bg-gray-900 dark:text-gray-100">
        <thead>
          <tr>
            <th className="p-2">Usuario</th>
            <th className="p-2">Dirección</th>
            <th className="p-2">Ciudad</th>
            <th className="p-2">País</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((addr) => (
            <tr
              key={addr.id}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              <td className="p-2">{addr.userId}</td>
              <td className="p-2">{addr.address}</td>
              <td className="p-2">{addr.city}</td>
              <td className="p-2">{addr.country}</td>
              <td className="p-2 flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(addr.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";

function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="p-4">
        <h3 className="font-bold">Usuarios</h3>
        <p className="text-2xl">{stats.users}</p>
      </Card>
      <Card className="p-4">
        <h3 className="font-bold">Productos</h3>
        <p className="text-2xl">{stats.products}</p>
      </Card>
      <Card className="p-4">
        <h3 className="font-bold">Órdenes</h3>
        <p className="text-2xl">{stats.orders}</p>
      </Card>
      <Card className="p-4">
        <h3 className="font-bold">Ventas</h3>
        <p className="text-2xl">${stats.sales}</p>
      </Card>
    </div>
  );
}

function ProductForm({ onSave, product, onCancel }) {
  const [form, setForm] = useState(
    product || {
      name: "",
      description: "",
      price: "",
      image: "",
      images: "",
      brand: "",
      stock: "",
      features: "",
    }
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "El nombre es obligatorio";
    if (!form.brand) errs.brand = "La marca es obligatoria";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      errs.price = "Precio inválido";
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0)
      errs.stock = "Stock inválido";
    if (!form.image) errs.image = "URL de imagen requerida";
    if (!form.description) errs.description = "Descripción requerida";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    await onSave({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      features:
        typeof form.features === "string"
          ? form.features
            ? form.features.split(",").map((f) => f.trim())
            : []
          : Array.isArray(form.features)
          ? form.features
          : [],
      images:
        typeof form.images === "string"
          ? form.images
            ? form.images
                .split(",")
                .map((url) => url.trim())
                .filter(Boolean)
            : []
          : Array.isArray(form.images)
          ? form.images
          : [],
    });
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 p-4 rounded shadow bg-white border dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre"
            required
          />
          {errors.name && (
            <div className="text-red-500 text-xs">{errors.name}</div>
          )}
        </div>
        <div>
          <Input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Marca"
            required
          />
          {errors.brand && (
            <div className="text-red-500 text-xs">{errors.brand}</div>
          )}
        </div>
        <div>
          <Input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Precio"
            type="number"
            required
          />
          {errors.price && (
            <div className="text-red-500 text-xs">{errors.price}</div>
          )}
        </div>
        <div>
          <Input
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock"
            type="number"
            required
          />
          {errors.stock && (
            <div className="text-red-500 text-xs">{errors.stock}</div>
          )}
        </div>
        <div>
          <Input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="URL Imagen principal"
            required
          />
          {errors.image && (
            <div className="text-red-500 text-xs">{errors.image}</div>
          )}
        </div>
        <Input
          name="images"
          value={form.images}
          onChange={handleChange}
          placeholder="URLs de imágenes (separadas por coma)"
        />
        <Input
          name="features"
          value={form.features}
          onChange={handleChange}
          placeholder="Características (separadas por coma)"
        />
      </div>
      <div>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción"
          className="w-full border rounded p-2"
          required
        />
        {errors.description && (
          <div className="text-red-500 text-xs">{errors.description}</div>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {product ? "Actualizar" : "Crear"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

function ProductsTable({ products, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o marca..."
          className="max-w-xs"
        />
        {search && (
          <Button size="sm" variant="outline" onClick={() => setSearch("")}>
            Limpiar
          </Button>
        )}
      </div>
      <table className="min-w-full rounded shadow bg-white border dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2">Nombre</th>
            <th className="p-2">Marca</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="text-center p-4 text-gray-400 dark:text-gray-500"
              >
                No hay productos
              </td>
            </tr>
          )}
          {filtered.map((prod) => (
            <tr
              key={prod.id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900 transition"
            >
              <td className="p-2">{prod.name}</td>
              <td className="p-2">{prod.brand}</td>
              <td className="p-2">${prod.price}</td>
              <td className="p-2">{prod.stock}</td>
              <td className="p-2 flex gap-2">
                <Button size="sm" onClick={() => onEdit(prod)}>
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(prod.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast ? useToast() : { showToast: () => {} };
  const [activeTab, setActiveTab] = useState("products");
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    sales: 0,
  });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(isAdmin, isAuthenticated, user);
    async function fetchAll() {
      try {
        const [productsRes, usersRes, ordersRes, couponsRes, addressesRes] =
          await Promise.all([
            fetch("/api/products"),
            fetch("/api/users"),
            fetch("/api/orders"),
            fetch("/api/coupons"),
            fetch("/api/addresses"),
          ]);
        const products = await productsRes.json();
        const users = await usersRes.json();
        const orders = await ordersRes.json();
        const coupons = await couponsRes.json();
        const addresses = await addressesRes.json();
        setStats({
          users: users.length || 0,
          products: products.length || 0,
          orders: orders.length || 0,
          sales: orders.reduce((acc, o) => acc + (o.total || 0), 0),
        });
        setProducts(products);
        setUsers(users);
        setOrders(orders);
        console.log(orders);

        setCoupons(coupons);
        setAddresses(addresses);
      } catch (e) {
        setError("Error cargando datos");
      }
    }
    fetchAll();
  }, []);

  // Confirmación personalizada
  const confirmDialog = async (msg) => {
    return new Promise((resolve) => {
      if (window.confirm(msg)) resolve(true);
      else resolve(false);
    });
  };

  // CRUD handlers para cada entidad
  // Productos
  const handleSaveProduct = async (data) => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/products/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      if (!res.ok) throw new Error("Error guardando producto");
      setShowForm(false);
      setEditing(null);
      const updated = await fetch("/api/products").then((r) => r.json());
      setProducts(updated);
      showToast &&
        showToast({
          type: "success",
          message: editing ? "Producto actualizado" : "Producto creado",
        });
    } catch (e) {
      setError(e.message);
      showToast && showToast({ type: "error", message: e.message });
    }
    setLoading(false);
  };
  const handleDeleteProduct = async (id) => {
    const ok = await confirmDialog("¿Eliminar producto?");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error eliminando producto");
      setProducts(products.filter((p) => p.id !== id));
      showToast &&
        showToast({ type: "success", message: "Producto eliminado" });
    } catch (e) {
      setError(e.message);
      showToast && showToast({ type: "error", message: e.message });
    }
    setLoading(false);
  };
  // Usuarios
  const handleDeleteUser = async (id) => {
    const ok = await confirmDialog("¿Eliminar usuario?");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Error eliminando usuario");
      setUsers(users.filter((u) => u.id !== id));
      showToast && showToast({ type: "success", message: "Usuario eliminado" });
    } catch (e) {
      setError(e.message);
      showToast && showToast({ type: "error", message: e.message });
    }
    setLoading(false);
  };
  // Cupones
  const handleDeleteCoupon = async (id) => {
    const ok = await confirmDialog("¿Eliminar cupón?");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Error eliminando cupón");
      setCoupons(coupons.filter((c) => c.id !== id));
      showToast && showToast({ type: "success", message: "Cupón eliminado" });
    } catch (e) {
      setError(e.message);
      showToast && showToast({ type: "error", message: e.message });
    }
    setLoading(false);
  };
  // Direcciones
  const handleDeleteAddress = async (id) => {
    const ok = await confirmDialog("¿Eliminar dirección?");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Error eliminando dirección");
      setAddresses(addresses.filter((a) => a.id !== id));
      showToast &&
        showToast({ type: "success", message: "Dirección eliminada" });
    } catch (e) {
      setError(e.message);
      showToast && showToast({ type: "error", message: e.message });
    }
    setLoading(false);
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        Acceso denegado. Solo administradores pueden ver esta página.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
      <DashboardStats stats={stats} />
      <TabNav active={activeTab} setActive={setActiveTab} />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {activeTab === "products" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Productos</h2>
            <Button
              onClick={() => {
                setShowForm(true);
                setEditing(null);
              }}
            >
              Nuevo producto
            </Button>
          </div>
          {showForm && (
            <ProductForm
              onSave={handleSaveProduct}
              product={editing}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          )}
          <ProductsTable
            products={products}
            onEdit={(prod) => {
              setEditing(prod);
              setShowForm(true);
            }}
            onDelete={handleDeleteProduct}
          />
        </>
      )}
      {activeTab === "users" && (
        <UsersTable users={users} onDelete={handleDeleteUser} />
      )}
      {activeTab === "orders" && <OrdersTable orders={orders} />}
      {activeTab === "coupons" && (
        <CouponsTable coupons={coupons} onDelete={handleDeleteCoupon} />
      )}
      {activeTab === "addresses" && (
        <AddressesTable addresses={addresses} onDelete={handleDeleteAddress} />
      )}
      {loading && <div className="mt-4 text-blue-500">Cargando...</div>}
    </div>
  );
}
