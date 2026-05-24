import { ShoppingCart, Star, MapPin } from 'lucide-react';
import type { ProductWithSeller } from '../types/database';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: ProductWithSeller;
  onNavigate: (page: string, data?: unknown) => void;
}

export default function ProductCard({ product, onNavigate }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) addToCart(product);
  };

  const image = product.images?.[0] || 'https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg?auto=compress&cs=tinysrgb&w=600';

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => onNavigate('product', product)}
    >
      <div className="aspect-square overflow-hidden bg-stone-100">
        <img
          src={image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        {product.categories && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            {product.categories.name}
          </span>
        )}
        <h3 className="mt-2 text-sm font-semibold text-stone-800 line-clamp-2 group-hover:text-amber-700 transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 text-stone-400" />
          <span className="text-xs text-stone-500">{product.profiles?.location || 'Local Artisan'}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-stone-500">4.8 (24)</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-stone-900">
            ${Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              product.stock === 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {product.stock === 0 ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
