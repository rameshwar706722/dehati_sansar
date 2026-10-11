import { useState } from 'react';
import { Send, MapPin, CheckCircle, Phone, User, Package, MessageSquare } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const HUBS = [
  { id: 'kolaras', name: 'Kolaras Hub' },
  { id: 'shivpuri', name: 'Shivpuri Main Hub' },
  { id: 'khaniyadhana', name: 'Khaniyadhana Hub' },
  { id: 'isagarh', name: 'Isagarh Hub' },
];

export default function InquiryForm() {
  const { lang, t } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    hubLocation: 'kolaras',
    requirement: '',
    estimatedQuantity: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-10">
        
        {/* Form Title Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            {t.formBadge || 'Direct Outlet Dispatch'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            {t.formTitle || 'Submit Input & Booking Inquiry'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            {t.formDesc || 'Select your nearest regional hub counter for immediate stock confirmation and transparent Mandi pricing.'}
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-10 bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
            <CheckCircle className="w-12 h-12 text-[#004d34] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-900">
              {t.formSuccessTitle || 'Inquiry Received Successfully!'}
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
              {lang === 'hi' 
                ? `हमारे ${formData.hubLocation.toUpperCase()} हब प्रभारी जल्द ही +91 ${formData.phone} पर संपर्क करेंगे।`
                : `Our hub coordinator from ${formData.hubLocation.toUpperCase()} will call you shortly on +91 ${formData.phone}.`}
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-6 text-xs font-bold text-[#004d34] underline cursor-pointer"
            >
              {t.formAnother || 'Submit another inquiry'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Farmer Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  {t.labelName || 'Farmer / Buyer Name'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  {t.labelPhone || 'WhatsApp / Mobile Number'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Hub Dropdown Selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                {t.labelHub || 'Select Nearest Hub Location'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
                <select
                  value={formData.hubLocation}
                  onChange={(e) => setFormData({ ...formData, hubLocation: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-semibold text-neutral-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition appearance-none cursor-pointer"
                >
                  {HUBS.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none">
                  ▼
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Product Requirement */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  {t.labelProduct || 'Product / Variety / SKU'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shriram 303, DAP, Nano Urea"
                    value={formData.requirement}
                    onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  {t.labelQuantity || 'Estimated Quantity'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 Bags / 10 Liters / 2 Pieces"
                  value={formData.estimatedQuantity}
                  onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Address / Remarks */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                {t.labelRemarks || 'Village / Delivery Address / Remarks'}
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <textarea
                  rows={3}
                  placeholder="Mention your village name or transport requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#004d34] hover:bg-[#003826] text-white py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition shadow-md hover:shadow-lg cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {t.btnSubmit || 'Submit Hub Inquiry'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}