import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Tractor, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Send, 
  X, 
  CheckCircle2, 
  Fuel, 
  ShieldCheck, 
  MessageCircle,
  Calculator,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useOutlet } from '../OutletContext';
import { 
  fetchAllMasterServices, 
  submitServiceBooking,
  type MasterService 
} from '../services/api';

export default function ServicesPage() {
  const { lang } = useLanguage();
  const isHindi = lang === 'hi';
  const { selectedOutlet, getDistanceKmFromHub } = useOutlet();

  const [services, setServices] = useState<MasterService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Modal State
  const [selectedService, setSelectedService] = useState<MasterService | null>(null);
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [farmAcres, setFarmAcres] = useState('5');
  const [villageAddress, setVillageAddress] = useState('');
  const [cropType, setCropType] = useState('Wheat / गेहूं');
  const [requiresOperator, setRequiresOperator] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch dynamic services from MySQL backend
  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllMasterServices();
      setServices(data || []);
    } catch (err: any) {
      console.error('Error loading services:', err);
      setError(err?.response?.data?.error || err.message || 'Failed to load agricultural services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  // Current distance from selected Mandi Hub
  const hubKm = selectedOutlet && selectedOutlet.cityName !== 'All' 
    ? getDistanceKmFromHub(selectedOutlet.lat, selectedOutlet.lng) 
    : null;

  // Filter services according to the hub's coverage rule
  const availableServices = useMemo(() => {
    return services.filter((srv) => {
      if (srv.is_active === 0) return false;

      // 1. All hubs provide this service
      if (srv.coverage_mode === 'ALL_HUBS') return true;

      // 2. Nearby radius filter
      if (srv.coverage_mode === 'NEARBY_ONLY') {
        if (!selectedOutlet || selectedOutlet.cityName === 'All') return true;
        if (hubKm === null) return true;
        return hubKm <= srv.max_distance_km;
      }

      // 3. Specific hubs checklist
      if (srv.coverage_mode === 'SPECIFIC_HUBS') {
        if (!selectedOutlet || selectedOutlet.cityName === 'All') return true;
        const matched = (srv.hub_allocations || []).find(
          (h) => String(h.store_id) === String(selectedOutlet.id)
        );
        return Boolean(matched && matched.is_available === 1);
      }

      return true;
    });
  }, [services, selectedOutlet, hubKm]);

  // Compute active rate for a service (Localized rate vs Base rate)
  const getEffectiveRate = useCallback((srv: MasterService): { rate: number; isCustom: boolean } => {
    if (selectedOutlet && selectedOutlet.cityName !== 'All') {
      const matched = (srv.hub_allocations || []).find(
        (h) => String(h.store_id) === String(selectedOutlet.id)
      );
      if (matched && matched.custom_rate !== null && matched.custom_rate !== undefined) {
        return { rate: Number(matched.custom_rate), isCustom: true };
      }
    }
    return { rate: Number(srv.rate_per_acre), isCustom: false };
  }, [selectedOutlet]);

  // Estimated booking cost calculation
  const estimatedCost = useMemo(() => {
    if (!selectedService) return 0;
    const { rate } = getEffectiveRate(selectedService);
    const acres = parseFloat(farmAcres) || 0;
    return acres * rate;
  }, [selectedService, farmAcres, getEffectiveRate]);

  // Open Booking Modal with sensible default dates (Tomorrow to Day After)
  const handleOpenModal = (srv: MasterService) => {
    setSelectedService(srv);
    setBookingSuccess(false);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    setStartDate(tomorrow.toISOString().split('T')[0]);
    setEndDate(dayAfter.toISOString().split('T')[0]);
  };

  // Submit Booking to Backend
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setIsSubmitting(true);

    try {
      await submitServiceBooking({
        service_name: selectedService.title,
        model_name: selectedService.model || undefined,
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        start_date: startDate,
        end_date: endDate,
        farm_acres: parseFloat(farmAcres) || 1,
        crop_type: cropType,
        village_address: villageAddress,
        store_id: selectedOutlet.id === 'all' ? 1 : Number(selectedOutlet.id),
        requires_operator: requiresOperator,
        estimated_cost: estimatedCost,
      });

      setBookingSuccess(true);
    } catch (err: any) {
      alert('Booking error: ' + (err?.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Top Hero Banner */}
        <div className="bg-[#034d35] rounded-3xl p-8 sm:p-12 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold border border-white/20">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {selectedOutlet.cityName === 'All' 
                  ? (isHindi ? 'सभी मंडी मशीनरी यार्ड' : 'All Regional Machinery Yards')
                  : `${selectedOutlet.cityName} Machinery Dispatch Center`}
              </span>
              {hubKm !== null && (
                <span className="text-amber-300 font-extrabold ml-1">
                  · {hubKm} km from your farm
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {isHindi ? 'हार्वेस्टर एवं कृषि उपकरण रेंटल सेवा' : 'Harvester & Farm Machinery On-Demand Rental'}
            </h1>

            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl">
              {isHindi
                ? 'कटाई और जुताई के समय भारी मशीनरी खरीदने की आवश्यकता नहीं। अपने खेत के लिए सीधे तारीख चुनकर हार्वेस्टर और ट्रैक्टर रेंट पर बुक करें।'
                : 'Zero capital investment for peak farm operations. Book combine harvesters, laser levelers, and heavy tractor attachments on scheduled dates per acre.'}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-emerald-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>{isHindi ? 'सत्यापित ऑपरेटर' : 'Certified Operators Included'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-amber-400" />
                <span>{isHindi ? 'पारदर्शी डीजल मीटर' : 'Transparent Fuel Logging'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{isHindi ? 'खेत पर समय पर डिलीवरी' : 'Guaranteed Farm-Gate Dispatch'}</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-16 -bottom-16 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
        </div>

        {/* Loading / Error State */}
        {loading && (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="text-sm font-bold text-slate-600">
              {isHindi ? 'मंडी मशीनरी कैटलॉग लोड हो रहा है...' : 'Connecting to regional machinery inventory...'}
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => void loadServices()}
              className="underline font-bold hover:text-red-950 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Live Services Grid */}
        {!loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-outfit">
                  {isHindi ? 'उपलब्ध कृषि मशीनरी एवं सेवाएं' : 'Available Machinery & Agricultural Services'}
                </h2>
                <span className="text-xs text-slate-500">
                  {availableServices.length} {isHindi ? 'सेवाएं इस केंद्र पर उपलब्ध हैं' : 'services dispatchable from this hub'}
                </span>
              </div>

              <button
                onClick={() => void loadServices()}
                className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition cursor-pointer"
                title="Refresh services"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {availableServices.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Tractor className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  {isHindi ? 'इस केंद्र पर कोई मशीनरी उपलब्ध नहीं है' : 'No machinery listed for this hub radius'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {isHindi
                    ? 'कृपया ऊपर नेवबार से कोई अन्य मंडी हब चुनें या दूरी की जांच करें।'
                    : 'Try selecting a different hub outlet or consult your regional coordinator.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {availableServices.map((srv) => {
                  const { rate, isCustom } = getEffectiveRate(srv);

                  return (
                    <div
                      key={srv.id}
                      className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-600/60 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image banner with OpaqueResponseBlocking guard */}
                        <div className="relative h-56 bg-slate-100 overflow-hidden">
                          {srv.image_url ? (
                            <img
                              src={srv.image_url}
                              alt={srv.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                              <Tractor className="w-12 h-12" />
                            </div>
                          )}

                          <div className="absolute top-3 left-3">
                            <span className="bg-[#034d35]/90 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-md border border-emerald-700/60 shadow-xs">
                              {srv.tag || 'Available'}
                            </span>
                          </div>

                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                            {isCustom && (
                              <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-xs">
                                Local Hub Rate
                              </span>
                            )}
                            <span className="bg-black/75 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-md font-mono">
                              ₹{rate.toLocaleString('en-IN')} {srv.rate_unit || 'per acre'}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <div>
                            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                              {srv.model || 'Standard Machinery'}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#034d35] transition-colors mt-0.5">
                              {srv.title}
                            </h3>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {srv.description}
                            </p>
                          </div>

                          {Array.isArray(srv.specs) && srv.specs.length > 0 && (
                            <ul className="space-y-2 pt-2 border-t border-slate-100">
                              {srv.specs.map((spec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{spec}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="p-6 pt-0 flex gap-3 items-center">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(srv)}
                          className="flex-1 py-3 px-4 bg-[#034d35] hover:bg-[#023b28] text-white rounded-xl text-xs font-bold tracking-wide transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-amber-300" />
                          <span>{isHindi ? 'तारीख चुनें एवं बुक करें' : 'Select Dates & Rent'}</span>
                        </button>

                        <a
                          href={`https://wa.me/917067224946?text=${encodeURIComponent(
                            `Namaste Dehati Sansar, I want to rent "${srv.title}" (₹${rate}/${srv.rate_unit}) for my farm near${selectedOutlet.cityName}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition cursor-pointer flex items-center justify-center"
                          title="Direct WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold text-slate-900">
                  {isHindi ? 'रेंटल अनुरोध सफलतापूर्वक दर्ज!' : 'Rental Request Scheduled!'}
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {isHindi
                    ? `आपका अनुरोध ${selectedOutlet.cityName} मंडी यार्ड को भेज दिया गया है। प्रतिनिधि जल्द संपर्क करेगा।`
                    : `Your machinery booking has been submitted to the ${selectedOutlet.cityName} dispatch hub. A coordinator will verify your booking shortly.`}
                </p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 space-y-1 max-w-xs mx-auto text-left">
                  <div><strong>Equip:</strong> {selectedService.title}</div>
                  <div><strong>Dates:</strong> {startDate} to {endDate}</div>
                  <div><strong>Area:</strong> {farmAcres} Acres ({cropType})</div>
                  <div><strong>Est. Total:</strong> ₹{estimatedCost.toLocaleString('en-IN')}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="mt-2 px-6 py-2.5 bg-[#034d35] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-left">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    {selectedOutlet.cityName} Mandi Machinery Yard
                  </span>
                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    {selectedService.title}
                  </h3>
                  <div className="text-xs font-bold text-slate-500 mt-0.5">
                    Rate: ₹{getEffectiveRate(selectedService).rate.toLocaleString('en-IN')} {selectedService.rate_unit}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHindi ? 'किसान का नाम *' : 'Farmer Name *'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rameshwar Lodhi"
                        value={farmerName}
                        onChange={(e) => setFarmerName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHindi ? 'मोबाइल नंबर *' : 'Phone Number *'}
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
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Selectors: From Date to To Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHindi ? 'शुरुआती तारीख (From Date) *' : 'From Date (Start) *'}
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHindi ? 'समाप्ति तारीख (To Date) *' : 'To Date (End) *'}
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        required
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHindi ? 'खेत का रकबा (एकड़ में) *' : 'Farm Area (Acres) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.5"
                      placeholder="e.g. 5"
                      value={farmAcres}
                      onChange={(e) => setFarmAcres(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-600 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHindi ? 'फसल का प्रकार' : 'Crop Type'}
                    </label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                    >
                      <option value="Wheat / गेहूं">Wheat / गेहूं</option>
                      <option value="Soybean / सोयाबीन">Soybean / सोयाबीन</option>
                      <option value="Gram / चना">Gram / चना</option>
                      <option value="Mustard / सरसों">Mustard / सरसों</option>
                      <option value="Maize / मक्का">Maize / मक्का</option>
                      <option value="Other / अन्य">Other / अन्य</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'खेत का पता / गाँव / लैंडमार्क *' : 'Farm Village / Landmark *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isHindi ? 'उदा. ग्राम मड़ीखेड़ा, नहर के पास' : 'e.g. Village Madikheda, near canal bridge'}
                    value={villageAddress}
                    onChange={(e) => setVillageAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="operatorCheck"
                    checked={requiresOperator}
                    onChange={(e) => setRequiresOperator(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="operatorCheck" className="text-xs text-slate-700 cursor-pointer font-medium select-none">
                    {isHindi ? 'प्रमाणित ऑपरेटर व कटरमैन साथ चाहिए (अनुशंसित)' : 'Include certified machine operator & helper (Recommended)'}
                  </label>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-700" />
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                        Estimated Cost
                      </span>
                      <span className="text-xs text-slate-600">
                        {farmAcres} Acres × ₹{getEffectiveRate(selectedService).rate.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-900 font-mono">
                      ₹{estimatedCost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">+ standard fuel log</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#034d35] hover:bg-[#023b28] disabled:bg-emerald-950 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isSubmitting ? 'Scheduling with Yard...' : (isHindi ? 'मशीनरी रेंटल बुक करें' : 'Confirm Machinery Rental')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}