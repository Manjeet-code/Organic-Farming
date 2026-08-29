"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function TermsOfService() {
  return (
    <>
      <Navbar
        cartCount={0}
        wishlistCount={0}
        openCart={() => {}}
        openWishlist={() => {}}
        onCategorySelect={() => {}}
      />
      
      <main className="pt-32 pb-24 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-slate-100">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">Terms of Service</h1>
            <p className="text-slate-500 mb-10 text-lg">Last updated: August 2026</p>
            
            <div className="space-y-8 text-slate-700 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
                <p>
                  By accessing or using The Farm Brothers' website and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Subscriptions & Deliveries</h2>
                <p>
                  Our subscription service provides daily or weekly deliveries of fresh organic produce.
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Deliveries are typically made between 5:00 AM and 7:00 AM.</li>
                  <li>Subscriptions can be paused or modified via your dashboard.</li>
                  <li>Any changes to the next day's delivery must be made before 8:00 PM.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Quality Guarantee</h2>
                <p>
                  We guarantee the freshness of our products. If you are unsatisfied with the quality of any item, please contact our support team within 12 hours of delivery for a replacement or refund.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Modifications</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any significant changes via email or an announcement on our website.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
