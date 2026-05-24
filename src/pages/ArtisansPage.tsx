import { useEffect, useState } from 'react';
import { Search, MapPin, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

const ARTISAN_AVATARS = [
  'https://images.pexels.com/photos/3094218/pexels-photo-3094218.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1367261/pexels-photo-1367261.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/3807543/pexels-photo-3807543.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400',
];

interface ArtisansPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export default function ArtisansPage({ onNavigate }: ArtisansPageProps) {
  const [artisans, setArtisans] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchArtisans = async () => {
      setLoading(true);
      let query = supabase.from('profiles').select('*').eq('is_artisan', true);
      if (search) query = query.ilike('full_name', `%${search}%`);
      const { data } = await query.order('created_at', { ascending: false });
      if (data) setArtisans(data);
      setLoading(false);
    };
    const timer = setTimeout(fetchArtisans, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-xl">
            <p className="text-amber-600 text-sm font-medium uppercase tracking-wide mb-2">Our Community</p>
            <h1 className="text-4xl font-bold text-stone-800 mb-4">Meet the Artisans</h1>
            <p className="text-stone-500 mb-6">
              Discover skilled craftspeople in your area — weavers, potters, jewelers, and more.
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search artisans by name..."
                className="w-full pl-9 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-stone-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-3 bg-stone-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-stone-200 rounded w-full mb-2" />
                <div className="h-3 bg-stone-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : artisans.length === 0 ? (
          <div className="text-center py-24">
            <Store className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-700 mb-2">No artisans found</h3>
            <p className="text-stone-500">Be the first to join as an artisan!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan, idx) => (
              <button
                key={artisan.id}
                onClick={() => onNavigate('artisan', artisan)}
                className="group text-left bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Cover */}
                <div className="h-24 bg-gradient-to-r from-amber-100 to-stone-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-200/40 to-transparent" />
                </div>
                <div className="px-6 pb-6 -mt-8">
                  <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-amber-100 shadow mb-3">
                    <img
                      src={artisan.avatar_url || ARTISAN_AVATARS[idx % ARTISAN_AVATARS.length]}
                      alt={artisan.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-bold text-stone-800 group-hover:text-amber-700 transition-colors">
                    {artisan.full_name || 'Artisan'}
                  </h3>
                  {artisan.store_name && (
                    <p className="text-sm text-amber-600 font-medium mt-0.5">{artisan.store_name}</p>
                  )}
                  {artisan.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span className="text-xs text-stone-500">{artisan.location}</span>
                    </div>
                  )}
                  {artisan.bio && (
                    <p className="text-sm text-stone-500 mt-3 line-clamp-2 leading-relaxed">
                      {artisan.bio}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <span className="text-xs font-medium text-amber-600 group-hover:text-amber-700 transition-colors">
                      View Shop →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
