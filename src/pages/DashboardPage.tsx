import { useEffect, useState } from 'react';
import { Plus, Package, DollarSign, ShoppingBag, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Product, Category } from '../types/database';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    images: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { onNavigate('auth'); return; }
    if (!profile?.is_artisan) { onNavigate('home'); return; }
  }, [user, profile, onNavigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
        supabase.from('categories').select('*'),
      ]);
      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const openAddForm = () => {
    setEditingProduct(null);
    setForm({ title: '', description: '', price: '', stock: '', category_id: '', images: '', status: 'active' });
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category_id: product.category_id || '',
      images: product.images?.join(', ') || '',
      status: product.status === 'inactive' ? 'inactive' : 'active',
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const imagesArr = form.images.split(',').map(s => s.trim()).filter(Boolean);
    const data = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category_id: form.category_id || null,
      images: imagesArr,
      status: form.status,
      seller_id: user.id,
    };

    if (editingProduct) {
      await supabase.from('products').update(data).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert(data);
    }

    const { data: updated } = await supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
    if (updated) setProducts(updated);
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const totalRevenue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);
  const activeProducts = products.filter(p => p.status === 'active').length;

  if (!profile?.is_artisan) return null;

  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Seller Dashboard</h1>
            <p className="text-stone-500 mt-1">Manage your products and store</p>
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Package, label: 'Total Products', value: products.length, color: 'text-amber-600 bg-amber-50' },
            { icon: ShoppingBag, label: 'Active Listings', value: activeProducts, color: 'text-green-600 bg-green-50' },
            { icon: DollarSign, label: 'Inventory Value', value: `$${totalRevenue.toFixed(0)}`, color: 'text-blue-600 bg-blue-50' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-stone-500">{label}</p>
                <p className="text-xl font-bold text-stone-800">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Product form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-stone-100 rounded-lg">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={form.category_id}
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Image URLs (comma separated)</label>
                  <input
                    type="text"
                    value={form.images}
                    onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 border border-stone-300 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-4 animate-pulse flex gap-4">
                <div className="w-16 h-16 bg-stone-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-700 mb-2">No products yet</h3>
            <p className="text-stone-500 mb-6">Add your first product to start selling!</p>
            <button
              onClick={openAddForm}
              className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Product</th>
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Price</th>
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Stock</th>
                    <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-stone-500 uppercase px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                            <img
                              src={product.images?.[0] || 'https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg?auto=compress&cs=tinysrgb&w=100'}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-stone-800 text-sm">{product.title}</p>
                            <p className="text-xs text-stone-500 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-stone-800">${Number(product.price).toFixed(2)}</td>
                      <td className="px-5 py-4 text-sm text-stone-600">{product.stock}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'active' ? 'bg-green-50 text-green-700' :
                          product.status === 'sold_out' ? 'bg-red-50 text-red-700' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditForm(product)}
                            className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
