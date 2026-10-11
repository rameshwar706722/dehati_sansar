import { ShieldCheck, Sprout, Truck, Store, Award, Users, CheckCircle2, MapPin } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function AboutUsPage() {
  const { lang } = useLanguage();

  const isHindi = lang === 'hi';

  const values = [
    {
      icon: ShieldCheck,
      title: isHindi ? '100% प्रमाणित शुद्धता' : '100% Certified Purity',
      desc: isHindi
        ? 'प्रत्येक लॉट की अंकुरण क्षमता और रासायनिक संरचना की लैब जांच सुनिश्चित की जाती है।'
        : 'Every batch of seed and chemical input is backed by verified laboratory germination slips.',
    },
    {
      icon: Store,
      title: isHindi ? 'स्थानीय हब नेटवर्क' : 'Direct Regional Hubs',
      desc: isHindi
        ? 'कोलारस, शिवपुरी, खनियांधाना और ईसागढ़ से किसानों को बिना बिचौलिए के सीधा माल।'
        : 'Dedicated dispatch counters across Kolaras, Shivpuri, Khaniyadhana, and Isagarh.',
    },
    {
      icon: Award,
      title: isHindi ? 'पारदर्शी मंडी भाव' : 'Transparent Mandi Pricing',
      desc: isHindi
        ? 'थोक मूल्य आधारित उचित दरें, बिना किसी छिपे हुए अतिरिक्त शुल्क के।'
        : 'True wholesale mandi-pegged rates with zero hidden retail surcharges.',
    },
    {
      icon: Truck,
      title: isHindi ? 'खेत तक त्वरित डिलीवरी' : 'Doorstep Farmgate Transport',
      desc: isHindi
        ? 'बल्क ऑर्डर पर 24 घंटे के भीतर गांव और खेत तक सीधी सुरक्षित डिलीवरी सुविधा।'
        : 'Fast 24-hour turnaround for bulk agricultural input transportation directly to your village.',
    },
  ];

  const hubs = [
    {
      name: isHindi ? 'कोलारस हब' : 'Kolaras Hub',
      address: isHindi ? 'एबी रोड, कृषि मंडी के पास, कोलारस' : 'AB Road, Near Krishi Mandi, Kolaras',
      type: isHindi ? 'बीज एवं पोषण केंद्र' : 'Seed & Nutrition Counter',
    },
    {
      name: isHindi ? 'शिवपुरी मुख्य हब' : 'Shivpuri Main Hub',
      address: isHindi ? 'बाईपास चौराहा, शिवपुरी' : 'Bypass Circle, Shivpuri',
      type: isHindi ? 'मुख्य वितरण डिपो' : 'Primary Central Depot',
    },
    {
      name: isHindi ? 'खनियांधाना हब' : 'Khaniyadhana Hub',
      address: isHindi ? 'मंडी रोड, खनियांधाना' : 'Mandi Road, Khaniyadhana',
      type: isHindi ? 'उर्वरक एवं कीटनाशक केंद्र' : 'Fertilizer & Protection Center',
    },
    {
      name: isHindi ? 'ईसागढ़ हब' : 'Isagarh Hub',
      address: isHindi ? 'अशोकनगर रोड, ईसागढ़' : 'Ashoknagar Road, Isagarh',
      type: isHindi ? 'कृषि उपकरण व स्प्रेयर हब' : 'Sprayers & Farm Machinery Hub',
    },
  ];

  return (
    <div className="w-full bg-[#f8fafc] text-neutral-800">
      
      {/* 1. Page Header Banner */}
      <section className="w-full bg-[#004d34] text-white py-16 px-4 sm:px-6 lg:px-8 text-center border-b border-emerald-900">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#02281b] text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/30">
            {isHindi ? 'हमारे बारे में' : 'About Dehati Sansar'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {isHindi ? 'किसानों की तरक्की, शुद्धता का भरोसा' : 'Empowering Farmers with Authentic Agri-Inputs'}
          </h1>
          <p className="text-sm sm:text-base text-neutral-200 mt-4 leading-relaxed font-normal">
            {isHindi
              ? 'देहाती संसार एक संगठित मल्टी-स्टोर एग्री नेटवर्क है, जिसका उद्देश्य ग्रामीण किसानों को उच्च गुणवत्ता वाले बीज, खाद और कृषि उपकरण सीधे फैक्ट्री और मंडी दरों पर उपलब्ध कराना है।'
              : 'Dehati Sansar is a multi-store agri-distribution network dedicated to providing authentic seeds, certified fertilizers, and modern equipment straight from verified hubs to farmgates.'}
          </p>
        </div>
      </section>

      {/* 2. Mission & Vision Cards */}
      <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004d34] mb-6">
                <Sprout className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight mb-4">
                {isHindi ? 'हमारा मिशन (Our Mission)' : 'Our Mission'}
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-6">
                {isHindi
                  ? 'नकली और मिलावटी कृषि उत्पादों से किसानों की फसलों को बचाना और हर किसान तक उचित दाम पर समयबद्ध सप्लाई पहुंचाना ही हमारा मुख्य लक्ष्य है।'
                  : 'To protect farm yields against substandard or adulterated inputs by delivering lab-certified seeds, high-grade soil nutrition, and field-tested machinery at genuine wholesale prices.'}
              </p>
            </div>

            <ul className="space-y-3 pt-4 border-t border-neutral-100 text-xs sm:text-sm font-semibold text-neutral-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {isHindi ? 'बिना किसी बिचौलिया कमीशन के सीधी आपूर्ति' : 'Zero middleman commission'}
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {isHindi ? 'सरकारी मानकों के अनुरूप बैच टेस्टिंग' : 'Govt.-compliant batch certification'}
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {isHindi ? 'पारदर्शी वजन और ओरिजिनल टैक्स इनवॉइस' : 'Accurate digital weights & GST bills'}
              </li>
            </ul>
          </div>

          <div className="bg-[#02281b] text-white rounded-3xl p-8 sm:p-10 border border-emerald-800 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#004d34] border border-emerald-600/30 flex items-center justify-center text-[#eab308] mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-4">
                {isHindi ? 'हमारा विजन (Our Vision)' : 'Our Vision'}
              </h2>
              <p className="text-neutral-200 text-sm sm:text-base leading-relaxed mb-6">
                {isHindi
                  ? 'मध्य प्रदेश के हर प्रमुख कृषि क्षेत्र में आधुनिक वितरण केंद्र स्थापित करना, जहां किसान को एक ही छत के नीचे तकनीकी सलाह और सही इनपुट्स मिल सकें।'
                  : 'To establish an interconnected rural supply network across Central India where every farmer accesses genuine agrochemicals, technical support, and transparent mandi intelligence effortlessly.'}
              </p>
            </div>

            <div className="pt-6 border-t border-emerald-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  {isHindi ? 'विश्वसनीय नेटवर्क' : 'Trusted Network'}
                </p>
                <p className="text-[11px] text-neutral-300">Dehati Sansar Multi-Store</p>
              </div>
              <span className="text-xs font-bold text-[#eab308] bg-[#004d34] px-3.5 py-1.5 rounded-lg border border-emerald-600/40">
                FCO & Lab Verified
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Core Values Grid */}
      <section className="w-full bg-white py-16 border-y border-neutral-200">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black text-[#004d34] bg-emerald-50 px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
              {isHindi ? 'हमारी विशेषताएं' : 'Core Pillars'}
            </span>
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight mt-3">
              {isHindi ? 'हम पर किसान क्यों भरोसा करते हैं?' : 'Why Farmers Trust Dehati Sansar'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-emerald-600 hover:shadow-sm transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#004d34] mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mb-2">{val.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Active Hub Locations */}
      <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-[#004d34] bg-emerald-50 px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
            {isHindi ? 'सक्रिय वितरण केंद्र' : 'Regional Network'}
          </span>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight mt-3">
            {isHindi ? 'हमारे प्रमुख हब केंद्र' : 'Our Active Hub Locations'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            {isHindi
              ? 'वर्तमान में इन 4 केंद्रों से निरंतर स्टॉक और खेत तक ट्रांसपोर्ट सेवा संचालित की जा रही है।'
              : 'Seamless distribution, direct billing, and farmgate dispatch available across these key counters.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hubs.map((hub, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-emerald-600 transition"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit mb-3">
                <MapPin className="w-3.5 h-3.5" />
                {hub.type}
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-2">{hub.name}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{hub.address}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}