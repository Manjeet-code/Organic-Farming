"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export default function LandingPage() {
  const router = useRouter();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const offerings = [
    {
      title: "Organic Vegetables",
      desc: "Pure, fresh & 100% chemical-free leafy greens, tomatoes, and root vegetables harvested same-night.",
      badge: "Pure | Fresh | Chemical Free",
      icon: "🥦",
      color: "bg-emerald-50 border-emerald-200 text-emerald-900",
    },
    {
      title: "Pure A2 Dairy Products",
      desc: "Fresh unprocessed A2 Gir cow milk, handcrafted organic paneer, and Bilona-method Vedic ghee.",
      badge: "Fresh Milk | Curd | Ghee",
      icon: "🥛",
      color: "bg-amber-50 border-amber-200 text-amber-900",
    },
    {
      title: "Nutrient-Rich Vermicompost",
      desc: "High-grade 100% organic soil conditioner and plant booster rich in earthworm microbes & nutrients.",
      badge: "Rich Nutrients | 100% Organic",
      icon: "🪱",
      color: "bg-stone-50 border-stone-200 text-stone-900",
    },
    {
      title: "Natural Farm Produce",
      desc: "Naturally grown farm essentials including unpolished pulses, pure turmeric, and cold-pressed oilseeds.",
      badge: "Pure Turmeric | Pulses | Oilseeds",
      icon: "🌾",
      color: "bg-yellow-50 border-yellow-200 text-yellow-900",
    },
    {
      title: "Fresh Farm Fruits",
      desc: "Naturally ripened, pesticide-free fresh farm fruits including organic guava, papaya, and seasonal treats.",
      badge: "Guava | Papaya & Seasonal",
      icon: "🍎",
      color: "bg-rose-50 border-rose-200 text-rose-900",
    },
  ];

  const pillars = [
    {
      title: "100% Natural & Organic",
      desc: "Guaranteed zero synthetic chemicals, artificial sprays, or toxic pesticides on any produce.",
      icon: "🌿",
    },
    {
      title: "Ethical Animal Care",
      desc: "Our A2 Gir cows graze freely on organic green fodder in open, compassionate farm pastures.",
      icon: "🐄",
    },
    {
      title: "Healthy Soil, Better Yield",
      desc: "Nurturing soil microbiome using vermicompost and sustainable bio-fertilizers for rich crop nutrition.",
      icon: "🌱",
    },
    {
      title: "Supporting Local Farmers",
      desc: "Empowering traditional farming families in Bihar with direct fair-trade farm partnerships.",
      icon: "👨‍🌾",
    },
    {
      title: "Sustainable Tomorrow",
      desc: "Eco-conscious packaging, same-night harvest, and 7:00 AM guaranteed doorstep delivery.",
      icon: "🌏",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-emerald-800 text-white text-xs font-semibold py-2 px-4 text-center">
        🌱 The Farm Brothers | Lal Balram Organic Farm, Arwal, Bihar • 7:00 AM Guaranteed Doorstep Delivery!
      </div>

      {/* 2. NAVIGATION BAR (LIGHT MODE) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Logo href="/" />

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-700">
            <a href="#offerings" className="hover:text-emerald-700 transition">Our Offerings</a>
            <a href="#why-us" className="hover:text-emerald-700 transition">Why Choose Us</a>
            <a href="#farm-story" className="hover:text-emerald-700 transition">Farm Location</a>
            <Link href="/storefront" className="text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1 font-extrabold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <span>🥦</span> Browse Storefront Catalog
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRoleModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <span>🔑</span> Sign In
            </button>

            <Link
              href="/register"
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <span>✨</span> New Customer Register
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (LIGHT MODE) */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Lal Balram Organic Farm • Arwal, Bihar - 804401
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Growing Good. <br />
            <span className="text-emerald-700">
              Growing Together.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Pure A2 Gir cow dairy, fresh chemical-free organic vegetables, and nutrient-rich vermicompost directly from our family farm to your doorstep by 7:00 AM.
          </p>

          {/* Key Metric Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs font-bold">
            <span className="bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-emerald-800 shadow-sm flex items-center gap-1.5">
              <span>🌿</span> 100% Chemical-Free & Organic
            </span>
            <span className="bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-amber-800 shadow-sm flex items-center gap-1.5">
              <span>🥛</span> Pure A2 Gir Cow Milk & Ghee
            </span>
            <span className="bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-blue-800 shadow-sm flex items-center gap-1.5">
              <span>🚚</span> 9:30 PM Cutoff → 7 AM Delivery
            </span>
          </div>

          {/* Action Callouts */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href="/storefront"
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-600 text-white font-black text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-emerald-900/10 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>🥦</span> Explore Fresh Catalog
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow transition flex items-center justify-center gap-2"
            >
              <span>🌿</span> Join as New Customer
            </Link>
          </div>

          {/* Quick Sign In Modal Trigger */}
          <div className="mt-6">
            <button
              onClick={() => setShowRoleModal(true)}
              className="text-xs text-slate-600 hover:text-emerald-700 underline font-bold transition"
            >
              Existing Member or Staff? Click here to Sign In (Customer, Delivery Ops, Admin)
            </button>
          </div>
        </div>
      </section>

      {/* 4. OFFERINGS SHOWCASE SECTION (LIGHT MODE) */}
      <section id="offerings" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-emerald-700 text-xs font-black uppercase tracking-widest block mb-2">
              Direct From Lal Balram Farm
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Farm Fresh Produce & Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              Every item is cultivated with sustainable organic practices and harvested at peak freshness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 hover:bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                      {item.icon}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">{item.desc}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800">100% Organic Certified</span>
                  <Link
                    href="/storefront"
                    className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1"
                  >
                    View Catalog <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US / VALUE PILLARS (LIGHT MODE) */}
      <section id="why-us" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-amber-700 text-xs font-black uppercase tracking-widest block mb-2">
              Our Core Promise
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Why Choose The Farm Brothers?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              Built on transparency, ethical farming, and guaranteed early morning freshness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow transition"
              >
                <span className="text-3xl block mb-3">{p.icon}</span>
                <h4 className="text-base font-extrabold text-slate-900">{p.title}</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FARM LOCATION & HELPLINE BANNER (LIGHT CARD ACCENT) */}
      <section id="farm-story" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Visit & Contact Us
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Lal Balram Organic Farm, Arwal, Bihar
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-medium">
                Address: Lal Balram Organic Farm, Arwal, Bihar - 804401 <br />
                Helpline Phone: <strong className="text-amber-300 font-mono text-sm">+91 85444 88617</strong> <br />
                Support Email: <strong className="text-white">hello@thefarmbrothers.com</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition text-center shadow"
              >
                Register as Customer
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-6 py-3.5 rounded-xl border border-white/20 transition text-center"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <Footer />

      {/* 8. QUICK ROLE LOGIN MODAL (LIGHT MODE) */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Select Portal Sign In Option</h3>
                <p className="text-xs text-slate-500 font-medium">Choose your account role to proceed</p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-900 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  router.push("/login");
                }}
                className="w-full bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 p-4 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 block">
                    🛒 Customer Portal
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Order fresh produce, subscriptions & wallet</span>
                </div>
                <span className="text-xs font-bold text-emerald-700">Sign In →</span>
              </button>

              <button
                onClick={() => {
                  setShowRoleModal(false);
                  router.push("/login");
                }}
                className="w-full bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 p-4 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700 block">
                    🚚 Delivery Operations
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Route manifests, packing & doorstep drops</span>
                </div>
                <span className="text-xs font-bold text-blue-700">Sign In →</span>
              </button>

              <button
                onClick={() => {
                  setShowRoleModal(false);
                  router.push("/login");
                }}
                className="w-full bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 p-4 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 block">
                    ⚙️ Admin Operations
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Inventory ceilings, zones & global management</span>
                </div>
                <span className="text-xs font-bold text-amber-700">Sign In →</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                New customer?{" "}
                <Link
                  href="/register"
                  onClick={() => setShowRoleModal(false)}
                  className="text-emerald-700 hover:underline font-bold"
                >
                  Create New Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}