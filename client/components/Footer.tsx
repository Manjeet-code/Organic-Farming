import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 text-white pt-24 pb-12 overflow-hidden border-t border-slate-900">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Newsletter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-16 border-b border-slate-800/60 mb-16">
          <div className="max-w-lg text-center md:text-left">
            <h3 className="text-3xl font-black mb-3">Get 10% off your first order</h3>
            <p className="text-slate-400">Join our newsletter for exclusive offers, farming stories, and fresh arrivals.</p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-slate-900/50 border border-slate-700/50 rounded-full px-6 py-4 w-full sm:w-80 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors placeholder-slate-500"
            />
            <button className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_25px_rgba(22,163,74,0.5)]">
              Subscribe
            </button>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 md:col-span-2 space-y-6 pr-0 md:pr-10">
            <Logo href="/" size="lg" isDark={true} />
            <p className="text-slate-400 leading-relaxed text-sm">
              Growing Good. Growing Together. Bringing farm-fresh A2 dairy, 100% organic produce, vermicompost, and natural spices directly from Lal Balram Organic Farm to your doorstep.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 pt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-green-600 hover:border-green-600 hover:-translate-y-1 transition-all text-slate-400 hover:text-white">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-green-600 hover:border-green-600 hover:-translate-y-1 transition-all text-slate-400 hover:text-white">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-green-600 hover:border-green-600 hover:-translate-y-1 transition-all text-slate-400 hover:text-white">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide">Shop</h3>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-green-400 hover:translate-x-1 inline-block transition-transform">Dairy & A2 Milk</a></li>
              <li><a href="#" className="hover:text-green-400 hover:translate-x-1 inline-block transition-transform">Fresh Vegetables</a></li>
              <li><a href="#" className="hover:text-green-400 hover:translate-x-1 inline-block transition-transform">Vermicompost</a></li>
              <li><a href="#" className="hover:text-green-400 hover:translate-x-1 inline-block transition-transform">Natural Produce</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide">Company</h3>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-green-400 hover:translate-x-1 inline-block transition-transform">Our Farm Story</a></li>
              <li><a href="#" className="hover:text-green-400 hover:translate-x-1 inline-block transition-transform">Partner Farmers</a></li>
              <li><a href="#" className="hover:text-green-400 hover:translate-x-1 inline-block transition-transform">Sustainable Practices</a></li>
              <li><a href="#" className="hover:text-green-400 hover:translate-x-1 inline-block transition-transform">Press & Media</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide">Contact Us</h3>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">📍</span> 
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Lal+Balram+Organic+Farm+Rojapar+Arwal+Bihar+804401"
                  target="_blank"
                  rel="noreferrer"
                  className="leading-relaxed hover:text-emerald-400 underline transition-colors"
                >
                  Lal Balram Organic Farm, <br/>Rojapar, Arwal, Bihar - 804401 <br/>
                  <span className="text-xs font-bold text-amber-400">Open on Google Maps ↗</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500">📞</span> 
                <span>+91 85444 88617</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500">✉️</span> 
                <span>hello@thefarmbrothers.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4">
          <p>© 2026 The Farm Brothers. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
            <a href="#" className="hover:text-white transition-colors">Shipping Info</a>
          </div>
        </div>
      </div>
    </footer>
  );
}