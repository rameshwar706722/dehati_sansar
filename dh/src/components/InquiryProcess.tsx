import { Search, MapPin, BadgeCheck, Truck } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Select Input or Variety',
    desc: 'Catalog me se certified seeds, fertilizer ya sprayer select karein aur quantity note karein.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Choose Nearest Hub',
    desc: 'Apne paas ka hub (Kolaras, Shivpuri, Khaniyadhana ya Isagarh) dropdown me select karein.',
    icon: MapPin,
  },
  {
    step: '03',
    title: 'Instant Rate & Stock Verification',
    desc: 'Hamari hub team transparent Mandi wholesale rate aur batch availability verify karegi.',
    icon: BadgeCheck,
  },
  {
    step: '04',
    title: 'Counter Pickup / Direct Dispatch',
    desc: 'Hub counter se direct invoice ke sath collect karein ya gaon tak direct transport schedule karein.',
    icon: Truck,
  },
];

export default function InquiryProcess() {
  return (
    <section id="process" className="w-full py-14 bg-white border-t border-neutral-200">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-[#004d34] bg-emerald-50 px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
            Simple 4-Step Method
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-3">
            Inquiry & Hub Dispatch Process
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Bina kisi middleman commission ke direct regional hub se authentic agri inputs prapt karne ka aasan tarika.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div 
                key={s.step} 
                className="p-6 rounded-2xl bg-[#f8fafc] border border-neutral-200 flex flex-col justify-between hover:border-emerald-600 hover:shadow-sm transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-[#004d34]">{s.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#004d34] shadow-xs">
                      <Icon className="w-5 h-5 text-emerald-700" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mb-1.5">{s.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}