"use client";

import React, { useState } from "react";
import axios from "axios";

interface MockPaymentModalProps {
  orderId: string;
  amount: number;
  onSuccess: (transaction: any) => void;
  onClose: () => void;
}

export default function MockPaymentModal({
  orderId,
  amount,
  onSuccess,
  onClose,
}: MockPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<
    "MOCK_UPI" | "MOCK_CARD" | "MOCK_NET_BANKING" | "MOCK_WALLET"
  >("MOCK_UPI");
  const [processing, setProcessing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleProcessPayment = async (simulateFailure: boolean = false) => {
    setProcessing(true);
    setErrorMessage("");
    setSyncResult(null);

    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.post(
        "http://localhost:5000/api/payments/process-checkout",
        {
          orderId,
          amount,
          paymentMethod,
          simulateFailure,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSyncResult(data);
      setTimeout(() => {
        onSuccess(data.transaction);
      }, 1500);
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData && errData.gatewayResponse) {
        setSyncResult(errData);
        setErrorMessage(errData.message || "Simulated payment failed");
      } else {
        setErrorMessage(errData?.message || "Failed to process mock payment");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Phase 13 — Simulated Integration
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <span>💳</span> FarmFresh Mock Payment Gateway
            </h3>
            <p className="text-[11px] text-slate-500">
              Simulates real-time payment gateway request/response payload settlement & DB synchronization.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-base p-1"
          >
            ✕
          </button>
        </div>

        {/* Order Amount Hero Summary */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 rounded-2xl flex justify-between items-center shadow-md">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase">Order Reference</span>
            <p className="font-mono font-bold text-emerald-400 text-xs mt-0.5">
              #{String(orderId).substring(String(orderId).length - 6).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase">Total Amount Due</span>
            <p className="font-black text-white text-2xl">₹{amount.toFixed(2)}</p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl">
            ❌ {errorMessage}
          </div>
        )}

        {/* Payment Method Selector */}
        <div className="space-y-2">
          <label className="block text-slate-700 font-bold">Select Simulated Payment Method *</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "MOCK_UPI", name: "📲 MOCK UPI / QR Code", desc: "Google Pay / PhonePe / BHIM" },
              { id: "MOCK_CARD", name: "💳 MOCK Credit / Debit Card", desc: "Visa / MasterCard / RuPay" },
              { id: "MOCK_NET_BANKING", name: "🏦 MOCK Net Banking", desc: "HDFC / ICICI / SBI" },
              { id: "MOCK_WALLET", name: "👛 Prepaid Wallet Credit", desc: "FarmFresh Wallet Credits" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id as any)}
                className={`p-3 rounded-xl border text-left transition ${
                  paymentMethod === m.id
                    ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-slate-900"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <p className="font-extrabold text-xs">{m.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Action Triggers */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            disabled={processing}
            onClick={() => handleProcessPayment(false)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition shadow-md text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{processing ? "Settling Gateway Payload..." : "Simulate Successful Payment ✅"}</span>
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={() => handleProcessPayment(true)}
            className="bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 px-4 py-3 rounded-xl transition text-xs disabled:opacity-50"
          >
            Simulate Payment Failure ❌
          </button>
        </div>

        {/* Real-time Gateway API Request / Response Inspector */}
        {syncResult && (
          <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-[10px] space-y-2 border border-slate-800 shadow-inner overflow-x-auto">
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-bold text-white">🔄 MOCK GATEWAY DB SYNC LOG</span>
              <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[9px]">
                Status: {syncResult.gatewayResponse?.status || (syncResult.success ? "SUCCESS" : "FAILED")}
              </span>
            </div>

            <div>
              <p className="text-slate-400 font-bold">API REQUEST PAYLOAD:</p>
              <pre className="text-slate-300 mt-1 whitespace-pre-wrap">
                {JSON.stringify(syncResult.requestPayload, null, 2)}
              </pre>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <p className="text-slate-400 font-bold">API RESPONSE & DB SYNC CONFIRMATION:</p>
              <pre className="text-emerald-300 mt-1 whitespace-pre-wrap">
                {JSON.stringify(syncResult.gatewayResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
