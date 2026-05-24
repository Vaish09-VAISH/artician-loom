import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ArtisansPage from './pages/ArtisansPage';
import ArtisanProfilePage from './pages/ArtisanProfilePage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import type { ProductWithSeller, Profile } from './types/database';

function AppContent() {
  const [page, setPage] = useState('home');
  const [pageData, setPageData] = useState<unknown>(null);

  const navigate = (newPage: string, data?: unknown) => {
    setPage(newPage);
    setPageData(data || null);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) setPage(hash);
  }, []);

  useEffect(() => {
    window.location.hash = page;
  }, [page]);

  const renderPage = () => {
    switch (page) {
      case 'shop':
        return <ShopPage onNavigate={navigate} initialCategoryId={(pageData as { categoryId?: string })?.categoryId} />;
      case 'product':
        return <ProductDetailPage product={pageData as ProductWithSeller} onNavigate={navigate} />;
      case 'artisans':
        return <ArtisansPage onNavigate={navigate} />;
      case 'artisan':
        return <ArtisanProfilePage artisan={pageData as Profile} onNavigate={navigate} />;
      case 'auth':
        return <AuthPage onNavigate={navigate} />;
      case 'cart':
        return <CartPage onNavigate={navigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case 'profile':
        return <ProfilePage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar currentPage={page} onNavigate={navigate} />
      {renderPage()}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
