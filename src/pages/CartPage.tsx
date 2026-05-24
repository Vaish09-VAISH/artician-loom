import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CartPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-700 mb-2">Your cart is empty</h2>
          <p className="text-stone-500 mb-6">Discover handcrafted items from local artisans.</p>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>

        <h1 className="text-3xl font-bold text-stone-800 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div
                key={item.product.id}
                className="flex gap-4 bg-white rounded-2xl border border-stone-200 p-4"
              >
                <div
                  className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 cursor-pointer"
                  onClick={() => onNavigate('product', item.product)}
                >
                  <img
                    src={item.product.images?.[0] || 'https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-stone-800 truncate cursor-pointer hover:text-amber-700 transition-colors"
                    onClick={() => onNavigate('product', item.product)}
                  >
                    {item.product.title}
                  </h3>
                  <p className="text-sm text-stone-500 mt-0.5">
                    by {item.product.profiles?.full_name || 'Artisan'}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium text-stone-800 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-stone-800">
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24">
              <h3 className="font-bold text-stone-800 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-stone-200 pt-3 flex justify-between font-bold text-stone-800 text-base">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!user) { onNavigate('auth'); return; }
                  clearCart();
                  alert('Order placed successfully! Thank you for supporting local artisans.');
                  onNavigate('home');
                }}
                className="w-full mt-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors active:scale-95"
              >
                {user ? 'Place Order' : 'Sign In to Checkout'}
              </button>
              <button
                onClick={clearCart}
                className="w-full mt-2 py-2 text-sm text-stone-500 hover:text-red-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
