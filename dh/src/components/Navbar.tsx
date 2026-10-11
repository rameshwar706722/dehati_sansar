import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  MapPin,
  Layers,
  Menu,
  X,
  Globe,
  Crosshair,
  ChevronDown,
  Check,
  Navigation,
  Wrench,
  ShoppingBag,
  HelpCircle,
  Info,
  Home
} from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { useOutlet } from "../OutletContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [outletDropdownOpen, setOutletDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { lang, setLang, t } = useLanguage();
  const isHindi = lang === "hi";

  const {
    outlets,
    selectedOutlet,
    setSelectedOutlet,
    detectAutoLocation,
    isLocating,
    loadingLocations,
    getDistanceKmFromHub,
  } = useOutlet();

  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOutletDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative px-3.5 py-2 text-xs sm:text-[13px] font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
      isActive
        ? "text-[#034d35] bg-emerald-50/80 shadow-xs border border-emerald-200/60"
        : "text-slate-600 hover:text-[#034d35] hover:bg-slate-50"
    }`;

  const currentHubDistance =
    selectedOutlet.cityName !== "All"
      ? getDistanceKmFromHub(selectedOutlet.lat, selectedOutlet.lng)
      : null;

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all shadow-xs">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* 🌟 Brand Identity Logo */}
          <Link
            to="/"
            onClick={() => handleNavigation("/")}
            className="flex items-center gap-3 shrink-0 text-left group focus:outline-hidden"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#044c34] to-[#022c1e] flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/20 group-hover:scale-102 transition-transform duration-200 border border-emerald-600/30">
              <svg
                className="w-7 h-7 text-[#fbbf24] drop-shadow-xs"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2a1 1 0 0 1 1 1v1.1c1.86.34 3.4 1.7 3.86 3.58.12.49-.22.96-.72.96-.4 0-.74-.28-.84-.67A3.003 3.003 0 0 0 13 5.56V9.1c1.86.34 3.4 1.7 3.86 3.58.12.49-.22.96-.72.96-.4 0-.74-.28-.84-.67A3.003 3.003 0 0 0 13 10.56V21a1 1 0 1 1-2 0v-5.44a3.003 3.003 0 0 0-2.3-2.41.86.86 0 0 1-.84-.67c-.12-.49.22-.96.72-.96.4 0 .74.28.84.67A3.003 3.003 0 0 0 11 13.9V9.1a3.003 3.003 0 0 0-2.3-2.41.86.86 0 0 1-.84-.67c-.12-.49.22-.96.72-.96.4 0 .74.28.84.67A3.003 3.003 0 0 0 11 7.1V3a1 1 0 0 1 1-1Z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[22px] sm:text-[24px] font-black text-slate-900 tracking-tight leading-none font-outfit">
                  Dehati <span className="text-[#034d35]">Sansar</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 rounded-md border border-emerald-300/60">
                  AgriHub
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-[#007a4d] tracking-widest uppercase mt-0.5 whitespace-nowrap">
                {t.networkTagline || "Kisan First • Direct Mandi Network"}
              </span>
            </div>
          </Link>

          {/* 🌟 Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 whitespace-nowrap bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
            <NavLink
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={navLinkClasses}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t.navHome || (isHindi ? "होम" : "Home")}</span>
            </NavLink>

            <NavLink
              to="/products"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={navLinkClasses}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t.navCatalog || (isHindi ? "उत्पाद" : "Products")}</span>
            </NavLink>

            <NavLink
              to="/services"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={navLinkClasses}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isHindi ? "सेवाएं एवं रेंटल" : "Services & Rental"}</span>
              <span className="px-1.5 py-0.2 text-[9px] font-black bg-amber-400/30 text-amber-900 rounded-full border border-amber-300">
                New
              </span>
            </NavLink>

            <NavLink
              to="/inquiry"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={navLinkClasses}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.navProcess || (isHindi ? "पूछताछ" : "Inquiry")}</span>
            </NavLink>

            <NavLink
              to="/about"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={navLinkClasses}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{isHindi ? "हमारे बारे में" : "About Us"}</span>
            </NavLink>
          </nav>

          {/* 🌟 Right Action Hub Controls */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === "hi" ? "en" : "hi")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === "hi" ? "English" : "हिंदी"}</span>
            </button>

            {/* Premium DB-Driven Regional Mandi Hub Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-emerald-600/50 transition-all">
                <button
                  type="button"
                  onClick={() => setOutletDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/50">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase leading-none">
                      {isHindi ? "क्षेत्रीय मंडी हब" : (t.selectedOutlet || "Selected Outlet")}
                    </span>
                    <span className="text-xs font-black text-slate-800 mt-0.5 whitespace-nowrap flex items-center gap-1.5">
                      {loadingLocations ? (
                        <span className="animate-pulse text-slate-400">Loading hubs...</span>
                      ) : (
                        <>
                          <span>{selectedOutlet.cityName}</span>
                          {currentHubDistance !== null && (
                            <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100/90 px-1.5 py-0.2 rounded-md">
                              {currentHubDistance} km
                            </span>
                          )}
                        </>
                      )}
                      <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                    </span>
                  </div>
                </button>

                {/* Auto GPS Detection Quick Button */}
                <button
                  type="button"
                  onClick={detectAutoLocation}
                  disabled={isLocating}
                  title="Detect nearest mandi hub via GPS"
                  className="p-2.5 border-l border-slate-100 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-r-2xl transition cursor-pointer"
                >
                  <Crosshair
                    className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-emerald-600" : ""}`}
                  />
                </button>
              </div>

              {/* Enhanced Dropdown Menu Popup */}
              {outletDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        {isHindi ? "मंडी काउंटर चुनें" : "Select Regional Mandi Yard"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Live stock & dispatch rates
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        detectAutoLocation();
                        setOutletDropdownOpen(false);
                      }}
                      className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-black flex items-center gap-1 transition cursor-pointer"
                    >
                      <Crosshair className="w-3 h-3" /> auto GPS
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1 px-1.5">
                    {outlets.map((outlet) => {
                      const isSelected = selectedOutlet.id === outlet.id;
                      const km =
                        outlet.cityName !== "All"
                          ? getDistanceKmFromHub(outlet.lat, outlet.lng)
                          : null;

                      return (
                        <button
                          key={outlet.id}
                          type="button"
                          onClick={() => {
                            setSelectedOutlet(outlet);
                            setOutletDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "font-black text-emerald-900 bg-emerald-50 border border-emerald-200"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-slate-900 font-bold">{outlet.name}</span>
                            {outlet.cityName !== "All" && (
                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                <span>{outlet.cityName} Mandi Yard</span>
                                {km !== null && (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded text-[9px]">
                                    <Navigation className="w-2.5 h-2.5" /> {km} km
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Dashboard Terminal Link */}
            <Link
              to="/admin"
              onClick={() => handleNavigation("/admin")}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition shadow-sm hover:shadow-md cursor-pointer border border-slate-700"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t.adminConsole || "Console"}</span>
            </Link>
          </div>

          {/* 🌟 Mobile Hamburger & Quick Language Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setLang(lang === "hi" ? "en" : "hi")}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-black bg-slate-50 text-slate-800"
            >
              {lang === "hi" ? "EN" : "हिं"}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-900" />
              ) : (
                <Menu className="w-6 h-6 text-slate-900" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* 🌟 Mobile Frosted Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-5 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-3 duration-200">
          
          {/* Outlet Selection Card in Mobile */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHindi ? "चयनित मंडी आउटलेट" : "Selected Mandi Outlet"}</span>
              </span>
              <button
                type="button"
                onClick={detectAutoLocation}
                disabled={isLocating}
                className="text-xs text-emerald-700 font-extrabold flex items-center gap-1 cursor-pointer bg-emerald-100/60 px-2 py-0.5 rounded-lg"
              >
                <Crosshair
                  className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-emerald-600" : ""}`}
                />
                <span>{isLocating ? "Locating..." : "Auto GPS"}</span>
              </button>
            </div>

            <select
              value={selectedOutlet.id}
              onChange={(e) => {
                const found = outlets.find((o) => o.id === e.target.value);
                if (found) setSelectedOutlet(found);
              }}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600"
            >
              {outlets.map((outlet) => {
                const km =
                  outlet.cityName !== "All"
                    ? getDistanceKmFromHub(outlet.lat, outlet.lng)
                    : null;
                return (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name} ({outlet.cityName}) {km !== null ? `— ${km} km` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleNavigation("/")}
              className="w-full text-left py-2.5 px-3 text-sm font-bold text-slate-800 hover:text-emerald-800 hover:bg-slate-50 rounded-xl flex items-center justify-between"
            >
              <span>{t.navHome || (isHindi ? "होम" : "Home")}</span>
              <Home className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigation("/products")}
              className="w-full text-left py-2.5 px-3 text-sm font-bold text-slate-800 hover:text-emerald-800 hover:bg-slate-50 rounded-xl flex items-center justify-between"
            >
              <span>{t.navCatalog || (isHindi ? "उत्पाद कैटलॉग" : "Product Catalog")}</span>
              <ShoppingBag className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigation("/services")}
              className="w-full text-left py-2.5 px-3 text-sm font-bold text-emerald-800 bg-emerald-50/70 border border-emerald-200/50 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{isHindi ? "कृषि सेवाएं एवं मशीनरी रेंटल" : "Services & Machinery Rental"}</span>
                <span className="px-1.5 py-0.2 text-[9px] font-black bg-amber-400/40 text-amber-900 rounded-md">
                  New
                </span>
              </div>
              <Wrench className="w-4 h-4 text-emerald-700" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigation("/inquiry")}
              className="w-full text-left py-2.5 px-3 text-sm font-bold text-slate-800 hover:text-emerald-800 hover:bg-slate-50 rounded-xl flex items-center justify-between"
            >
              <span>{t.navProcess || (isHindi ? "किसान पूछताछ" : "Farmer Inquiry")}</span>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigation("/about")}
              className="w-full text-left py-2.5 px-3 text-sm font-bold text-slate-800 hover:text-emerald-800 hover:bg-slate-50 rounded-xl flex items-center justify-between"
            >
              <span>{isHindi ? "हमारे बारे में" : "About Us"}</span>
              <Info className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Admin Dashboard Mobile Access */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleNavigation("/admin")}
              className="w-full text-left py-2.5 px-3 text-sm font-black text-slate-900 bg-slate-100 rounded-xl flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>{t.adminConsole || "Admin Inventory Console"}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Manage</span>
            </button>
          </div>

        </div>
      )}
    </header>
  );
}