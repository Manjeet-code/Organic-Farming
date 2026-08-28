"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">Privacy Policy</h1>
            <p className="text-slate-500 mb-10 text-lg">Last updated: August 2026</p>
            
            <div className="space-y-8 text-slate-700 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
                <p>
                  We collect information that you provide directly to us when you create an account, subscribe to our delivery services, or contact our customer support. This includes your name, email address, phone number, delivery address, and payment information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Process and deliver your organic product orders</li>
                  <li>Manage your weekly/daily subscriptions</li>
                  <li>Send you delivery updates and notifications</li>
                  <li>Respond to your comments and questions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Data Security</h2>
                <p>
                  We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. Your payment data is securely processed by our authorized payment partners.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at support@agroorganic.com or via our WhatsApp support line.
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
