import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

// 🌾 Update your banner images, text, and promo details here:
const OFFERS = [
  {
    id: 1,
    tag: 'Rabi Season Special',
    title: 'Certified High-Yield Wheat & Mustard Seeds',
    description: 'Direct outlet subsidy pricing with verified seed germination lab reports. Bulk bag orders dispatched within 24 hours.',
    ctaText: 'Claim Subsidy Price',
    ctaLink: '#catalog',
    badge: 'Limited Stock',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 2,
    tag: 'Soil Nutrition & Growth',
    title: '100% Water Soluble NPK & Bio-Fertilizers',
    description: 'Wholesale factory-direct rates on 25kg & 50kg bags for balanced root nourishment and maximum crop yield.',
    ctaText: 'Explore Wholesale Rates',
    ctaLink: '#catalog',
    badge: 'Best Value',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 3,
    tag: 'Modern Farm Gear',
    title: 'Heavy-Duty 16L Battery Sprayers & Kits',
    description: '12V dual motor pump sprayers tested for Indian fields with instant 6-month outlet replacement guarantee.',
    ctaText: 'View Farm Equipment',
    ctaLink: '#catalog',
    badge: 'New Arrival',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=2000&q=85',
  },
];

export default function OfferCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? OFFERS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === OFFERS.length - 1 ? 0 : prev + 1));
  };

  // Auto-advance banner every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <section className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] overflow-hidden bg-neutral-950">
      {/* Background Slides */}
      {OFFERS.map((offer, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={offer.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Full-bleed background image */}
            <img
              src={offer.image}
              alt={offer.title}
              className={`w-full h-full object-cover object-center transform transition-transform duration-7000 ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            />

            {/* Gradient Overlays for High-Contrast Readable Text */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#022116]/95 via-[#022116]/80 to-transparent sm:w-3/4 lg:w-3/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Slide Content Aligned to Left */}
            <div className="relative z-10 h-full w-full max-w-[1400px] mx-auto px-6 sm:px-12 flex flex-col justify-center items-start text-left">
              <div className="max-w-2xl space-y-4">
                
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eab308] text-neutral-950 text-xs font-black uppercase tracking-wider shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    {offer.badge}
                  </span>
                  <span className="text-xs font-bold text-emerald-300 tracking-wider uppercase bg-[#04432f]/80 px-2.5 py-0.5 rounded border border-emerald-500/30">
                    {offer.tag}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] drop-shadow-md">
                  {offer.title}
                </h2>

                {/* Description */}
                <p className="text-neutral-200 text-sm sm:text-base lg:text-lg max-w-xl font-normal leading-relaxed drop-shadow">
                  {offer.description}
                </p>

                {/* CTA Button */}
                <div className="pt-2">
                  <a
                    href={offer.ctaLink}
                    className="inline-flex items-center gap-2.5 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-bold px-7 py-3.5 rounded-xl transition duration-200 text-sm shadow-xl hover:shadow-yellow-500/20"
                  >
                    {offer.ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Controls: Left & Right Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition backdrop-blur-md border border-white/20 hover:scale-105"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition backdrop-blur-md border border-white/20 hover:scale-105"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Navigation Controls: Bottom Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
        {OFFERS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Jump to slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? 'w-9 bg-[#eab308] shadow-lg'
                : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}