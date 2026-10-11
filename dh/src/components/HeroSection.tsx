import { ArrowRight, ShieldCheck, Truck, Store, PhoneCall } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="w-full bg-[#033b28] text-white py-16 lg:py-24 relative overflow-hidden">
      {/* Background Pattern Accent */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#064e35] border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Direct Agri-Supply & Outlets
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-6">
              Pure Inputs, Guaranteed Yields for Every Farmer.
            </h1>

            <p className="text-neutral-200 text-base sm:text-lg mb-8 max-w-xl font-normal leading-relaxed">
              Connect with certified regional centers for authentic seeds, balanced crop nutrition, verified bio-stimulants, and doorstep bulk delivery.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-bold px-7 py-3.5 rounded-xl transition shadow-lg text-sm"
              >
                Explore Product Catalog <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#process"
                className="inline-flex items-center gap-2 bg-transparent hover:bg-white/10 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition text-sm"
              >
                <PhoneCall className="w-4 h-4 text-emerald-300" />
                Direct Inquiry
              </a>
            </div>
          </div>

          {/* Right Visual / Metric Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#02281b] border border-emerald-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-2">Network Reach</h3>
              <p className="text-xs text-neutral-300 mb-6">Direct hub servicing Madhya Pradesh farms</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#04432f] border border-emerald-500/20">
                  <span className="text-3xl font-black text-[#eab308]">100%</span>
                  <p className="text-xs font-medium text-neutral-300 mt-1">Lab Tested Purity</p>
                </div>

                <div className="p-4 rounded-xl bg-[#04432f] border border-emerald-500/20">
                  <span className="text-3xl font-black text-[#eab308]">24 hr</span>
                  <p className="text-xs font-medium text-neutral-300 mt-1">Outlet Dispatch</p>
                </div>

                <div className="p-4 rounded-xl bg-[#04432f] border border-emerald-500/20">
                  <span className="text-3xl font-black text-[#eab308]">50+</span>
                  <p className="text-xs font-medium text-neutral-300 mt-1">Certified Products</p>
                </div>

                <div className="p-4 rounded-xl bg-[#04432f] border border-emerald-500/20">
                  <span className="text-3xl font-black text-[#eab308]">Indore</span>
                  <p className="text-xs font-medium text-neutral-300 mt-1">Nemawar Center</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pt-10 border-t border-emerald-800/60">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-white text-sm">Direct Outlet Pickup</h4>
              <p className="text-xs text-neutral-300">Instant pickup at Nemawar Road</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-white text-sm">Certified Batch Quality</h4>
              <p className="text-xs text-neutral-300">Govt. compliant batch tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-white text-sm">Multi-Store Pricing</h4>
              <p className="text-xs text-neutral-300">Transparent wholesale margins</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}