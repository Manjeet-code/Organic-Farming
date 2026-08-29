"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth, API_BASE_URL } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, subtotal, totalItems } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [checkoutStep, setCheckoutStep] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 00003");
  const [address, setAddress] = useState(user?.address || "Main Market Road, Arwal, Bihar");
  const [pincode, setPincode] = useState(user?.pincode || "804401");

  const [orderType, setOrderType] = useState<"One-Time" | "Weekly-Subscription">("One-Time");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [useWalletCredit, setUseWalletCredit] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  React.useEffect(() => {
    if (user && isCartOpen) {
      fetchWalletBalance();
    }
  }, [user, isCartOpen]);

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem("farmfresh_token");
      if (!token) return;
      const { data } = await axios.get(`${API_BASE_URL}/api/issues/my-issues`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletBalance(data.walletBalance || 0);
    } catch (e) {
      console.log("Could not fetch wallet balance");
    }
  };

  if (!isCartOpen) return null;


  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacingOrder(true);
    setCheckoutError("");

    try {
      let finalAmount = subtotal;

      if (useWalletCredit && walletBalance > 0) {
        const creditToApply = Math.min(subtotal, walletBalance);
        const token = localStorage.getItem("farmfresh_token");
        await axios.post(
          `${API_BASE_URL}/api/issues/apply-wallet`,
          { amountToDeduct: creditToApply },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        finalAmount = Math.max(0, subtotal - creditToApply);
      }

      if (orderType === "Weekly-Subscription") {
        // Create Subscription Plan
        const subPayload = {
          items: cart.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
          })),
          frequency: "WEEKLY",
          deliveryDays: ["Monday", "Wednesday", "Friday"],
          address,
          pincode,
          phone,
        };

        const config = user ? { headers: { Authorization: `Bearer ${localStorage.getItem("farmfresh_token")}` } } : {};
        await axios.post(`${API_BASE_URL}/api/subscriptions`, subPayload, config);
        await axios.post(`${API_BASE_URL}/api/subscriptions/generate-daily-orders`, {}, config);

        alert("✅ Weekly Organic Subscription Plan created successfully! First delivery arrives tomorrow at 7:00 AM.");
      } else {
        // Create One-Time Order
        const orderPayload = {
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          pincode: pincode.trim(),
          user: user ? user._id : null,
          products: cart.map((item) => ({
            product: item.product._id,
            name: item.product.name,
            qty: item.quantity,
            price: item.product.price,
            unit: item.product.unit,
          })),
          totalAmount: Math.round(finalAmount),
          orderType: "One-Time",
        };

        await axios.post(`${API_BASE_URL}/api/orders`, orderPayload);
        alert(`✅ Order placed successfully! Total Amount: ₹${Math.round(finalAmount)}. Scheduled for 7:00 AM delivery.`);
      }

      clearCart();
      setCheckoutStep(false);
      setIsCartOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      setCheckoutError(err.response?.data?.message || "Failed to place order. Check pincode serviceability.");
    } finally {
      setPlacingOrder(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          setIsCartOpen(false);
          setCheckoutStep(false);
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛒</span>
              <h2 className="text-lg font-bold">
                {checkoutStep ? "Morning Delivery Checkout" : "Your Morning Harvest Cart"}
              </h2>
              {!checkoutStep && (
                <span className="bg-emerald-500 text-slate-900 font-black text-xs px-2 py-0.5 rounded-full">
                  {totalItems} items
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setCheckoutStep(false);
              }}
              className="text-slate-400 hover:text-white p-1 font-bold text-lg"
            >
              ✕
            </button>
          </div>

          {/* Serviceability & Cutoff Banner */}
          <div className="bg-emerald-50 border-b border-emerald-100 p-3 text-xs text-emerald-900 flex items-start gap-2">
            <span className="text-base leading-none">⚡</span>
            <div>
              <p className="font-bold">7:00 AM Doorstep Delivery Guaranteed</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Place order before <strong>9:30 PM cutoff</strong> to include in tonight's same-night harvest dispatch.
              </p>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {checkoutStep ? (
              /* CHECKOUT FORM VIEW */
              <div className="space-y-4 text-xs">
                <button
                  onClick={() => setCheckoutStep(false)}
                  className="text-emerald-700 font-bold hover:underline mb-2 block"
                >
                  ← Back to Cart Summary
                </button>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-900">Order Summary ({totalItems} items)</p>
                  <p className="text-emerald-700 font-extrabold text-sm mt-0.5">Total: ₹{subtotal.toFixed(2)}</p>
                </div>

                {checkoutError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-bold">
                    {checkoutError}
                  </div>
                )}

                <form onSubmit={handlePlaceOrder} className="space-y-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Delivery Address *</label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Pincode (Zone Routing) *</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 text-slate-900 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Must match an active Bihar delivery route (e.g., 804401, 800001, 824101, 823001).</p>

                  </div>

                  {walletBalance > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-bold text-emerald-900">Apply Wallet Credit (₹{walletBalance.toFixed(2)})</p>
                        <p className="text-[10px] text-emerald-700">Deduct refund credits from order total</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={useWalletCredit}
                        onChange={(e) => setUseWalletCredit(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Order Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderType("One-Time")}
                        className={`p-2 rounded-lg border font-bold text-center transition ${
                          orderType === "One-Time"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}
                      >
                        Buy Once (7 AM)
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType("Weekly-Subscription")}
                        className={`p-2 rounded-lg border font-bold text-center transition ${
                          orderType === "Weekly-Subscription"
                            ? "bg-emerald-700 text-white border-emerald-700"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}
                      >
                        Weekly Subs (5% Off)
                      </button>
                    </div>
                  </div>


                  <button
                    type="submit"
                    disabled={placingOrder}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition shadow-md text-xs uppercase tracking-wider disabled:opacity-50 mt-4"
                  >
                    {placingOrder ? "Confirming Order..." : "Confirm & Place Morning Order"}
                  </button>
                </form>
              </div>
            ) : (
              /* CART ITEMS LIST VIEW */
              <div className="divide-y divide-slate-100 space-y-4">
                {cart.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <div className="text-4xl mb-3">🧺</div>
                    <p className="font-bold text-slate-700">Your cart is currently empty</p>
                    <p className="text-xs text-slate-500 mt-1">Browse our organic produce catalog and add fresh items!</p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const itemPrice = item.isSubscriptionItem
                      ? item.product.price * (1 - (item.product.subscriptionDiscount || 5) / 100)
                      : item.product.price;
                    const lineTotal = itemPrice * item.quantity;

                    return (
                      <div key={item.product._id} className="pt-4 first:pt-0 flex gap-3 items-center">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shrink-0">
                            🥦
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">{item.product.name}</p>
                          <p className="text-[11px] text-slate-500">
                            ₹{itemPrice} / {item.product.unit}
                          </p>

                          {item.product.substituteProductId && (
                            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
                              Sub: {item.product.substituteProductId.name}
                            </p>
                          )}

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                className="px-2 py-0.5 text-slate-700 hover:bg-slate-200 rounded-l-lg"
                              >
                                -
                              </button>
                              <span className="px-2.5 text-slate-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                className="px-2 py-0.5 text-slate-700 hover:bg-slate-200 rounded-r-lg"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product._id)}
                              className="text-slate-400 hover:text-red-600 text-xs transition"
                              title="Remove item"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-black text-slate-900 text-sm">₹{lineTotal.toFixed(2)}</p>
                          {item.isSubscriptionItem && (
                            <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                              Sub Disc
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Footer & Checkout Call to Action */}
          {!checkoutStep && cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Morning Dispatch SLA</span>
                <span className="font-bold text-amber-700">04:30 AM Logistics Batch</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-900">Total Subtotal</span>
                <span className="font-black text-emerald-700 text-lg">₹{subtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setCheckoutStep(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <span>Proceed to Morning Delivery Checkout</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

