"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";

export default function LandingPage() {
  const router = useRouter();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const offerings = [
    {
      title: "Organic Vegetables",
      desc: "Pure, fresh & 100% chemical-free leafy greens, tomatoes, root vegetables harvested same-night.",
      badge: "Pure | Fresh | Chemical Free",
      icon: "🥦",
      color: "from-emerald-500/20 to-teal-500/10",
      borderColor: "border-emerald-500/30",
    },
    {
      title: "Pure A2 Dairy Products",
      desc: "Fresh unprocessed A2 Gir cow milk, handcrafted organic paneer, and Bilona-method Vedic ghee.",
      badge: "Fresh Milk | Curd | Ghee",
      icon: "🥛",
      color: "from-amber-500/20 to-yellow-500/10",
      borderColor: "border-amber-500/30",
    },
    {
      title: "Nutrient-Rich Vermicompost",
      desc: "High-grade 100% organic soil conditioner and plant booster rich in earthworm microbes & nutrients.",
      badge: "Rich Nutrients | 100% Organic",
      icon: "🪱",
      color: "from-stone-500/20 to-amber-900/10",
      borderColor: "border-stone-500/30",
    },
    {
      title: "Natural Farm Produce",
      desc: "Naturally grown farm essentials including unpolished pulses, pure turmeric, and cold-pressed oilseeds.",
      badge: "Pure Turmeric | Pulses | Oilseeds",
      icon: "🌾",
      color: "from-yellow-500/20 to-orange-500/10",
      borderColor: "border-yellow-500/30",
    },
    {
      title: "Fresh Farm Fruits",
      desc: "Naturally ripened, pesticide-free fresh farm fruits including organic guava, papaya, and seasonal treats.",
      badge: "Guava | Papaya & Seasonal",
      icon: "🍎",
      color: "from-red-500/20 to-rose-500/10",
      borderColor: "border-red-500/30",
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 p-0.5 shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <img
                src="/icon.png"
                alt="The Farm Brothers Logo"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors block leading-none">
                THE FARM BROTHERS
              </span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wide block mt-1">
                From Our Farm For Your Family
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#offerings" className="hover:text-emerald-400 transition">Our Offerings</a>
            <a href="#why-us" className="hover:text-emerald-400 transition">Why Choose Us</a>
            <a href="#farm-story" className="hover:text-emerald-400 transition">Farm Location</a>
            <Link href="/storefront" className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 font-extrabold">
              <span>🥦</span> Browse Storefront
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRoleModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <span>🔑</span> Sign In
            </button>

            <Link
              href="/register"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-950/40 flex items-center gap-1.5"
            >
              <span>✨</span> New Customer Register
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/60">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Main Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-inner mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Lal Balram Organic Farm • Arwal, Bihar - 804401
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Growing Good. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Growing Together.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Pure A2 Gir cow dairy, fresh chemical-free organic vegetables, and nutrient-rich vermicompost directly from our family farm to your doorstep by 7:00 AM.
          </p>

          {/* Key Metric Tags */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs font-bold">
            <span className="bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl text-emerald-400 flex items-center gap-1.5">
              <span>🌿</span> 100% Chemical-Free & Organic
            </span>
            <span className="bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl text-amber-400 flex items-center gap-1.5">
              <span>🥛</span> Pure A2 Gir Cow Milk & Ghee
            </span>
            <span className="bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl text-blue-400 flex items-center gap-1.5">
              <span>🚚</span> 9:30 PM Cutoff → 7 AM Delivery
            </span>
          </div>

          {/* Action Callouts */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href="/storefront"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-emerald-950/60 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>🥦</span> Explore Fresh Catalog
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition flex items-center justify-center gap-2"
            >
              <span>🌿</span> Join as New Customer
            </Link>
          </div>

          {/* Quick Sign In Modal Trigger Button */}
          <div className="mt-6">
            <button
              onClick={() => setShowRoleModal(true)}
              className="text-xs text-slate-400 hover:text-emerald-400 underline font-semibold transition"
            >
              Existing Member or Staff? Click here to Sign In (Customer, Delivery Ops, Admin)
            </button>
          </div>
        </div>
      </section>

      {/* 3. OFFERINGS SHOWCASE SECTION */}
      <section id="offerings" className="py-20 bg-slate-900/50 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest block mb-2">
              Direct From Lal Balram Farm
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Our Farm Fresh Produce & Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every item is cultivated with sustainable organic practices and harvested at peak freshness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((item, idx) => (
              <div
                key={idx}
                className={`bg-slate-900/90 border ${item.borderColor} p-6 rounded-3xl backdrop-blur-sm shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-transform`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                      {item.icon}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-2">{item.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400">100% Organic Certified</span>
                  <Link
                    href="/storefront"
                    className="text-xs font-extrabold text-white hover:text-emerald-400 transition flex items-center gap-1"
                  >
                    View Catalog <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US / VALUE PILLARS */}
      <section id="why-us" className="py-20 bg-slate-950 border-b border-slate-800/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-amber-400 text-xs font-black uppercase tracking-widest block mb-2">
              Our Core Promise
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Why Choose The Farm Brothers?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Built on transparency, ethical farming, and guaranteed early morning freshness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/40 transition"
              >
                <span className="text-3xl block mb-3">{p.icon}</span>
                <h4 className="text-base font-extrabold text-white">{p.title}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FARM LOCATION & HELPLINE CARD */}
      <section id="farm-story" className="py-16 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Visit & Contact Us
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Lal Balram Organic Farm, Arwal, Bihar
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Address: Lal Balram Organic Farm, Arwal, Bihar - 804401 <br />
                Helpline Phone: <strong className="text-emerald-400 font-mono">+91 85444 88617</strong> <br />
                Support Email: <strong className="text-emerald-400">hello@thefarmbrothers.com</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition text-center shadow-lg"
              >
                Register as Customer
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl border border-slate-700 transition text-center"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <Footer />

      {/* 7. QUICK ROLE LOGIN MODAL */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base">Select Portal Sign In Option</h3>
                <p className="text-xs text-slate-400">Choose your account role to proceed</p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
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
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-extrabold text-sm text-white group-hover:text-emerald-400 block">
                    🛒 Customer Portal
                  </span>
                  <span className="text-[11px] text-slate-400">Order fresh produce, subscriptions & wallet</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">Sign In →</span>
              </button>

              <button
                onClick={() => {
                  setShowRoleModal(false);
                  router.push("/login");
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-extrabold text-sm text-white group-hover:text-blue-400 block">
                    🚚 Delivery Operations
                  </span>
                  <span className="text-[11px] text-slate-400">Route manifests, packing & doorstep drops</span>
                </div>
                <span className="text-xs font-bold text-blue-400">Sign In →</span>
              </button>

              <button
                onClick={() => {
                  setShowRoleModal(false);
                  router.push("/login");
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl text-left transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-extrabold text-sm text-white group-hover:text-amber-400 block">
                    ⚙️ Admin Operations
                  </span>
                  <span className="text-[11px] text-slate-400">Inventory ceilings, zones & global management</span>
                </div>
                <span className="text-xs font-bold text-amber-400">Sign In →</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                New customer?{" "}
                <Link
                  href="/register"
                  onClick={() => setShowRoleModal(false)}
                  className="text-emerald-400 hover:underline font-bold"
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