import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sprout, 
  MessageSquare, 
  Phone, 
  Send, 
  X, 
  CheckCircle, 
  User, 
  Package, 
  RefreshCw, 
  Navigation, 
  MapPin 
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useOutlet } from '../OutletContext';
import { 
  fetchStorefrontProducts, 
  submitProductInquiry, 
  type StorefrontProduct 
} from '../services/api';

const CATEGORIES = ['All', 'Seeds', 'Nutrition', 'Fertilizers', 'Pesticides', 'Equipment'];

// Helper to format image paths correctly for local uploads vs external web URLs
const getFullImageUrl = (url?: string): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // If it's a relative path from the local upload directory
  if (trimmed.startsWith('/uploads/')) {
    return trimmed; // Proxied via Vite to http://127.0.0.1:5000/uploads
  }
  return trimmed;
};

export default function ProductsPage() {
  const { lang, t } = useLanguage();
  const isHindi = lang === 'hi';

  const { selectedOutlet, outlets, getDistanceKmFromHub, userCoords, detectAutoLocation, isLocating } = useOutlet();

  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Inquiry modal states
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerQty, setFarmerQty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStorefrontProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Strict Outlet & Filter calculations
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Strict City / Store Match
      const matchesOutlet =
        selectedOutlet.id === 'all' ||
        selectedOutlet.cityName === 'All' ||
        item.city_name.trim().toLowerCase() === selectedOutlet.cityName.trim().toLowerCase() ||
        String(item.store_id) === String(selectedOutlet.id);

      // 2. Category Match
      const matchesCategory =
        selectedCategory === 'All' ||
        item.category_name.toLowerCase().includes(selectedCategory.toLowerCase());

      // 3. Search Query Match
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      // 4. In Stock Filter
      const matchesStock = !inStockOnly || (item.is_available === 1 && item.stock > 0);

      return matchesOutlet && matchesCategory && matchesSearch && matchesStock;
    });
  }, [products, selectedOutlet, searchQuery, selectedCategory, inStockOnly]);

  const handleOpenInquiry = (prod: StorefrontProduct) => {
    setSelectedProduct(prod);
    setInquirySent(false);
    setFarmerName('');
    setFarmerPhone('');
    setFarmerQty('');
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    try {
      await submitProductInquiry({
        customer_name: farmerName,
        customer_phone: farmerPhone,
        product_id: selectedProduct.product_id,
        store_id: selectedProduct.store_id,
        message: `Quantity: ${farmerQty || 'General Inquiry'}. Outlet: ${selectedProduct.city_name}`,
      });
      setInquirySent(true);
    } catch (err: any) {
      alert('Error: ' + (err?.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Header with City Badge & GPS Distance */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {selectedOutlet.id === 'all'
                  ? (isHindi ? 'सभी मंडी हब' : 'All Regional Hubs')
                  : `${selectedOutlet.cityName} Hub Counter`}
              </span>

              {/* Show distance if GPS auto-detected */}
              {userCoords && selectedOutlet.id !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  <Navigation className="w-3 h-3 text-amber-600 animate-pulse" />
                  {getDistanceKmFromHub(selectedOutlet.lat, selectedOutlet.lng)} km away from you
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.navCatalog || (isHindi ? 'उत्पाद कैटलॉग' : 'Product Catalog')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {selectedOutlet.id === 'all'
                ? 'Showing agricultural inventory across all regional mandis.'
                : `Showing exclusive stock & mandi rates for ${selectedOutlet.cityName} hub.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={detectAutoLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-emerald-600 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 shadow-xs cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS...' : 'Auto Nearest'}</span>
            </button>

            <button
              onClick={loadProducts}
              disabled={loading}
              title="Refresh inventory"
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-emerald-700 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            <div className="text-xs font-semibold text-slate-500 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
              Items: <span className="font-bold text-emerald-800 font-mono text-sm">{filteredProducts.length}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product title or SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded-md border-slate-300 text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span>In Stock Only</span>
          </label>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="text-center py-20 text-slate-500 text-sm">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
            Loading {selectedOutlet.cityName} catalog from database...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs">
            {error}
          </div>
        )}

        {/* Product Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const isAvailable = prod.is_available === 1 && prod.stock > 0;
              const matchedHub = outlets.find((o) => o.cityName.toLowerCase() === prod.city_name.toLowerCase());
              const distanceKm = matchedHub ? getDistanceKmFromHub(matchedHub.lat, matchedHub.lng) : null;
              const cleanImageUrl = getFullImageUrl(prod.image_url);

              return (
                <div
                  key={prod.inventory_id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-600/60 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Image Container with Fallback */}
                  <div className="relative h-48 bg-stone-100 overflow-hidden flex items-center justify-center">
                    {cleanImageUrl ? (
                      <img
                        src={cleanImageUrl}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.image-fallback-container');
                          if (fallback) {
                            (fallback as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}

                    {/* Fallback Icon if image fails or is empty */}
                    <div 
                      className={`image-fallback-container flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center ${
                        cleanImageUrl ? 'hidden' : 'flex'
                      }`}
                    >
                      <Sprout className="w-10 h-10 text-emerald-800/40" />
                      <span className="text-[11px] font-medium text-slate-500 line-clamp-1">{prod.title}</span>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      {isAvailable ? (
                        <span className="bg-emerald-900/90 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-700/60 shadow-xs">
                          In Stock ({prod.stock} avail)
                        </span>
                      ) : (
                        <span className="bg-amber-900/90 text-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-amber-700/60 shadow-xs">
                          Restocking
                        </span>
                      )}
                    </div>

                    {/* GPS Distance Badge */}
                    {distanceKm !== null && (
                      <div className="absolute bottom-2 left-2 z-10">
                        <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                          <Navigation className="w-2.5 h-2.5 text-amber-400" />
                          {distanceKm} km away
                        </span>
                      </div>
                    )}

                    {/* Category Tag */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white/95 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-slate-200">
                        {prod.category_name}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[11px] text-slate-400 font-mono tracking-wider mb-1">
                        SKU: {prod.sku}
                      </div>
                      <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-900 transition-colors">
                        {prod.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 block">Rate</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                              ₹{Number(prod.price).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-slate-500">/ unit</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Hub</span>
                          <span className="text-xs font-bold text-emerald-800 truncate block max-w-[120px]">
                            {prod.city_name}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3.5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenInquiry(prod)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                          <span>Inquire</span>
                        </button>

                        <a
                          href={`https://wa.me/${(prod.store_phone || '919826012345').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Namaste, I want to inquire about: ${prod.title} at ${prod.store_name} (${prod.city_name}).`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state if city has no matching products */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No products found for {selectedOutlet.cityName}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select another city from the top dropdown or choose "All Outlets" to see products from other hubs.
            </p>
          </div>
        )}
      </div>

      {/* Inquiry Form Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {inquirySent ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">
                  Inquiry Submitted!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Saved to database for {selectedProduct.store_name} ({selectedProduct.city_name}).
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="mt-4 px-5 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block mb-1">
                    {selectedProduct.sku} · {selectedProduct.city_name} Hub
                  </span>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {selectedProduct.title}
                  </h3>
                  <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                    Rate: ₹{Number(selectedProduct.price).toLocaleString('en-IN')} / unit
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Farmer Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rameshwar Lodhi"
                        value={farmerName}
                        onChange={(e) => setFarmerName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        placeholder="10-digit number"
                        value={farmerPhone}
                        onChange={(e) => setFarmerPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Estimated Quantity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 20 Bags / 10 Liters"
                      value={farmerQty}
                      onChange={(e) => setFarmerQty(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-950 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>{submitting ? 'Submitting...' : 'Submit Direct Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}