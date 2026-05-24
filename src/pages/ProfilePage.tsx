import { useState } from 'react';
import { Save, MapPin, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    store_name: profile?.store_name || '',
    store_description: profile?.store_description || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user || !profile) {
    onNavigate('auth');
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update(form).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-8">My Profile</h1>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="City, State"
                className="w-full pl-9 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              placeholder="Tell buyers about yourself..."
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {profile.is_artisan && (
            <>
              <div className="border-t border-stone-200 pt-5">
                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-stone-800">Store Settings</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Store Name</label>
                    <input
                      type="text"
                      value={form.store_name}
                      onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Store Description</label>
                    <textarea
                      value={form.store_description}
                      onChange={e => setForm(f => ({ ...f, store_description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 font-semibold rounded-xl transition-all ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            } disabled:opacity-50`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
