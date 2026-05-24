import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingCart, Star, MapPin, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProductWithSeller, Review, Profile } from '../types/database';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductDetailPageProps {
  product: ProductWithSeller;
  onNavigate: (page: string, data?: unknown) => void;
}

const FALLBACK_IMAGES = [
  'https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2249528/pexels-photo-2249528.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export default function ProductDetailPage({ product: initialProduct, onNavigate }: ProductDetailPageProps) {
  const [product] = useState<ProductWithSeller>(initialProduct);
  const [reviews, setReviews] = useState<(Review & { profiles: Profile })[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();

  const images = product.images?.length > 0 ? product.images : FALLBACK_IMAGES;

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*, profiles(*)')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      if (data) setReviews(data as (Review & { profiles: Profile })[]);
    };
    fetchReviews();
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { onNavigate('auth'); return; }
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      reviewer_id: user.id,
      rating: newReview.rating,
      comment: newReview.comment,
    });
    if (!error) {
      setNewReview({ rating: 5, comment: '' });
      const { data } = await supabase
        .from('reviews')
        .select('*, profiles(*)')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      if (data) setReviews(data as (Review & { profiles: Profile })[]);
    }
    setSubmittingReview(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100">
              <img
                src={images[imageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIndex(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setImageIndex(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === imageIndex ? 'border-amber-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.categories && (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                {product.categories.name}
              </span>
            )}
            <h1 className="text-3xl font-bold text-stone-800 mt-3 mb-2">{product.title}</h1>

            <div className="flex items-center gap-3 mb-4">
              {avgRating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-stone-700">{avgRating}</span>
                  <span className="text-sm text-stone-500">({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            <div className="text-4xl font-bold text-stone-900 mb-6">
              ${Number(product.price).toFixed(2)}
            </div>

            <p className="text-stone-600 leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-center gap-4 text-sm text-stone-500 mb-8">
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
              </div>
              {product.profiles?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{product.profiles.location}</span>
                </div>
              )}
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 transition-colors font-medium"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium text-stone-800 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 transition-colors font-medium"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                    addedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
            )}

            {/* Artisan info */}
            <div
              className="flex items-center gap-4 p-4 bg-stone-100 rounded-2xl cursor-pointer hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200"
              onClick={() => onNavigate('artisan', product.profiles)}
            >
              <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-amber-800">
                  {product.profiles?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <p className="text-xs text-stone-500">Crafted by</p>
                <p className="font-semibold text-stone-800">{product.profiles?.full_name || 'Artisan'}</p>
                {product.profiles?.store_name && (
                  <p className="text-sm text-amber-600">{product.profiles.store_name}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-stone-800 mb-8">Reviews</h2>

          {user && (
            <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
              <h3 className="font-semibold text-stone-800 mb-4">Write a Review</h3>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewReview(prev => ({ ...prev, rating: r }))}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        r <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={newReview.comment}
                onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this product..."
                rows={3}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="mt-3 px-6 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
              <Star className="w-8 h-8 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl border border-stone-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-amber-700">
                          {review.profiles?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800">
                          {review.profiles?.full_name || 'Buyer'}
                        </p>
                        <p className="text-xs text-stone-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(r => (
                        <Star
                          key={r}
                          className={`w-3.5 h-3.5 ${r <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-stone-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
