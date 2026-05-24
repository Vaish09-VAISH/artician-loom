import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Store, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile, ProductWithSeller } from '../types/database';
import ProductCard from '../components/ProductCard';

interface ArtisanProfilePageProps {
  artisan: Profile;
  onNavigate: (page: string, data?: unknown) => void;
}

const AVATAR_FALLBACK = 'https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=400';

export default function ArtisanProfilePage({ artisan, onNavigate }: ArtisanProfilePageProps) {
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, profiles(*), categories(*)')
        .eq('seller_id', artisan.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (data) setProducts(data as ProductWithSeller[]);
      setLoading(false);
    };
    fetchProducts();
  }, [artisan.id]);

  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('artisans')}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Artisans
        </button>

        {/* Profile header */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden mb-10">
          <div className="h-40 bg-gradient-to-r from-amber-100 via-stone-100 to-amber-50 relative">
            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg?auto=compress&cs=tinysrgb&w=1200)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-900/40 to-transparent" />
          </div>
          <div className="px-8 pb-8 -mt-12 flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden bg-amber-100 shadow-lg shrink-0">
              <img
                src={artisan.avatar_url || AVATAR_FALLBACK}
                alt={artisan.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 pt-4 sm:pt-14">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-stone-800">{artisan.full_name || 'Artisan'}</h1>
                  {artisan.store_name && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Store className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-600 font-medium">{artisan.store_name}</span>
                    </div>
                  )}
                  {artisan.location && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      <span className="text-sm text-stone-500">{artisan.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
                  <Package className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">{products.length} Products</span>
                </div>
              </div>
              {artisan.bio && (
                <p className="mt-4 text-stone-600 leading-relaxed max-w-2xl">{artisan.bio}</p>
              )}
              {artisan.store_description && (
                <p className="mt-2 text-stone-500 text-sm leading-relaxed max-w-2xl">{artisan.store_description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="text-xl font-bold text-stone-800 mb-6">
          {artisan.store_name ? `${artisan.store_name}'s Products` : 'Products'}
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-200 animate-pulse">
                <div className="aspect-square bg-stone-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-stone-200 rounded w-1/3" />
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">This artisan hasn't listed any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
