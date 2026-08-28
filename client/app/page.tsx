"use client";

import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { useCart, ProductType } from "../context/CartContext";
import axios from "axios";

export default function Home() {
  const { cart, addToCart, updateQuantity, toggleCart } = useCart();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Pincode Serviceability State
  const [pincodeInput, setPincodeInput] = useState("804401");
  const [serviceabilityResult, setServiceabilityResult] = useState<any>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  useEffect(() => {
    fetchProducts();
    checkPincode("804401");
  }, []);


  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/products");
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch catalog products", err);
    } finally {
      setLoading(false);
    }
  };

  const checkPincode = async (pincode: string) => {
    if (!pincode.trim()) return;
    setCheckingPincode(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/zones/serviceability/${pincode.trim()}`
      );
      setServiceabilityResult(data);
    } catch (err) {
      setServiceabilityResult({
        serviceable: false,
        message: "Failed to verify pincode serviceability",
      });
    } finally {
      setCheckingPincode(false);
    }
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkPincode(pincodeInput);
  };

  const getItemQuantityInCart = (productId: string) => {
    const item = cart.find((i) => i.product._id === productId);
    return item ? item.quantity : 0;
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell activeTab="catalog" title="Customer Catalog & Storefront">
      {/* 1. CUTOFF DEADLINE & SERVICEABILITY BANNER */}
      <div className="mb-6 space-y-3">
        {/* Cutoff Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-slate-900 text-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 text-slate-900 p-2.5 rounded-xl text-xl font-bold animate-pulse">
              ⚡
            </div>
            <div>
              <p className="font-extrabold text-sm sm:text-base">
                Same-Night Harvest & 7:00 AM Doorstep Delivery Guaranteed
              </p>
              <p className="text-xs text-emerald-200 mt-0.5">
                Place order before <strong className="text-amber-300">9:30 PM cutoff</strong> to include in tonight's fresh harvest dispatch batch.
              </p>
            </div>
          </div>

          <button
            onClick={toggleCart}
            className="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center justify-center gap-2"
          >
            <span>🛒</span> View Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
          </button>
        </div>

        {/* Serviceability Checker Bar */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-base">📍</span>
            <span className="font-bold text-slate-700">Check Delivery Serviceability:</span>
            {serviceabilityResult && (
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  serviceabilityResult.serviceable
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {serviceabilityResult.serviceable ? "SERVICEABLE" : "NOT SERVICEABLE"}
              </span>
            )}
          </div>

          <form onSubmit={handlePincodeSubmit} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value)}
              placeholder="Enter Pincode (e.g. 804401 or 800001)"

              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-600 outline-none w-full sm:w-44"
            />
            <button
              type="submit"
              disabled={checkingPincode}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
            >
              {checkingPincode ? "Checking..." : "Verify"}
            </button>
          </form>
        </div>
      </div>

      {/* 2. CATEGORY FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-6 border-b border-slate-200 gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {["All", "VEGETABLE", "DAIRY", "FRUIT", "OTHER"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat === "All" && "🌿 "}
              {cat === "VEGETABLE" && "🥦 "}
              {cat === "DAIRY" && "🥛 "}
              {cat === "FRUIT" && "🍎 "}
              {cat === "OTHER" && "✨ "}
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search organic produce..."
            className="w-full px-3.5 py-1.5 text-xs rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
          />
        </div>
      </div>

      {/* 3. PRODUCT CATALOG GRID */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-semibold">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
          <p>Loading fresh organic catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <div className="text-4xl mb-2">🌾</div>
          <p className="font-bold text-slate-700">No organic products found</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const qtyInCart = getItemQuantityInCart(product._id);

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                {/* Product Image & Badges */}
                <div className="relative">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-emerald-50 flex items-center justify-center text-4xl">
                      🥦
                    </div>
                  )}

                  {/* Today's Harvest Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.isAvailableToday ? (
                      <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        HARVEST AVAILABLE TODAY
                      </span>
                    ) : (
                      <span className="bg-amber-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm">
                        OUT OF STOCK TODAY
                      </span>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-slate-900/80 backdrop-blur-sm text-white font-bold text-[10px] px-2 py-0.5 rounded-md uppercase">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {product.description || "100% organic, pesticide-free fresh farm harvest."}
                    </p>
                  </div>

                  {/* Pricing & Stock Ceiling */}
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
                    <div>
                      <span className="text-lg font-black text-emerald-800">₹{product.price}</span>
                      <span className="text-xs text-slate-500 font-semibold"> / {product.unit}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold block">Daily Harvest Limit</span>
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        Max {product.dailyStockCeiling} {product.unit}/day
                      </span>
                    </div>
                  </div>

                  {/* Substitute Item Indicator */}
                  {product.substituteProductId && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2 rounded-lg text-[11px]">
                      <span className="font-bold">↳ Supply Fallback:</span>{" "}
                      {product.substituteProductId.name} (₹{product.substituteProductId.price}/{product.substituteProductId.unit})
                    </div>
                  )}

                  {/* Add / Quantity Buttons */}
                  <div className="pt-2">
                    {!product.isAvailableToday ? (
                      <button
                        disabled
                        className="w-full bg-slate-200 text-slate-500 font-bold text-xs py-2.5 rounded-xl cursor-not-allowed"
                      >
                        Unavailable Today
                      </button>
                    ) : qtyInCart === 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addToCart(product, 1, false)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition shadow-sm flex items-center justify-center gap-1"
                        >
                          <span>🛒</span> Buy Once
                        </button>

                        {product.isSubscriptionEligible ? (
                          <button
                            onClick={() => addToCart(product, 1, true)}
                            className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1"
                          >
                            <span>⚡</span> Subs (5% Off)
                          </button>
                        ) : (
                          <button
                            onClick={() => addToCart(product, 1, false)}
                            className="border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs py-2.5 px-2 rounded-xl transition"
                          >
                            Add Item
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-1.5">
                        <button
                          onClick={() => updateQuantity(product._id, qtyInCart - 1)}
                          className="w-8 h-8 rounded-lg bg-white text-slate-800 font-bold hover:bg-slate-200 transition shadow-sm text-sm"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-emerald-900 text-xs">
                          {qtyInCart} in cart
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, qtyInCart + 1)}
                          className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition shadow-sm text-sm"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}