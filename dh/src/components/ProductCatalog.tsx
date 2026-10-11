import { useState, useMemo } from 'react';
import { 
  Search, 
  Sprout, 
  MessageSquare, 
  Phone, 
  Send, 
  X, 
  CheckCircle, 
  User, 
  Package 
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export interface ProductInventoryItem {
  inventory_id: number;
  id: number;
  title: string;
  sku: string;
  category_name: string;
  description: string;
  price: number;
  stock: number;
  is_available: number;
  city_name: string;
  image_url?: string;
}

const PRODUCTS_DATA: ProductInventoryItem[] = [
  {
    inventory_id: 101,
    id: 1,
    title: 'Shriram Super 303 Wheat (40 Kg)',
    sku: 'SHR-WHT-303-40K',
    category_name: 'Seeds',
    description: 'Certified research wheat seed with high tillering capacity, uniform maturity, and rust resistance.',
    price: 1460,
    stock: 80,
    is_available: 1,
    city_name: 'Kolaras Hub',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  },
  {
    inventory_id: 102,
    id: 2,
    title: 'IFFCO Nano Urea Liquid (500 ml)',
    sku: 'IFF-NNO-URE-500',
    category_name: 'Nutrition',
    description: 'Nanotechnology-based foliar fertilizer promoting greener leaves and higher nutrient use efficiency.',
    price: 225,
    stock: 320,
    is_available: 1,
    city_name: 'Shivpuri Hub',
    image_url: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80',
  },
  {
    inventory_id: 103,
    id: 3,
    title: 'Mahadhan 19:19:19 100% Water Soluble (25 Kg)',
    sku: 'MDH-NPK-1919-25K',
    category_name: 'Fertilizers',
    description: 'Balanced primary plant nutrient for foliar application and fertigation during early vegetative growth.',
    price: 2160,
    stock: 45,
    is_available: 1,
    city_name: 'Khaniyadhana Hub',
    image_url: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
  },
  {
    inventory_id: 104,
    id: 4,
    title: 'KisanKraft 16L Dual Motor Battery Sprayer',
    sku: 'KSK-SPR-16L-01',
    category_name: 'Equipment',
    description: 'Heavy-duty 12V rechargeable battery sprayer with multiple nozzles for efficient field spraying.',
    price: 3420,
    stock: 14,
    is_available: 1,
    city_name: 'Isagarh Hub',
    image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22538?auto=format&fit=crop&w=600&q=80',
  },
  {
    inventory_id: 105,
    id: 5,
    title: 'Bayer Confidor Super Insecticide (250 ml)',
    sku: 'BYR-CNF-SUP-250',
    category_name: 'Pesticides',
    description: 'Systemic insecticide for systemic control of sucking pests in field and cash crops.',
    price: 585,
    stock: 0,
    is_available: 0,
    city_name: 'Shivpuri Hub',
    image_url: '',
  },
  {
    inventory_id: 106,
    id: 6,
    title: 'Pioneer 3396 Hybrid Maize (4 Kg)',
    sku: 'PNR-MZ-3396',
    category_name: 'Seeds',
    description: 'High-yielding hybrid yellow maize seed with robust root system and stress tolerance.',
    price: 1150,
    stock: 35,
    is_available: 1,
    city_name: 'Kolaras Hub',
    image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  },
];

const CATEGORIES = ['All', 'Seeds', 'Nutrition', 'Fertilizers', 'Pesticides', 'Equipment'];

export default function ProductsPage() {
  const { lang, t } = useLanguage();
  const isHindi = lang === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Inquiry modal dialog states
  const [selectedProduct, setSelectedProduct] = useState<ProductInventoryItem | null>(null);
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerQty, setFarmerQty] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  const filteredProducts = useMemo(() => {
    return PRODUCTS_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category_name.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStock = !inStockOnly || (item.is_available === 1 && item.stock > 0);

      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [searchQuery, selectedCategory, inStockOnly]);

  const handleOpenInquiry = (prod: ProductInventoryItem) => {
    setSelectedProduct(prod);
    setInquirySent(false);
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
              {isHindi ? 'प्रमाणित कृषि उत्पाद' : 'Direct Agri Distribution'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.navCatalog || (isHindi ? 'उत्पाद कैटलॉग' : 'Product Catalog')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isHindi
                ? 'कोलारस, शिवपुरी, खनियांधाना और ईसागढ़ हब पर उपलब्ध प्रमाणित बीज, पोषण और उपकरण।'
                : 'Verified seeds, nutrition, fertilizers, and farm machinery available at regional counters.'}
            </p>
          </div>

          {/* Quick Counter */}
          <div className="text-xs font-semibold text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
            {isHindi ? 'कुल उपलब्ध उत्पाद:' : 'Items Available:'}{' '}
            <span className="font-bold text-emerald-800 font-mono text-sm">{filteredProducts.length}</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder || (isHindi ? 'बीज किस्म, खाद, या SKU खोजें...' : 'Search seed varieties, NPK, SKUs...')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          {/* Category Tabs */}
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

          {/* Stock Filter Checkbox */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded-md border-slate-300 text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span>{t.localStockOnly || (isHindi ? 'केवल उपलब्ध स्टॉक' : 'Ready In Stock Only')}</span>
          </label>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => {
            const isAvailable = prod.is_available === 1 && prod.stock > 0;
            return (
              <div
                key={prod.inventory_id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-600/60 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Product Image Box */}
                <div className="relative h-48 bg-stone-100 overflow-hidden flex items-center justify-center">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                      <Sprout className="w-8 h-8 text-emerald-800/40" />
                      <span className="text-[11px] font-medium text-slate-500">{prod.title}</span>
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  <div className="absolute top-3 left-3">
                    {isAvailable ? (
                      <span className="bg-emerald-900/90 backdrop-blur-xs text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-700/60">
                        In Stock ({prod.stock} avail)
                      </span>
                    ) : (
                      <span className="bg-amber-900/90 backdrop-blur-xs text-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-amber-700/60">
                        Restocking / On Demand
                      </span>
                    )}
                  </div>

                  {/* Category Tag */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-xs text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs border border-slate-200">
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

                  {/* Price & Location Baseline */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Mandi Price</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-500">/ unit</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Hub</span>
                        <span className="text-xs font-medium text-emerald-800 truncate block max-w-[110px]">
                          {prod.city_name}
                        </span>
                      </div>
                    </div>

                    {/* INQUIRY OVER ADD TO CART: Prominent Send Query / Inquire Now Action */}
                    <div className="mt-3.5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenInquiry(prod)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                        <span>Inquire Now</span>
                      </button>

                      <a
                        href={`https://wa.me/919826012345?text=${encodeURIComponent(
                          `Namaste Dehati Sansar, I am inquiring about: ${prod.title} (SKU: ${prod.sku}) at${prod.city_name}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Instant WhatsApp Query"
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

        {/* Empty Search Fallback */}
        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {isHindi ? 'कोई उत्पाद नहीं मिला' : 'No Products Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isHindi
                ? 'कृपया खोज शब्द बदलें या अन्य श्रेणी का चयन करें।'
                : 'Try altering your search term or reset the category filters.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setInStockOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              {isHindi ? 'सभी फ़िल्टर साफ़ करें' : 'Reset Filters'}
            </button>
          </div>
        )}
      </div>

      {/* Instant Product Inquiry Modal */}
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
                  {isHindi ? 'पूछताछ सफलतापूर्वक दर्ज की गई!' : 'Inquiry Submitted Successfully!'}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {isHindi
                    ? `${selectedProduct.city_name} के हब प्रभारी जल्द ही आपके नंबर पर संपर्क करेंगे।`
                    : `Our hub coordinator for ${selectedProduct.city_name} will contact you shortly.`}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="mt-4 px-5 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl"
                >
                  {isHindi ? 'ठीक है' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block mb-1">
                    {selectedProduct.sku} · {selectedProduct.city_name}
                  </span>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {selectedProduct.title}
                  </h3>
                  <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                    Mandi Rate: ₹{selectedProduct.price.toLocaleString('en-IN')} / unit
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {isHindi ? 'किसान / खरीदार का नाम' : 'Farmer Name'} *
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
                      {isHindi ? 'मोबाइल नंबर' : 'Phone Number'} *
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
                      {isHindi ? 'अनुमानित मात्रा (बोरी / लीटर)' : 'Estimated Quantity'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10 Bags / 5 Liters"
                      value={farmerQty}
                      onChange={(e) => setFarmerQty(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isHindi ? 'हब पूछताछ सबमिट करें' : 'Submit Direct Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}