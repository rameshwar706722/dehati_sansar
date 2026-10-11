import InquiryForm from '../components/InquiryForm';
import InquiryProcess from '../components/InquiryProcess';
import { useLanguage } from '../LanguageContext';

export default function InquiryPage() {
  const { lang } = useLanguage();

  return (
    <div className="w-full flex flex-col bg-[#f8fafc] min-h-[calc(100vh-80px)]">
      {/* 1. Header Banner */}
      <div className="w-full bg-[#004d34] text-white py-12 px-4 sm:px-6 lg:px-8 text-center border-b border-emerald-900">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#02281b] text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
            {lang === 'hi' ? 'सीधा काउंटर संपर्क' : 'Direct Counter Connect'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {lang === 'hi' ? 'कृषि उत्पाद पूछताछ एवं बुकिंग' : 'Agricultural Inputs & Booking Inquiry'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-200 mt-2 max-w-xl mx-auto">
            {lang === 'hi'
              ? 'नीचे दिए गए फॉर्म में अपना नजदीकी हब चुनें और तुरंत पक्के मंडी भाव की जानकारी प्राप्त करें।'
              : 'Select your nearest hub below to verify live stock availability and wholesale Mandi pricing.'}
          </p>
        </div>
      </div>

      {/* 2. Inquiry Form */}
      <div className="w-full py-6">
        <InquiryForm />
      </div>

      {/* 3. Inquiry Process */}
      <div className="w-full pb-16">
        <InquiryProcess />
      </div>
    </div>
  );
}