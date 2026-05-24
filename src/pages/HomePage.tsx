import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Shield, Truck, Award, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProductWithSeller, Category, Profile } from '../types/database';
import ProductCard from '../components/ProductCard';

interface HomePageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

const HERO_IMAGES = [
  'https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/2249528/pexels-photo-2249528.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

const ARTISAN_IMAGES = [
  'https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1367261/pexels-photo-1367261.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg?auto=compress&cs=tinysrgb&w=400',
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithSeller[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [artisans, setArtisans] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, categoriesRes, artisansRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, profiles(*), categories(*)')
          .eq('status', 'active')
          .limit(8),
        supabase.from('categories').select('*').limit(8),
        supabase.from('profiles').select('*').eq('is_artisan', true).limit(3),
      ]);

      if (productsRes.data) setFeaturedProducts(productsRes.data as ProductWithSeller[]);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (artisansRes.data) setArtisans(artisansRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGES[0]}
            alt="Artisan crafts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium tracking-wide uppercase">Handcrafted with Love</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Discover
              <span className="block text-amber-400">Local Artisans</span>
              & Their Craft
            </h1>
            <p className="mt-6 text-lg text-stone-300 max-w-lg leading-relaxed">
              Connect directly with skilled weavers, potters, and craftspeople in your community.
              Every purchase supports a local artisan and preserves traditional craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button
                onClick={() => onNavigate('shop')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-all hover:shadow-lg hover:shadow-amber-600/30 active:scale-95"
              >
                Explore Products <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('artisans')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
              >
                Meet Artisans
              </button>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-3 gap-4">
            {[
              { value: '500+', label: 'Local Artisans' },
              { value: '10K+', label: 'Handcrafted Items' },
              { value: '50+', label: 'Communities' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-stone-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-600 text-sm font-medium uppercase tracking-wide mb-2">Browse by Type</p>
              <h2 className="text-3xl font-bold text-stone-800">Shop by Category</h2>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onNavigate('shop', { categoryId: cat.id })}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 transition-all"
              >
                <div className="w-10 h-10 bg-amber-100 group-hover:bg-amber-200 rounded-xl flex items-center justify-center transition-colors">
                  <span className="text-amber-700 text-lg">
                    {cat.slug === 'weaving-textiles' ? '🧵' :
                     cat.slug === 'pottery-ceramics' ? '🏺' :
                     cat.slug === 'jewelry-accessories' ? '💎' :
                     cat.slug === 'wood-carving' ? '🪵' :
                     cat.slug === 'basket-weaving' ? '🧺' :
                     cat.slug === 'natural-dyes-fabric' ? '🎨' :
                     cat.slug === 'home-decor' ? '🏠' : '🖼️'}
                  </span>
                </div>
                <span className="text-xs font-medium text-stone-700 group-hover:text-amber-700 text-center leading-tight transition-colors">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-amber-600 text-sm font-medium uppercase tracking-wide mb-2">Handpicked</p>
              <h2 className="text-3xl font-bold text-stone-800">Featured Products</h2>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-200 animate-pulse">
                  <div className="aspect-square bg-stone-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-stone-200 rounded w-1/3" />
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-3 bg-stone-200 rounded w-1/2" />
                    <div className="h-6 bg-stone-200 rounded w-1/4 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🧶</div>
              <h3 className="text-lg font-semibold text-stone-700 mb-2">No products yet</h3>
              <p className="text-stone-500 mb-6">Be the first artisan to list your handcrafted items!</p>
              <button
                onClick={() => onNavigate('auth')}
                className="px-6 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors"
              >
                Start Selling
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <img
              src={HERO_IMAGES[1]}
              alt="Artisan weaving"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-900/90 to-amber-700/60" />
            <div className="absolute inset-0 flex items-center px-8 sm:px-16">
              <div className="max-w-lg">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Are You an Artisan?</h2>
                <p className="text-amber-100 mb-8 leading-relaxed">
                  Join hundreds of local craftspeople selling their work. Set up your store in minutes
                  and reach customers who value authentic, handmade goods.
                </p>
                <button
                  onClick={() => onNavigate('auth')}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-amber-700 font-semibold rounded-xl hover:bg-amber-50 transition-colors"
                >
                  Start Selling Today <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artisan Spotlight */}
      {artisans.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-amber-600 text-sm font-medium uppercase tracking-wide mb-2">Community</p>
              <h2 className="text-3xl font-bold text-stone-800">Meet Our Artisans</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {artisans.map((artisan, idx) => (
                <button
                  key={artisan.id}
                  onClick={() => onNavigate('artisan', artisan)}
                  className="group text-center p-6 rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all"
                >
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-amber-100 mb-4">
                    <img
                      src={artisan.avatar_url || ARTISAN_IMAGES[idx % ARTISAN_IMAGES.length]}
                      alt={artisan.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">
                    {artisan.full_name || 'Artisan'}
                  </h3>
                  {artisan.store_name && (
                    <p className="text-sm text-amber-600 mt-0.5">{artisan.store_name}</p>
                  )}
                  {artisan.location && (
                    <p className="text-xs text-stone-500 mt-1">{artisan.location}</p>
                  )}
                  {artisan.bio && (
                    <p className="text-xs text-stone-500 mt-2 line-clamp-2">{artisan.bio}</p>
                  )}
                </button>
              ))}
            </div>
            <div className="text-center mt-10">
              <button
                onClick={() => onNavigate('artisans')}
                className="px-6 py-3 border border-amber-600 text-amber-600 font-medium rounded-xl hover:bg-amber-50 transition-colors"
              >
                View All Artisans
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Trust signals */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Secure Payments', desc: 'Your transactions are protected with industry-standard encryption.' },
              { icon: Award, title: 'Authentic Crafts', desc: 'Every item is handmade by verified local artisans and weavers.' },
              { icon: Truck, title: 'Direct from Maker', desc: 'Buy directly from the artisan — no middlemen, fairer prices.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-6 bg-white rounded-2xl border border-stone-200">
                <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 mb-1">{title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <span className="text-white font-bold">ArtisanHub</span>
            </div>
            <p className="text-sm">© 2026 ArtisanHub. Supporting local craft communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
