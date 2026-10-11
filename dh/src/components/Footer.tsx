import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function Footer() {
  const { lang, t } = useLanguage();
  const isHindi = lang === 'hi';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hubLocations = [
    {
      name: isHindi ? 'कोलारस हब' : 'Kolaras Hub',
      address: isHindi ? 'कृषि मंडी के पास, एबी रोड, कोलारस' : 'Near Krishi Mandi, AB Road, Kolaras',
      phone: '+91 98260 12345',
    },
    {
      name: isHindi ? 'शिवपुरी मुख्य हब' : 'Shivpuri Main Hub',
      address: isHindi ? 'बायपास चौराहा, शिवपुरी' : 'Bypass Circle, Shivpuri',
      phone: '+91 98260 23456',
    },
    {
      name: isHindi ? 'खनियांधाना हब' : 'Khaniyadhana Hub',
      address: isHindi ? 'मंडी रोड, खनियांधाना' : 'Mandi Road, Khaniyadhana',
      phone: '+91 98260 34567',
    },
    {
      name: isHindi ? 'ईसागढ़ हब' : 'Isagarh Hub',
      address: isHindi ? 'अशोकनगर रोड, ईसागढ़' : 'Ashoknagar Road, Isagarh',
      phone: '+91 98260 45678',
    },
  ];

  return (
    <footer className="w-full bg-[#032418] text-neutral-300 border-t border-emerald-950 font-sans">
      {/* Upper Footer Highlights */}
      <div className="w-full border-b border-emerald-900/60 bg-[#021c13]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#004d34] border border-emerald-700/50 flex items-center justify-center shrink-0 text-[#eab308]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isHindi ? '100% प्रमाणित गुणवत्ता' : '100% Certified Purity'}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isHindi ? 'सरकारी लैब प्रमाणित बीज व ओरिजिनल बिल' : 'Lab-tested germination slips & genuine tax invoices'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#004d34] border border-emerald-700/50 flex items-center justify-center shrink-0 text-[#eab308]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isHindi ? '24 घंटे में प्रेषण' : '24-Hour Dispatch'}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isHindi ? 'काउंटर उठाव या गांव तक सीधा परिवहन' : 'Counter pickup or direct farmgate delivery'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#004d34] border border-emerald-700/50 flex items-center justify-center shrink-0 text-[#eab308]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isHindi ? '4 प्रमुख क्षेत्रीय हब' : '4 Regional Hubs'}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isHindi ? 'कोलारस, शिवपुरी, खनियांधाना एवं ईसागढ़' : 'Serving Kolaras, Shivpuri, Khaniyadhana & Isagarh'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links & Hub Info */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1 & 2: Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#004d34] flex items-center justify-center shrink-0 border border-emerald-700/50">
                <svg className="w-6 h-6 text-[#eab308]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a1 1 0 0 1 1 1v1.1c1.86.34 3.4 1.7 3.86 3.58.12.49-.22.96-.72.96-.4 0-.74-.28-.84-.67A3.003 3.003 0 0 0 13 5.56V9.1c1.86.34 3.4 1.7 3.86 3.58.12.49-.22.96-.72.96-.4 0-.74-.28-.84-.67A3.003 3.003 0 0 0 13 10.56V21a1 1 0 1 1-2 0v-5.44a3.003 3.003 0 0 0-2.3-2.41.86.86 0 0 1-.84-.67c-.12-.49.22-.96.72-.96.4 0 .74.28.84.67A3.003 3.003 0 0 0 11 13.9V9.1a3.003 3.003 0 0 0-2.3-2.41.86.86 0 0 1-.84-.67c-.12-.49.22-.96.72-.96.4 0 .74.28.84.67A3.003 3.003 0 0 0 11 7.1V3a1 1 0 0 1 1-1Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tight">Dehati Sansar</span>
                <span className="text-[10px] font-extrabold text-emerald-400 tracking-wider uppercase">
                  {t.networkTagline}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
              {isHindi
                ? 'देहाती संसार मध्य प्रदेश के किसानों को उच्च गुणवत्ता वाले प्रमाणित बीज, खाद, कीटनाशक और आधुनिक स्प्रेयर सीधे क्षेत्रीय केंद्रों से उपलब्ध कराता है।'
                : 'Dehati Sansar connects regional farmers with laboratory-certified seeds, high-grade soil nutrition, and farm equipment directly from decentralized regional counters.'}
            </p>

            <div className="pt-2 text-xs space-y-2 text-neutral-400">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>support@dehatisansar.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>+91 98260 00000 / +91 755 0000000</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-900 pb-2">
              {isHindi ? 'त्वरित लिंक' : 'Quick Navigation'}
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" onClick={scrollToTop} className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                  {t.navHome}
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={scrollToTop} className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                  {t.navCatalog}
                </Link>
              </li>
              <li>
                <Link to="/inquiry" onClick={scrollToTop} className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                  {t.navProcess}
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={scrollToTop} className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                  {isHindi ? 'हमारे बारे में' : 'About Us'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 & 5: Regional Hub Counters */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-emerald-900 pb-2">
              {isHindi ? 'रीजनल आउटलेट व हब केंद्र' : 'Regional Outlet Hubs'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {hubLocations.map((hub, idx) => (
                <div key={idx} className="p-3 bg-[#021c13] rounded-xl border border-emerald-900/70 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
                    {hub.name}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug mb-1.5">
                    {hub.address}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-400">
                    {hub.phone}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="w-full border-t border-emerald-950/80 bg-[#01140d] py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>
            &copy; {new Date().getFullYear()} <b>Dehati Sansar</b> Multi-Store Agri Network. {isHindi ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/inquiry" onClick={scrollToTop} className="hover:text-neutral-300 transition">
              {isHindi ? 'पूछताछ दर्ज करें' : 'Submit Inquiry'}
            </Link>
            <Link to="/products" onClick={scrollToTop} className="hover:text-neutral-300 transition">
              {isHindi ? 'उत्पाद सूची' : 'Product SKUs'}
            </Link>
            <Link to="/about" onClick={scrollToTop} className="hover:text-neutral-300 transition">
              {isHindi ? 'हब नेटवर्क' : 'Hub Locations'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}