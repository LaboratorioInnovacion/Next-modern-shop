
'use client'
import { useEffect, useState } from 'react';
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
    name: '', description: '', price: '', image: '', brand: '', stock: '', features: ''
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
      features: form.features.split(',').map(f => f.trim())
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
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, sales: 0 });
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  // Solo permitir acceso a admin
  // useEffect(() => {
  //   if (user && user.role !== 'ADMIN') {
  //     setError('Acceso solo para administradores');
  //   }
  // }, [user]);

  // Cargar métricas y productos
  useEffect(() => {
    async function fetchStats() {
      try {
        const productsRes = await fetch('/api/products');
        const products = await productsRes.json();
        setStats({
          users: 0,
          products: products.length || 0,
          orders: 0,
          sales: 0
        });
        setProducts(products);
      } catch (e) {
        setError('Error cargando datos');
      }
    }
    fetchStats();
  }, []);

  const handleSave = async (data) => {
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
      // Refrescar productos
      const updated = await fetch('/api/products').then(r => r.json());
      setProducts(updated);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
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

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Debes iniciar sesión como administrador.</div>;
  }

  // if (error) {
  //   return <div className="p-8 text-center text-red-500">{error}</div>;
  // }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
      <DashboardStats stats={stats} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Productos</h2>
        <Button onClick={() => { setShowForm(true); setEditing(null); }}>Nuevo producto</Button>
      </div>
      {showForm && (
        <ProductForm
          onSave={handleSave}
          product={editing}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      <ProductsTable
        products={products}
        onEdit={prod => { setEditing(prod); setShowForm(true); }}
        onDelete={handleDelete}
      />
      {loading && <div className="mt-4 text-blue-500">Cargando...</div>}
    </div>
  );
}
