
'use client'
import { useEffect, useState } from 'react';
const TABS = [
  { key: 'products', label: 'Productos' },
  { key: 'users', label: 'Usuarios' },
  { key: 'orders', label: 'Órdenes' },
  { key: 'coupons', label: 'Cupones' },
  { key: 'addresses', label: 'Direcciones' },
];
function TabNav({ active, setActive }) {
  return (
    <div className="flex gap-2 mb-6 border-b">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${active === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
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
      <table className="min-w-full rounded shadow">
        <thead>
          <tr>
            <th className="p-2">Nombre</th>
            <th className="p-2">Email</th>
            <th className="p-2">Rol</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2 flex gap-2">
                <Button size="sm" variant="destructive" onClick={() => onDelete(user.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTable({ orders }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded shadow">
        <thead>
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Usuario</th>
            <th className="p-2">Total</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-b">
              <td className="p-2">{order.id}</td>
              <td className="p-2">{order.user?.name || '-'}</td>
              <td className="p-2">${order.total}</td>
              <td className="p-2">{order.status}</td>
              <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CouponsTable({ coupons, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded shadow">
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
          {coupons.map(coupon => (
            <tr key={coupon.id} className="border-b">
              <td className="p-2">{coupon.code}</td>
              <td className="p-2">{coupon.type}</td>
              <td className="p-2">{coupon.value}</td>
              <td className="p-2">{coupon.isActive ? 'Sí' : 'No'}</td>
              <td className="p-2 flex gap-2">
                <Button size="sm" variant="destructive" onClick={() => onDelete(coupon.id)}>Eliminar</Button>
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
      <table className="min-w-full rounded shadow">
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
          {addresses.map(addr => (
            <tr key={addr.id} className="border-b">
              <td className="p-2">{addr.userId}</td>
              <td className="p-2">{addr.address}</td>
              <td className="p-2">{addr.city}</td>
              <td className="p-2">{addr.country}</td>
              <td className="p-2 flex gap-2">
                <Button size="sm" variant="destructive" onClick={() => onDelete(addr.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="p-4"><h3 className="font-bold">Usuarios</h3><p className="text-2xl">{stats.users}</p></Card>
      <Card className="p-4"><h3 className="font-bold">Productos</h3><p className="text-2xl">{stats.products}</p></Card>
      <Card className="p-4"><h3 className="font-bold">Órdenes</h3><p className="text-2xl">{stats.orders}</p></Card>
      <Card className="p-4"><h3 className="font-bold">Ventas</h3><p className="text-2xl">${stats.sales}</p></Card>
    </div>
  );
}

function ProductForm({ onSave, product, onCancel }) {
  const [form, setForm] = useState(product || {
    name: '', description: '', price: '', image: '', images: '', brand: '', stock: '', features: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      features: form.features ? form.features.split(',').map(f => f.trim()) : [],
      images: form.images ? form.images.split(',').map(url => url.trim()).filter(Boolean) : [],
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 rounded shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
        <Input name="brand" value={form.brand} onChange={handleChange} placeholder="Marca" required />
        <Input name="price" value={form.price} onChange={handleChange} placeholder="Precio" type="number" required />
        <Input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" required />
        <Input name="image" value={form.image} onChange={handleChange} placeholder="URL Imagen principal" required />
        <Input name="images" value={form.images} onChange={handleChange} placeholder="URLs de imágenes (separadas por coma)" />
        <Input name="features" value={form.features} onChange={handleChange} placeholder="Características (separadas por coma)" />
      </div>
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="w-full border rounded p-2" required />
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{product ? 'Actualizar' : 'Crear'}</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
      </div>
    </form>
  );
}

function ProductsTable({ products, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded shadow">
        <thead>
          <tr className="">
            <th className="p-2">Nombre</th>
            <th className="p-2">Marca</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(prod => (
            <tr key={prod.id} className="border-b">
              <td className="p-2">{prod.name}</td>
              <td className="p-2">{prod.brand}</td>
              <td className="p-2">${prod.price}</td>
              <td className="p-2">{prod.stock}</td>
              <td className="p-2 flex gap-2">
                <Button size="sm" onClick={() => onEdit(prod)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(prod.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, sales: 0 });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAll() {
      try {
        const [productsRes, usersRes, ordersRes, couponsRes, addressesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/users'),
          fetch('/api/orders'),
          fetch('/api/coupons'),
          fetch('/api/addresses'),
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
          sales: orders.reduce((acc, o) => acc + (o.total || 0), 0)
        });
        setProducts(products);
        setUsers(users);
        setOrders(orders);
        setCoupons(coupons);
        setAddresses(addresses);
      } catch (e) {
        setError('Error cargando datos');
      }
    }
    fetchAll();
  }, []);

  // CRUD handlers para cada entidad
  // Productos
  const handleSaveProduct = async (data) => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/products/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      if (!res.ok) throw new Error('Error guardando producto');
      setShowForm(false);
      setEditing(null);
      const updated = await fetch('/api/products').then(r => r.json());
      setProducts(updated);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Eliminar producto?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando producto');
      setProducts(products.filter(p => p.id !== id));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };
  // Usuarios
  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Error eliminando usuario');
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };
  // Cupones
  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('¿Eliminar cupón?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Error eliminando cupón');
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };
  // Direcciones
  const handleDeleteAddress = async (id) => {
    if (!window.confirm('¿Eliminar dirección?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Error eliminando dirección');
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Debes iniciar sesión como administrador.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
      <DashboardStats stats={stats} />
      <TabNav active={activeTab} setActive={setActiveTab} />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {activeTab === 'products' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Productos</h2>
            <Button onClick={() => { setShowForm(true); setEditing(null); }}>Nuevo producto</Button>
          </div>
          {showForm && (
            <ProductForm
              onSave={handleSaveProduct}
              product={editing}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          )}
          <ProductsTable
            products={products}
            onEdit={prod => { setEditing(prod); setShowForm(true); }}
            onDelete={handleDeleteProduct}
          />
        </>
      )}
      {activeTab === 'users' && (
        <UsersTable users={users} onDelete={handleDeleteUser} />
      )}
      {activeTab === 'orders' && (
        <OrdersTable orders={orders} />
      )}
      {activeTab === 'coupons' && (
        <CouponsTable coupons={coupons} onDelete={handleDeleteCoupon} />
      )}
      {activeTab === 'addresses' && (
        <AddressesTable addresses={addresses} onDelete={handleDeleteAddress} />
      )}
      {loading && <div className="mt-4 text-blue-500">Cargando...</div>}
    </div>
  );
}
