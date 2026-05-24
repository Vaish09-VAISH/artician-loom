import { useState } from 'react';
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', page: 'home' },
    { label: 'Shop', page: 'shop' },
    { label: 'Artisans', page: 'artisans' },
  ];

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    onNavigate('home');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-stone-800 tracking-tight">
              Artisan<span className="text-amber-600">Hub</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? 'text-amber-600'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => handleNav('cart')}
              className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-amber-700">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-50">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="text-sm font-medium text-stone-800 truncate">{profile?.full_name}</p>
                      <p className="text-xs text-stone-500">{profile?.is_artisan ? 'Artisan' : 'Buyer'}</p>
                    </div>
                    <button
                      onClick={() => handleNav('profile')}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    {profile?.is_artisan && (
                      <button
                        onClick={() => handleNav('dashboard')}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNav('auth')}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === link.page
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          {!user && (
            <button
              onClick={() => handleNav('auth')}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-amber-600"
            >
              Sign In / Register
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
