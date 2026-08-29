"use client";

import { useEffect, useState } from "react";
import { useAuth, API_BASE_URL } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import AppShell from "../../components/AppShell";
import MockPaymentModal from "../../components/MockPaymentModal";

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders"); // orders, subscriptions, profile

  // Phase 13 Mock Payment Gateway State
  const [paymentModalOrder, setPaymentModalOrder] = useState<any>(null);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderMsg, setOrderMsg] = useState("");


  // Subscriptions State (Phase 6)
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [subMsg, setSubMsg] = useState("");
  const [skipDateInput, setSkipDateInput] = useState("");

  // Profile State
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [pincode, setPincode] = useState(user?.pincode || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Delivery Ops Queue & Fulfillment Handlers (Phase 8)
  const [opsTab, setOpsTab] = useState("overview");
  const [opsQueue, setOpsQueue] = useState<any>(null);
  const [loadingOpsQueue, setLoadingOpsQueue] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [fulfillmentMsg, setFulfillmentMsg] = useState("");

  // Delivery Ops Filters for Dispatch Manager & Quality Reports
  const [dispatchStatusFilter, setDispatchStatusFilter] = useState("ALL");
  const [dispatchSearchTerm, setDispatchSearchTerm] = useState("");
  const [issueStatusFilter, setIssueStatusFilter] = useState("ALL");
  const [issueSearchTerm, setIssueSearchTerm] = useState("");

  // Delivery-Ops Mobile Field Mode & Doorstep Proof State (Phase 14)
  const [mobileFieldMode, setMobileFieldMode] = useState(false);
  const [doorstepPhotoMap, setDoorstepPhotoMap] = useState<{ [orderId: string]: string }>({});
  const [doorstepRemarksMap, setDoorstepRemarksMap] = useState<{ [orderId: string]: string }>({});
  const [viewDoorstepPhotoUrl, setViewDoorstepPhotoUrl] = useState<string | null>(null);



  // Quality Claims & Wallet State (Phase 9)
  const [walletBalance, setWalletBalance] = useState(0);
  const [myIssues, setMyIssues] = useState<any[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [claimMsg, setClaimMsg] = useState("");


  // Report Issue Modal & Photo Viewer State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportOrderId, setReportOrderId] = useState("");
  const [reportProductName, setReportProductName] = useState("");
  const [reportIssueType, setReportIssueType] = useState("SPOILED_PRODUCE");
  const [reportDesc, setReportDesc] = useState("");
  const [reportPhoto, setReportPhoto] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    setPhone(user.phone || "");
    setAddress(user.address || "");
    setPincode(user.pincode || "");

    if (user.role === "delivery_ops" || user.role === "delivery-ops") {
      fetchOpsQueue();
    } else if (user.role === "customer") {
      fetchOrders();
      fetchSubscriptions();
      fetchQualityClaimsAndWallet();
    }
  }, [user, router, selectedCategory]);

  const fetchQualityClaimsAndWallet = async () => {
    const token = localStorage.getItem("farmfresh_token");
    if (!token) return;

    setLoadingClaims(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/issues/my-issues`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletBalance(data.walletBalance || 0);
      setMyIssues(data.issues || []);
      setWalletTransactions(data.transactions || []);
    } catch (e) {
      console.log("Failed to fetch quality claims");
    } finally {
      setLoadingClaims(false);
    }
  };


  const openReportModal = (orderId: string, defaultProdName: string) => {
    setReportOrderId(orderId);
    setReportProductName(defaultProdName || "Farm Organic Produce");
    setReportIssueType("SPOILED_PRODUCE");
    setReportDesc("");
    setReportPhoto("https://images.unsplash.com/photo-1550583724-b2692b85b150");
    setShowReportModal(true);
  };

  const handleSubmitQualityClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    setClaimMsg("");

    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.post(
        `${API_BASE_URL}/api/issues`,
        {
          orderId: reportOrderId,
          productName: reportProductName,
          issueType: reportIssueType,
          description: reportDesc,
          photoUrl: reportPhoto,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClaimMsg(`✅ ${data.message}`);
      setShowReportModal(false);
      fetchQualityClaimsAndWallet();
    } catch (err: any) {
      setClaimMsg("❌ Failed to submit quality claim");
    } finally {
      setSubmittingReport(false);
    }
  };


  const fetchOpsQueue = async () => {
    setLoadingOpsQueue(true);
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.get(
        `${API_BASE_URL}/api/dispatch/my-zone-queue?category=${selectedCategory}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpsQueue(data);

      // Fetch quality defect claims for Ops Quality Reports tab
      const issuesRes = await axios.get(`${API_BASE_URL}/api/issues/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyIssues(issuesRes.data || []);
    } catch (error) {
      console.log("Failed to fetch Ops queue or issues");
    } finally {
      setLoadingOpsQueue(false);
    }
  };


  const handleCutoffLock = async (orderId: string) => {
    setFulfillmentMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `${API_BASE_URL}/api/fulfillment/orders/${orderId}/cutoff-lock`,
        { remarks: "9:30 PM cutoff locked for tonight harvest & packing batch" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFulfillmentMsg(`✅ ${data.message}`);
      fetchOpsQueue();
    } catch (err: any) {
      setFulfillmentMsg("❌ Failed to lock cutoff stage");
    }
  };

  const handleItemFulfillment = async (orderId: string, itemIndex: number, fulfillmentStatus: string) => {
    setFulfillmentMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `${API_BASE_URL}/api/fulfillment/orders/${orderId}/items/${itemIndex}`,
        { fulfillmentStatus, remarks: `Marked ${fulfillmentStatus} by ops staff` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFulfillmentMsg(`✅ ${data.message}`);
      fetchOpsQueue();
    } catch (err: any) {
      setFulfillmentMsg("❌ Failed to update item status");
    }
  };

  const handleApplySubstitution = async (orderId: string, itemIndex: number) => {
    setFulfillmentMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.post(
        `${API_BASE_URL}/api/fulfillment/orders/${orderId}/substitute`,
        { itemIndex, remarks: "Original produce out of stock, substitute applied" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFulfillmentMsg(`✅ Substituted: ${data.substituteName}`);
      fetchOpsQueue();
    } catch (err: any) {
      setFulfillmentMsg("❌ Failed to apply substitution");
    }
  };

  const handleDispatchOrder = async (orderId: string) => {
    setFulfillmentMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `${API_BASE_URL}/api/fulfillment/orders/${orderId}/dispatch`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFulfillmentMsg(`✅ ${data.message}`);
      fetchOpsQueue();
    } catch (err: any) {
      setFulfillmentMsg("❌ Failed to dispatch order");
    }
  };

  const handleDoorstepPhotoUpload = (orderId: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDoorstepPhotoMap((prev) => ({ ...prev, [orderId]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleMarkDeliveredWithProof = async (orderId: string) => {
    const photo = doorstepPhotoMap[orderId] || "";
    const remarks = doorstepRemarksMap[orderId] || "Doorstep delivery completed";
    setFulfillmentMsg("");

    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `${API_BASE_URL}/api/fulfillment/orders/${orderId}/deliver`,
        { deliveryProofPhoto: photo, deliveryProofRemarks: remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFulfillmentMsg(`✅ ${data.message} ${data.isOnTimeDelivery ? "(On-Time 7 AM)" : ""}`);
      fetchOpsQueue();
      fetchOrders();
    } catch (err: any) {
      setFulfillmentMsg("❌ Failed to complete delivery");
    }
  };

  const handleDeliverOrder = async (orderId: string) => {

    setFulfillmentMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `${API_BASE_URL}/api/fulfillment/orders/${orderId}/deliver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFulfillmentMsg(`✅ ${data.message}`);
      fetchOpsQueue();
    } catch (err: any) {
      setFulfillmentMsg("❌ Failed to complete delivery");
    }
  };

  const handleFailedDelivery = async (orderId: string) => {
    const reason = prompt("Enter failure reason (e.g. Customer unavailable / Gate locked):", "Customer unavailable / Gate locked");
    if (!reason) return;

    setFulfillmentMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `${API_BASE_URL}/api/fulfillment/orders/${orderId}/failed`,
        { failureReason: reason, reattemptScheduled: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFulfillmentMsg(`⚠️ ${data.message}`);
      fetchOpsQueue();
    } catch (err: any) {
      setFulfillmentMsg("❌ Failed to record failed delivery");
    }
  };



  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/orders/my-orders`);
      setOrders(data);
    } catch (error) {
      console.log("No orders found");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchSubscriptions = async () => {
    setLoadingSubs(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/subscriptions/my-subscriptions`);
      setSubscriptions(data);
    } catch (error) {
      console.log("No subscriptions found");
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setOrderMsg("");
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/cancel`);
      setOrderMsg("✅ Order cancelled successfully before 9:30 PM cutoff.");
      fetchOrders();
    } catch (err: any) {
      setOrderMsg(`❌ ${err.response?.data?.message || "Failed to cancel order"}`);
    }
  };

  const handlePauseSub = async (subId: string) => {
    setSubMsg("");
    try {
      await axios.put(`${API_BASE_URL}/api/subscriptions/${subId}/pause`);
      setSubMsg("✅ Subscription pause state toggled successfully!");
      fetchSubscriptions();
    } catch (err: any) {
      setSubMsg("❌ Failed to toggle subscription status.");
    }
  };

  const handleSkipDay = async (subId: string) => {
    if (!skipDateInput.trim()) return;
    setSubMsg("");
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/subscriptions/${subId}/skip-day`, {
        dateString: skipDateInput.trim(),
      });
      setSubMsg(`✅ ${data.message}`);
      setSkipDateInput("");
      fetchSubscriptions();
    } catch (err: any) {
      setSubMsg("❌ Failed to activate Vacation Mode skip date.");
    }
  };

  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      setProfileMsg("❌ Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    setProfileMsg("📡 Detecting your live GPS location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.address) {
            const road = data.address.road || data.address.suburb || data.address.neighbourhood || data.address.residential || "";
            const city = data.address.city || data.address.town || data.address.village || data.address.county || "";
            const state = data.address.state || "";
            const postcode = data.address.postcode || "";

            const formattedAddress = [road, city, state].filter(Boolean).join(", ");

            if (formattedAddress) {
              setAddress(formattedAddress);
            }
            if (postcode) {
              const match = postcode.match(/\d{6}/);
              setPincode(match ? match[0] : postcode);
            }

            setProfileMsg(`✅ Live GPS location detected! Address & Pincode auto-filled.`);
          } else {
            setProfileMsg(`✅ Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)} detected.`);
          }
        } catch (err) {
          setProfileMsg(`✅ GPS Coordinates: Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}.`);
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setProfileMsg("❌ Location permission denied. Please allow location access in browser settings.");
        } else {
          setProfileMsg("❌ Unable to retrieve your live GPS location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");

    try {
      const { data } = await axios.put(`${API_BASE_URL}/api/auth/profile`, {
        phone,
        address,
        pincode,
      });

      updateUser(data);
      setProfileMsg("✅ Profile updated successfully!");
    } catch (err: any) {
      setProfileMsg("❌ Failed to update profile details.");
    } finally {
      setSavingProfile(false);
    }
  };


  if (!user) return null;

  // Delivery-Ops Custom View (Phase 7 & Phase 9)
  if (user.role === "delivery_ops" || user.role === "delivery-ops") {
    return (
      <AppShell activeTab={opsTab} onTabChange={setOpsTab} title="Delivery Operations Dashboard">
        <div className="space-y-6">
          {/* Ops Header Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Assigned Route Queue
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {opsQueue?.zone?.zoneCode || "ZN-BIH-01"}
                </span>
              </div>
              <h1 className="text-2xl font-black mt-1">
                {opsQueue?.zone?.name || "Arwal - Patna Route"}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Staff Assigned: <strong>{user.name}</strong> • City: {opsQueue?.zone?.city || "Arwal / Patna"} • Pincodes: {opsQueue?.zone?.pincodeRanges?.join(", ")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Dispatch Deadline</p>
                  <p className="text-amber-400 font-black text-lg">04:30 AM</p>
                </div>
                <div className="h-8 w-px bg-slate-700"></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Delivery Target</p>
                  <p className="text-emerald-400 font-black text-lg">07:00 AM</p>
                </div>
              </div>

              <button
                onClick={() => setMobileFieldMode(!mobileFieldMode)}
                className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-md ${
                  mobileFieldMode
                    ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                    : "bg-emerald-600 text-white hover:bg-emerald-500"
                }`}
              >
                <span>{mobileFieldMode ? "💻 Switch to Desk Manager Mode" : "📱 Switch to Mobile Field Mode (Phase 14)"}</span>
              </button>
            </div>
          </div>

          {/* PHASE 14: MOBILE FIELD EXPERIENCE VIEW */}
          {mobileFieldMode ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-800 shadow-md flex justify-between items-center">
                <div>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Phase 14 — Mobile Field View
                  </span>
                  <h3 className="text-base font-extrabold mt-1">🚚 Doorstep Drop Sequence</h3>
                  <p className="text-[11px] text-emerald-300">
                    Optimized field interface for doorstep delivery proof photo capture & 7 AM SLA drops.
                  </p>
                </div>
                <span className="text-2xl">📱</span>
              </div>

              {fulfillmentMsg && (
                <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-bold border border-slate-800">
                  {fulfillmentMsg}
                </div>
              )}

              {loadingOpsQueue ? (
                <div className="p-8 text-center text-slate-400 font-bold">Loading delivery stops...</div>
              ) : opsQueue?.orders?.length === 0 ? (
                <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                  <span className="text-3xl block mb-2">🎉</span>
                  <p className="font-bold text-slate-800">No active morning drops pending</p>
                  <p className="text-xs text-slate-400 mt-1">All route orders delivered on time!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {opsQueue?.orders?.map((order: any, idx: number) => (
                    <div key={order._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                          <span className="bg-slate-900 text-white font-mono font-black text-[10px] px-2 py-0.5 rounded">
                            STOP #{idx + 1}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                            {order.customerName}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                            <span>📍</span> {order.address} ({order.pincode})
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : order.status === "Failed Delivery"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Contact & GPS Action Bar */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`tel:${order.phone}`}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs p-2.5 rounded-xl transition text-center flex items-center justify-center gap-1"
                        >
                          <span>📞</span> Call Customer
                        </a>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            order.address + " " + order.pincode
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs p-2.5 rounded-xl transition text-center flex items-center justify-center gap-1"
                        >
                          <span>📍</span> GPS Directions
                        </a>
                      </div>

                      {/* Produce Item Checklist */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <p className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                          Produce Line Items ({order.products?.length || 0})
                        </p>
                        {order.products?.map((item: any, pIdx: number) => (
                          <div key={pIdx} className="flex justify-between items-center text-slate-800 font-medium">
                            <span>• {item.name} ({item.qty} {item.unit})</span>
                            <span className="text-[10px] font-bold bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-600">
                              {item.fulfillmentStatus || "Packed"}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Doorstep Delivery Photo Proof Uploader (Phase 14) */}
                      {order.status !== "Delivered" && (
                        <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl space-y-2">
                          <label className="block text-amber-900 font-bold text-xs">
                            📸 Attach Doorstep Delivery Proof Photo (Phase 14)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleDoorstepPhotoUpload(order._id, e.target.files[0]);
                            }}
                            className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400"
                          />
                          {doorstepPhotoMap[order._id] && (
                            <div className="flex items-center gap-2 pt-1">
                              <img
                                src={doorstepPhotoMap[order._id]}
                                alt="Proof Preview"
                                className="h-12 w-12 object-cover rounded-lg border border-amber-300 shadow-sm"
                              />
                              <span className="text-[11px] text-emerald-800 font-bold">✅ Photo proof attached!</span>
                            </div>
                          )}

                          <input
                            type="text"
                            placeholder="Doorstep remarks (e.g. Left at front porch / Handed to customer)"
                            value={doorstepRemarksMap[order._id] || ""}
                            onChange={(e) => setDoorstepRemarksMap({ ...doorstepRemarksMap, [order._id]: e.target.value })}
                            className="w-full p-2 rounded-lg border border-amber-200 text-xs text-slate-900 outline-none"
                          />
                        </div>
                      )}

                      {/* Display attached photo proof if delivered */}
                      {order.deliveryProofPhoto && (
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={order.deliveryProofPhoto}
                              alt="Doorstep Drop Proof"
                              className="h-10 w-10 object-cover rounded-lg border border-emerald-300"
                            />
                            <div>
                              <p className="font-bold text-emerald-900 text-xs">Doorstep Drop Photo Proof</p>
                              <p className="text-[10px] text-emerald-700">{order.deliveryProofRemarks || "Verified Drop"}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setViewDoorstepPhotoUrl(order.deliveryProofPhoto)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition"
                          >
                            View Photo
                          </button>
                        </div>
                      )}

                      {/* Field Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {order.status !== "Out for Delivery" && order.status !== "Delivered" && (
                          <button
                            onClick={() => handleDispatchOrder(order._id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition"
                          >
                            Out for Delivery 🚚
                          </button>
                        )}

                        {order.status !== "Delivered" && (
                          <button
                            onClick={() => handleMarkDeliveredWithProof(order._id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3 py-2 rounded-xl transition shadow"
                          >
                            Mark Delivered with Photo Proof 🏡
                          </button>
                        )}

                        {order.status !== "Failed Delivery" && order.status !== "Delivered" && (
                          <button
                            onClick={() => handleFailedDelivery(order._id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 text-xs px-3 py-2 rounded-xl transition"
                          >
                            Failed Drop ⚠️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* TAB 1: ZONE QUEUE */}
              {opsTab === "overview" && (
                <div className="space-y-4">
                  {/* Queue Filter Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="font-bold text-slate-700">Category Filter:</span>
                      {["ALL", "DAIRY", "VEGETABLE", "FRUIT", "OTHER"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1 rounded-lg font-bold transition ${
                            selectedCategory === cat
                              ? "bg-slate-900 text-white shadow-sm"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                      {opsQueue?.totalOrders || 0} Orders in Route Queue
                    </span>
                  </div>

                  {/* Queue Orders List */}
                  {loadingOpsQueue ? (
                    <div className="p-12 text-center text-slate-400 font-bold">Loading Route Queue...</div>
                  ) : (() => {
                    const filteredOpsOrders = (opsQueue?.orders || []).filter((order: any) => {
                      if (selectedCategory === "ALL") return true;
                      return order.products?.some((p: any) => {
                        const prodCategory = (p.category || p.product?.category || "").toUpperCase();
                        const prodName = (p.name || p.product?.name || "").toLowerCase();
                        if (selectedCategory === "DAIRY") {
                          return prodCategory === "DAIRY" || prodName.includes("milk") || prodName.includes("paneer") || prodName.includes("ghee") || prodName.includes("curd") || prodName.includes("butter") || prodName.includes("dahi");
                        }
                        if (selectedCategory === "VEGETABLE") {
                          return prodCategory === "VEGETABLE" || prodName.includes("subzi") || prodName.includes("potato") || prodName.includes("onion") || prodName.includes("tomato") || prodName.includes("palak") || prodName.includes("gobhi");
                        }
                        if (selectedCategory === "FRUIT") {
                          return prodCategory === "FRUIT" || prodName.includes("fruit") || prodName.includes("apple") || prodName.includes("mango") || prodName.includes("banana") || prodName.includes("guava") || prodName.includes("papaya");
                        }
                        if (selectedCategory === "OTHER") {
                          return prodCategory === "OTHER" || prodName.includes("vermicompost") || prodName.includes("turmeric") || prodName.includes("fertilizer") || prodName.includes("seeds");
                        }
                        return prodCategory === selectedCategory;
                      });
                    });

                    if (filteredOpsOrders.length === 0) {
                      return (
                        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
                          <span className="text-4xl block mb-2">🚚</span>
                          <p className="font-bold text-slate-800">No orders match the selected category filter ({selectedCategory}).</p>
                          <p className="text-xs text-slate-400 mt-1">Try switching back to "ALL" category to view all route orders.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <ul className="divide-y divide-slate-100">
                          {filteredOpsOrders.map((order: any) => (
                            <li key={order._id} className="p-5 hover:bg-slate-50/80 transition space-y-3">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                                      Order #{String(order._id).substring(String(order._id).length - 6).toUpperCase()}
                                    </span>
                                    <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-blue-200">
                                      {order.status}
                                    </span>
                                    {order.isSubscriptionGenerated && (
                                      <span className="bg-purple-100 text-purple-800 font-bold text-[10px] px-2 py-0.5 rounded border border-purple-200">
                                        Subscription Batch
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 font-bold mt-1">
                                    👤 Customer: {order.customerName} ({order.phone})
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    📍 Address: {order.address} — <strong>Pincode {order.pincode}</strong>
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivery Target</span>
                                  <span className="font-bold text-emerald-700 text-xs">
                                    {new Date(order.deliveryDate).toLocaleDateString()} (07:00 AM)
                                  </span>
                                  <span className="font-extrabold text-slate-900 text-sm block mt-0.5">
                                    ₹{order.totalAmount}
                                  </span>
                                </div>
                              </div>

                              {/* Line Items & Fulfillment Controls */}
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                <p className="text-[11px] font-bold text-slate-600 uppercase flex justify-between items-center">
                                  <span>Dispatch Packing List & Item Actions:</span>
                                  {fulfillmentMsg && <span className="text-emerald-700 font-bold">{fulfillmentMsg}</span>}
                                </p>

                                <div className="space-y-2">
                                  {order.products?.map((p: any, i: number) => (
                                    <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                                      <div>
                                        <span className="font-bold text-slate-900">{p.name}</span>
                                        <span className="text-slate-500 font-bold ml-1">x{p.qty} ({p.unit})</span>
                                        {p.substitutedName && (
                                          <span className="ml-2 bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded border border-amber-200">
                                            Substituted: {p.substitutedName}
                                          </span>
                                        )}
                                        {p.fulfillmentStatus && (
                                          <span className="ml-2 bg-emerald-50 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-200">
                                            Status: {p.fulfillmentStatus}
                                          </span>
                                        )}
                                      </div>

                                      {/* Item Action Buttons */}
                                      <div className="flex gap-1.5 shrink-0">
                                        <button
                                          onClick={() => handleItemFulfillment(order._id, i, "Harvested")}
                                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] px-2.5 py-1 rounded border border-emerald-200 transition"
                                        >
                                          Harvested 🥦
                                        </button>
                                        <button
                                          onClick={() => handleItemFulfillment(order._id, i, "Packed")}
                                          className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] px-2.5 py-1 rounded border border-blue-200 transition"
                                        >
                                          Packed 📦
                                        </button>
                                        <button
                                          onClick={() => handleApplySubstitution(order._id, i)}
                                          className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-1 rounded border border-amber-200 transition"
                                        >
                                          Substitute 🔄
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Order Stage Transition Action Bar */}
                              <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-200">
                                <button
                                  onClick={() => handleCutoffLock(order._id)}
                                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                                >
                                  Lock Cutoff (9:30 PM) 🔒
                                </button>
                                <button
                                  onClick={() => handleDispatchOrder(order._id)}
                                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                                >
                                  Out for Delivery 🚚
                                </button>
                                <button
                                  onClick={() => handleDeliverOrder(order._id)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                                >
                                  Mark Delivered 🏡 (7 AM SLA)
                                </button>
                                <button
                                  onClick={() => handleFailedDelivery(order._id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-red-200 transition"
                                >
                                  Failed Delivery ⚠️
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: DISPATCH MANAGER */}
              {opsTab === "dispatches" && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">🛵 Logistics & Vehicle Dispatch Manager</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Route Batch: {opsQueue?.zone?.name || "Arwal - Patna Route"}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-3 py-1 rounded-full border border-amber-300">
                      Target Dispatch: 04:30 AM
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-slate-400 font-bold uppercase text-[10px]">Total Packed Crates</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">
                        {opsQueue?.orders?.filter((o: any) => o.status === "Packed" || o.status === "Out for Delivery" || o.status === "Delivered").length || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <p className="text-blue-600 font-bold uppercase text-[10px]">Out for Delivery</p>
                      <p className="text-2xl font-black text-blue-900 mt-1">
                        {opsQueue?.orders?.filter((o: any) => o.status === "Out for Delivery").length || 0}
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <p className="text-emerald-700 font-bold uppercase text-[10px]">Completed Deliveries</p>
                      <p className="text-2xl font-black text-emerald-900 mt-1">
                        {opsQueue?.orders?.filter((o: any) => o.status === "Delivered").length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Dispatch Manager Filters Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-slate-700">Status Filter:</span>
                      {["ALL", "Packed", "Out for Delivery", "Delivered", "Failed Delivery"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setDispatchStatusFilter(st)}
                          className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                            dispatchStatusFilter === st
                              ? "bg-slate-900 text-white shadow-sm"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Search customer, phone, pincode..."
                      value={dispatchSearchTerm}
                      onChange={(e) => setDispatchSearchTerm(e.target.value)}
                      className="w-full sm:w-60 px-3 py-1.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  {/* Route Order Manifest List */}
                  <div className="pt-2 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <span>🚚</span> Route Delivery Manifest ({opsQueue?.orders?.length || 0} Orders Total)
                      </h3>
                      {fulfillmentMsg && <p className="text-xs font-bold text-emerald-700">{fulfillmentMsg}</p>}
                    </div>

                    {(() => {
                      const filteredDispatchOrders = (opsQueue?.orders || []).filter((order: any) => {
                        const matchesStatus = dispatchStatusFilter === "ALL" || order.status === dispatchStatusFilter;
                        const searchLower = dispatchSearchTerm.toLowerCase().trim();
                        const matchesSearch = !searchLower || 
                          (order.customerName || "").toLowerCase().includes(searchLower) ||
                          (order.phone || "").includes(searchLower) ||
                          (order.address || "").toLowerCase().includes(searchLower) ||
                          (order.pincode || "").includes(searchLower) ||
                          String(order._id).toLowerCase().includes(searchLower);

                        return matchesStatus && matchesSearch;
                      });

                      if (filteredDispatchOrders.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-400 font-bold bg-slate-50 rounded-xl border border-slate-200">
                            No orders match your filter criteria ({dispatchStatusFilter} status / "{dispatchSearchTerm}").
                          </div>
                        );
                      }

                      return (
                        <ul className="divide-y divide-slate-100 text-xs space-y-4">
                          {filteredDispatchOrders.map((order: any) => (
                            <li key={order._id} className="pt-4 space-y-3">
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-extrabold text-slate-900 text-sm">
                                        Order #{String(order._id).substring(String(order._id).length - 6).toUpperCase()}
                                      </span>
                                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                        order.status === "Delivered"
                                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                          : order.status === "Out for Delivery"
                                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                                          : order.status === "Failed Delivery"
                                          ? "bg-red-100 text-red-700 border border-red-200"
                                          : "bg-amber-100 text-amber-800 border border-amber-200"
                                      }`}>
                                        {order.status}
                                      </span>
                                      {order.isSubscriptionGenerated && (
                                        <span className="bg-purple-100 text-purple-800 font-bold text-[10px] px-2 py-0.5 rounded border border-purple-200">
                                          Subscription Batch
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-900 font-extrabold mt-1">
                                      👤 Customer: {order.customerName} (📞 {order.phone})
                                    </p>
                                    <p className="text-xs text-slate-700 font-semibold mt-0.5">
                                      🏡 Address: {order.address} — <strong className="text-slate-900">Pincode {order.pincode}</strong>
                                    </p>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivery Target</span>
                                    <span className="font-bold text-emerald-700 text-xs">
                                      {new Date(order.deliveryDate).toLocaleDateString()} (07:00 AM)
                                    </span>
                                    <span className="font-black text-slate-900 text-sm block mt-0.5">
                                      ₹{order.totalAmount}
                                    </span>
                                  </div>
                                </div>

                                {/* Produce Items Summary */}
                                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase">Route Produce Crate Items:</p>
                                  <div className="space-y-1">
                                    {order.products?.map((p: any, i: number) => (
                                      <div key={i} className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-slate-800">
                                          • {p.name} x{p.qty} ({p.unit})
                                          {p.substitutedName && <span className="ml-1 text-amber-700 font-bold">(Substituted: {p.substitutedName})</span>}
                                        </span>
                                        <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded">
                                          {p.fulfillmentStatus || "Pending"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Doorstep Delivery Transition Action Controls */}
                                <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-200">
                                  <button
                                    onClick={() => handleDispatchOrder(order._id)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm flex items-center gap-1"
                                  >
                                    <span>Out for Delivery 🚚</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeliverOrder(order._id)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm flex items-center gap-1"
                                  >
                                    <span>Mark Delivered 🏡 (7 AM SLA)</span>
                                  </button>
                                  <button
                                    onClick={() => handleFailedDelivery(order._id)}
                                    className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-red-200 transition"
                                  >
                                    <span>Failed Delivery ⚠️</span>
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* TAB 3: QUALITY REPORTS */}
              {opsTab === "issues" && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-2">
                    <h2 className="text-lg font-bold text-slate-900">⚠️ Route Quality Defect Tickets</h2>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                      {myIssues.length} Total Route Claims
                    </span>
                  </div>

                  {/* Quality Reports Filter Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-slate-700">Filter Status:</span>
                      {["ALL", "OPEN", "RESOLVED", "REJECTED"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setIssueStatusFilter(st)}
                          className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                            issueStatusFilter === st
                              ? "bg-slate-900 text-white shadow-sm"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {st === "OPEN" ? "Pending / Open" : st === "RESOLVED" ? "Resolved / Refunded" : st}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Search product, customer, description..."
                      value={issueSearchTerm}
                      onChange={(e) => setIssueSearchTerm(e.target.value)}
                      className="w-full sm:w-60 px-3 py-1.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  {(() => {
                    const filteredQualityIssues = myIssues.filter((iss: any) => {
                      let matchesStatus = true;
                      if (issueStatusFilter === "OPEN") {
                        matchesStatus = iss.status === "PENDING" || iss.status === "OPEN" || !iss.status;
                      } else if (issueStatusFilter === "RESOLVED") {
                        matchesStatus = String(iss.status || "").startsWith("RESOLVED");
                      } else if (issueStatusFilter === "REJECTED") {
                        matchesStatus = iss.status === "REJECTED";
                      }

                      const searchLower = issueSearchTerm.toLowerCase().trim();
                      const matchesSearch = !searchLower ||
                        (iss.productName || "").toLowerCase().includes(searchLower) ||
                        (iss.description || "").toLowerCase().includes(searchLower) ||
                        (iss.issueType || "").toLowerCase().includes(searchLower) ||
                        (iss.user?.name || "").toLowerCase().includes(searchLower) ||
                        (iss.user?.email || "").toLowerCase().includes(searchLower);

                      return matchesStatus && matchesSearch;
                    });

                    if (filteredQualityIssues.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-400 font-bold bg-slate-50 rounded-xl border border-slate-200">
                          {myIssues.length === 0
                            ? "No active quality defects reported for your route."
                            : `No defect tickets match your search/filter criteria (${issueStatusFilter} status / "${issueSearchTerm}").`}
                        </div>
                      );
                    }

                    return (
                      <ul className="divide-y divide-slate-100 text-xs">
                        {filteredQualityIssues.map((iss: any) => (
                          <li key={iss._id} className="py-4 space-y-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900 text-sm">{iss.productName}</span>
                                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                                    {iss.issueType}
                                  </span>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      iss.status === "RESOLVED_WALLET_CREDIT" || iss.status === "RESOLVED_REFUND"
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                        : iss.status === "REJECTED"
                                        ? "bg-red-100 text-red-700 border border-red-200"
                                        : "bg-amber-100 text-amber-800 border border-amber-200"
                                    }`}
                                  >
                                    {iss.status}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-xs mt-1">"{iss.description}"</p>
                                {iss.user && (
                                  <p className="text-slate-500 text-[11px] mt-0.5 font-semibold">
                                    👤 Customer: {iss.user.name} ({iss.user.email})
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {iss.photoUrl && (
                                  <button
                                    onClick={() => setViewPhotoUrl(iss.photoUrl)}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow-sm flex items-center gap-1"
                                  >
                                    <span>📷 View Defect Photo</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              )}
            </>
          )}

        {/* PHOTO VIEWER LIGHTBOX MODAL (FOR DELIVERY OPS) */}


        {viewPhotoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-3 border border-slate-700">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>📷</span> Quality Defect Photo Evidence Viewer
                </h3>
                <button
                  onClick={() => setViewPhotoUrl(null)}
                  className="text-slate-400 hover:text-slate-900 font-bold text-sm"
                >
                  ✕ Close
                </button>
              </div>
              <div className="w-full max-h-[70vh] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2">
                <img src={viewPhotoUrl} alt="Defect Evidence" className="max-h-[65vh] w-auto object-contain rounded-lg shadow" />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setViewPhotoUrl(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </AppShell>
    );
  }




  const handleCustomerTabChange = (tab: string) => {
    if (tab === "catalog") {
      router.push("/storefront");
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={handleCustomerTabChange} title="Customer Portal">

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-6 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Role: <strong className="uppercase font-bold text-slate-800">{user.role}</strong> • Email: {user.email}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold flex-wrap">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "orders" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🛒 My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "subscriptions" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ⚡ Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "wallet" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            💳 Quality Claims & Wallet (₹{walletBalance.toFixed(2)})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📍 Profile
          </button>
        </div>

      </div>

      {/* TAB 1: MY ORDERS & CANCEL BEFORE CUTOFF */}
      {(activeTab === "orders" || activeTab === "overview") && (

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Your Morning Delivery Orders</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Orders placed before <strong>9:30 PM cutoff</strong> arrive tomorrow morning at 7:00 AM.
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-sm"
            >
              + Place New Order
            </button>
          </div>

          {orderMsg && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold">
              {orderMsg}
            </div>
          )}

          {loadingOrders ? (
            <div className="p-8 text-center text-slate-400">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <span className="text-4xl block mb-2">🌾</span>
              <p className="font-bold text-slate-700">No active orders found</p>
              <p className="text-xs text-slate-400 mt-1">Browse our storefront and add items to your cart!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <ul className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const stages = ["Placed", "Cutoff Locked", "Harvested", "Packed", "Out for Delivery", "Delivered"];
                  const currentStageIdx = stages.indexOf(order.status);

                  return (
                    <li key={order._id} className="p-5 hover:bg-slate-50/80 transition space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-extrabold text-slate-900 text-sm">
                              #{String(order._id).substring(String(order._id).length - 6).toUpperCase()}
                            </p>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                order.status === "Delivered"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : order.status === "Cancelled" || order.status === "Failed Delivery"
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {order.status}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                order.paymentStatus === "PAID"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : order.paymentStatus === "FAILED"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-900 border-amber-300"
                              }`}
                            >
                              {order.paymentStatus === "PAID" ? "PAID ✅" : order.paymentStatus === "FAILED" ? "FAILED ❌" : "UNPAID 💳"}
                            </span>
                            {order.isOnTimeDelivery && order.status === "Delivered" && (
                              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                                ✅ 7 AM SLA Compliant
                              </span>
                            )}
                            {order.isSubscriptionGenerated && (
                              <span className="bg-purple-100 text-purple-800 font-bold text-[10px] px-2 py-0.5 rounded border border-purple-200">
                                Subscription Generated
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-1">
                            Delivery Date: <strong>{new Date(order.deliveryDate).toLocaleDateString()} (7:00 AM)</strong>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Route: {order.zoneId?.name || "Standard Delivery Zone"} ({order.pincode})
                          </p>
                        </div>

                        <div className="flex flex-col justify-between items-end shrink-0 gap-2">
                          <div className="text-right">
                            <span className="text-xs text-slate-400 font-semibold block">Total Amount</span>
                            <span className="font-black text-emerald-700 text-lg">₹{order.totalAmount}</span>
                          </div>

                          {order.paymentStatus !== "PAID" && order.status !== "Cancelled" && (
                            <button
                              onClick={() => setPaymentModalOrder(order)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition shadow-md flex items-center gap-1"
                            >
                              <span>💳 Pay via Mock Gateway</span>
                            </button>
                          )}

                          {(order.status === "Placed" || order.status === "Pending") && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3 py-1 rounded-lg transition"
                            >
                              Cancel Before 9:30 PM Cutoff
                            </button>
                          )}


                          {order.deliveryProofPhoto && (
                            <button
                              onClick={() => setViewDoorstepPhotoUrl(order.deliveryProofPhoto)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-xl transition flex items-center gap-1 shadow-sm"
                            >
                              <span>📸 View Doorstep Proof</span>
                            </button>
                          )}

                          {order.status === "Delivered" && (
                            <button
                              onClick={() => openReportModal(order._id, order.products?.[0]?.name || "Farm Produce")}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                            >

                              🛡️ Report Quality Issue
                            </button>
                          )}
                        </div>
                      </div>


                      {/* Visual Fulfillment Stage Timeline Stepper */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Morning Delivery Lifecycle Progress:</p>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          {stages.map((stg, sIdx) => {
                            const isDone = sIdx <= currentStageIdx && order.status !== "Cancelled" && order.status !== "Failed Delivery";
                            return (
                              <div key={stg} className="flex flex-col items-center flex-1 text-center">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                                    isDone
                                      ? "bg-emerald-600 text-white shadow-sm"
                                      : "bg-slate-200 text-slate-500"
                                  }`}
                                >
                                  {isDone ? "✓" : sIdx + 1}
                                </div>
                                <span className={`text-[10px] mt-1 hidden sm:inline ${isDone ? "text-emerald-800 font-bold" : "text-slate-400"}`}>
                                  {stg}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Produce Line Items & Substitution Notes */}
                      <div className="flex flex-wrap gap-2">
                        {order.products?.map((p: any, i: number) => (
                          <div key={i} className="text-xs bg-slate-50 text-slate-800 p-2 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-900">{p.name}</span> x{p.qty} (₹{p.price})
                            {p.substitutedName && (
                              <p className="text-[10px] text-amber-800 font-bold mt-0.5">
                                ⚠️ Substituted: {p.substitutedName}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Audit Log Timeline Events */}
                      {order.auditLog && order.auditLog.length > 0 && (
                        <details className="text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600">
                          <summary className="font-bold text-slate-800 cursor-pointer text-[11px]">
                            📜 View Audit Timeline ({order.auditLog.length} events logged)
                          </summary>
                          <ul className="mt-2 space-y-1.5 divide-y divide-slate-100 text-[11px]">
                            {order.auditLog.map((log: any, lIdx: number) => (
                              <li key={lIdx} className="pt-1 flex justify-between">
                                <span>
                                  <strong className="text-slate-900">[{log.stage}]</strong> {log.remarks} ({log.updatedBy})
                                </span>
                                <span className="text-slate-400 shrink-0 ml-2">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}


      {/* TAB 2: SUBSCRIPTIONS & VACATION MODE (PHASE 6) */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <span>⚡</span> Recurring Organic Subscription Engine
              </h2>
              <p className="text-xs text-emerald-200 mt-1">
                Auto-discount applied: <strong>5% OFF Weekly</strong> • <strong>10% OFF Monthly</strong>. Daily orders generated automatically before 9:30 PM cutoff.
              </p>
            </div>
            <button
              onClick={() => router.push("/#products")}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-4 py-2 rounded-lg transition shrink-0"
            >
              + Subscribe New SKU
            </button>
          </div>

          {subMsg && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold">
              {subMsg}
            </div>
          )}

          {loadingSubs ? (
            <div className="p-8 text-center text-slate-400">Loading your subscription plans...</div>
          ) : subscriptions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <span className="text-4xl block mb-2">🥛</span>
              <p className="font-bold text-slate-700">No active subscription plans</p>
              <p className="text-xs text-slate-400 mt-1">Subscribe to daily milk or veggies and save 5-10% automatically!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">
                          {sub.frequency} Plan ({sub.discountPercent}% Discount)
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            sub.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Delivery Days: {sub.deliveryDays?.join(", ")} • Route: {sub.zoneId?.name || "Assigned Zone"}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePauseSub(sub._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        sub.status === "ACTIVE"
                          ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {sub.status === "ACTIVE" ? "Pause Plan" : "Resume Plan"}
                    </button>
                  </div>

                  {/* Items Subscribed */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Subscribed Produce SKUs:</h4>
                    <div className="flex flex-wrap gap-2">
                      {sub.items?.map((item: any, i: number) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center gap-2 text-xs">
                          {item.product?.image ? (
                            <img src={item.product.image} alt={item.product.name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <span>🥦</span>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{item.product?.name || "Organic Item"}</p>
                            <p className="text-[11px] text-slate-500">
                              Qty: <strong>{item.quantity}</strong> • ₹{item.product?.price} / {item.product?.unit}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vacation Mode Skip Date Input */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>🏖️</span> Vacation Mode (Skip-a-Day)
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Skipped Dates: {sub.pausedDates?.length > 0 ? sub.pausedDates.join(", ") : "None"}
                      </p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <input
                        type="date"
                        value={skipDateInput}
                        onChange={(e) => setSkipDateInput(e.target.value)}
                        className="p-1.5 rounded border border-slate-300 text-slate-900 text-xs"
                      />
                      <button
                        onClick={() => handleSkipDay(sub._id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded transition"
                      >
                        Skip Delivery
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE & DELIVERY ADDRESS */}
      {activeTab === "profile" && (
        <div className="max-w-xl mx-auto bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>📍</span> Delivery Profile & Pincode Routing
          </h3>

          {/* Live Location GPS Detection Button */}
          <div className="mb-4 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <p className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                <span>📍</span> Auto-Detect Live Location
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Fetch your current GPS address & pincode automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDetectLiveLocation}
              disabled={detectingLocation}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg transition shadow-sm flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <span>{detectingLocation ? "Detecting Live Location... 📡" : "📍 Detect Live Location"}</span>
            </button>
          </div>

          {profileMsg && (
            <div className="mb-3 text-xs p-2.5 rounded-lg bg-white border border-slate-200 font-semibold">
              {profileMsg}
            </div>
          )}


          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Delivery Address *</label>
              <textarea
                rows={3}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                placeholder="House / Flat / Street address"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Pincode (Zone Routing) *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                placeholder="226010"
              />
              <p className="text-[11px] text-slate-400 mt-1">Used to auto-assign your 7 AM delivery route.</p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {savingProfile ? "Saving Profile..." : "Update Delivery Address"}
            </button>
          </form>
        </div>
      )}


      {/* TAB 4: WALLET & BILLING */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          {/* Wallet Balance Hero Card */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                The Farm Brothers Prepaid Wallet
              </span>
              <p className="text-xs text-emerald-200 mt-2">Available Refund Credits for Next Checkout</p>
              <h2 className="text-3xl font-black mt-1">₹{walletBalance.toFixed(2)}</h2>
            </div>
            <div className="bg-slate-800/80 backdrop-blur p-4 rounded-xl border border-slate-700 text-xs max-w-sm">
              <p className="font-bold text-amber-400">🛡️ 100% Freshness Guarantee</p>
              <p className="text-slate-300 mt-0.5 text-[11px]">
                Spoiled or missing items are instantly refunded as Wallet Credit upon Admin review.
              </p>
            </div>
          </div>

          {/* Wallet Transactions / Refund Credits History */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">💳 Wallet Credits & Transaction History</h3>
              <button onClick={fetchQualityClaimsAndWallet} className="text-xs text-emerald-600 font-semibold hover:underline">
                ↻ Refresh Wallet
              </button>
            </div>

            {loadingClaims ? (
              <div className="p-8 text-center text-slate-400 font-bold">Loading wallet records...</div>
            ) : myIssues.filter((i: any) => i.refundAmount > 0).length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white">
                <span className="text-3xl block mb-2">💳</span>
                <p className="font-bold text-slate-700">No wallet refund credits yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Refunds from verified quality defect claims automatically credit to your wallet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {myIssues
                  .filter((i: any) => i.refundAmount > 0)
                  .map((issue: any) => (
                    <li key={issue._id} className="p-5 hover:bg-slate-50/80 transition flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{issue.productName}</span>
                          <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300">
                            {issue.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-1">
                          Claim Resolved: {new Date(issue.updatedAt || issue.createdAt).toLocaleDateString()}
                        </p>
                        {issue.adminRemarks && (
                          <p className="text-emerald-700 font-semibold text-[11px] mt-1">
                            💬 {issue.adminRemarks}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Credit Added</span>
                        <span className="font-black text-emerald-700 text-base">+₹{issue.refundAmount}</span>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: REPORT QUALITY ISSUE */}
      {activeTab === "issues" && (
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                100% Quality & Freshness Guarantee
              </span>
              <h2 className="text-2xl font-black mt-1">🛡️ Report Produce Quality Defect</h2>
              <p className="text-xs text-amber-200 mt-1">
                Received spoiled, missing, or damaged produce? Submit your claim photo below for instant Admin review and wallet refund credit.
              </p>
            </div>
          </div>

          {claimMsg && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
              {claimMsg}
            </div>
          )}

          {/* Form Card: Submit New Quality Claim */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm text-xs">
            <h3 className="text-base font-extrabold text-slate-900 border-b pb-3 flex items-center gap-2">
              <span>📸</span> Submit New Produce Quality Claim
            </h3>

            <form onSubmit={handleSubmitQualityClaim} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Delivered Order Reference *</label>
                  <select
                    value={reportOrderId}
                    onChange={(e) => setReportOrderId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-slate-50"
                  >
                    <option value="">-- Select Delivered Order --</option>
                    {orders
                      ?.filter((o: any) => o.status === "Delivered")
                      .map((o: any) => (
                        <option key={o._id} value={o._id}>
                          Order #{String(o._id).substring(String(o._id).length - 6).toUpperCase()} — {new Date(o.deliveryDate).toLocaleDateString()} (₹{o.totalAmount})
                        </option>
                      ))}
                    {orders?.length === 0 && <option value="sample_order_id">Sample Order #DEMO-01</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Produce Item Name *</label>
                  <input
                    type="text"
                    required
                    value={reportProductName}
                    onChange={(e) => setReportProductName(e.target.value)}
                    placeholder="e.g. Organic Malai Paneer / A2 Cow Milk"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Defect Category *</label>
                  <select
                    value={reportIssueType}
                    onChange={(e) => setReportIssueType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-slate-50"
                  >
                    <option value="SPOILED_PRODUCE">Spoiled / Rotten Harvest</option>
                    <option value="MISSING_ITEM">Missing Item in Delivery Crate</option>
                    <option value="WEIGHT_DEFECT">Weight / Quantity Shortfall</option>
                    <option value="DAMAGED_PACKAGING">Damaged Seal / Milk Spilled</option>
                    <option value="UNAUTHORIZED_SUBSTITUTION">Unapproved Substitute Item</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Defect Description & Remarks *</label>
                  <input
                    type="text"
                    required
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Describe condition (e.g. Milk carton seal broken, spilled during transit)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex justify-between items-center">
                  <span>📸 Upload Defect Photo Evidence *</span>
                  {reportPhoto && (
                    <button
                      type="button"
                      onClick={() => setReportPhoto("")}
                      className="text-red-600 hover:underline text-[11px] font-bold"
                    >
                      Remove Photo
                    </button>
                  )}
                </label>

                {reportPhoto ? (
                  <div className="relative w-full h-40 bg-slate-900 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center p-2">
                    <img src={reportPhoto} alt="Defect Evidence" className="max-h-36 w-auto object-contain rounded" />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center transition bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      id="defect-photo-upload"
                    />
                    <label htmlFor="defect-photo-upload" className="cursor-pointer flex flex-col items-center gap-1">
                      <span className="text-2xl">📸</span>
                      <span className="font-bold text-slate-800 text-xs">Click to Select Defect Photo File</span>
                      <span className="text-[10px] text-slate-400">Supports PNG, JPG, WebP (Max 5MB)</span>
                    </label>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingReport}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl transition shadow-md text-sm disabled:opacity-50"
              >
                {submittingReport ? "Submitting Quality Claim..." : "🛡️ Submit Quality Claim for Admin Refund Review"}
              </button>
            </form>
          </div>

          {/* Reported Claims List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Your Reported Quality Claims ({myIssues.length})</h3>
              <button onClick={fetchQualityClaimsAndWallet} className="text-xs text-emerald-600 font-semibold hover:underline">
                ↻ Refresh Claims
              </button>
            </div>

            {loadingClaims ? (
              <div className="p-8 text-center text-slate-400 font-bold">Loading quality claims...</div>
            ) : myIssues.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white">
                <span className="text-3xl block mb-2">🌿</span>
                <p className="font-bold text-slate-700">No reported quality claims</p>
                <p className="text-xs text-slate-400 mt-1">
                  Fill out the form above to submit a claim for any spoiled or missing item.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {myIssues.map((issue) => (
                  <li key={issue._id} className="p-5 hover:bg-slate-50/80 transition space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{issue.productName}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              issue.status === "RESOLVED_WALLET_CREDIT" || issue.status === "RESOLVED_REFUND"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : issue.status === "REJECTED"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {issue.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">Issue: {issue.description}</p>
                        {issue.photoUrl && (
                          <div className="mt-2">
                            <button
                              onClick={() => setViewPhotoUrl(issue.photoUrl)}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1 rounded-lg transition shadow-sm flex items-center gap-1.5"
                            >
                              <span>📷 View Uploaded Defect Photo</span>
                            </button>
                          </div>
                        )}
                        {issue.adminRemarks && (
                          <p className="text-xs text-emerald-700 font-semibold mt-1 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                            💬 Admin Note: {issue.adminRemarks}
                          </p>
                        )}
                      </div>

                      {issue.refundAmount > 0 && (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Wallet Credit</span>
                          <span className="font-black text-emerald-700 text-base">
                            +₹{issue.refundAmount}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}


      {/* REPORT QUALITY ISSUE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">🛡️ Report Quality Issue</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQualityClaim} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={reportProductName}
                  onChange={(e) => setReportProductName(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Issue Type *</label>
                <select
                  value={reportIssueType}
                  onChange={(e) => setReportIssueType(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 text-slate-900 font-semibold"
                >
                  <option value="SPOILED_PRODUCE">Spoiled / Damaged Produce</option>
                  <option value="MISSING_ITEM">Missing Line Item</option>
                  <option value="WRONG_ITEM">Wrong Item Received</option>
                  <option value="QUALITY_DEFECT">Quality Defect</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Describe produce defect or issue..."
                  className="w-full p-2 rounded border border-slate-300 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-600 font-bold">Defect Photo Evidence (Upload or URL)</label>

                {/* File Upload Button */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="defect-photo-upload"
                    className="hidden"
                    onChange={handleImageFileUpload}
                  />
                  <label
                    htmlFor="defect-photo-upload"
                    className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>📷 Upload Photo File</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">Or enter image URL below</span>
                </div>

                {/* Live Image Preview Thumbnail */}
                {reportPhoto && (
                  <div className="relative w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                    <img src={reportPhoto} alt="Defect Evidence Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setReportPhoto("")}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] px-2 py-1 rounded-md shadow"
                    >
                      Remove Photo ✕
                    </button>
                  </div>
                )}

                {/* URL Input */}
                <input
                  type="text"
                  value={reportPhoto}
                  onChange={(e) => setReportPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                />
              </div>


              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submittingReport ? "Submitting Claim..." : "Submit Quality Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO VIEWER LIGHTBOX MODAL */}

      {viewPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-3 border border-slate-700">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>📷</span> Quality Defect Photo Evidence Viewer
              </h3>
              <button
                onClick={() => setViewPhotoUrl(null)}
                className="text-slate-400 hover:text-slate-900 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>
            <div className="w-full max-h-[70vh] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2">
              <img src={viewPhotoUrl} alt="Defect Evidence" className="max-h-[65vh] w-auto object-contain rounded-lg shadow" />
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setViewPhotoUrl(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 14 DOORSTEP DELIVERY PROOF PHOTO VIEWER MODAL */}
      {viewDoorstepPhotoUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 shadow-2xl space-y-3 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <span>📸</span> Verified Doorstep Delivery Photo Proof (Phase 14)
              </span>
              <button
                onClick={() => setViewDoorstepPhotoUrl(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>
            <div className="w-full max-h-[70vh] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2">
              <img src={viewDoorstepPhotoUrl} alt="Doorstep Delivery Proof" className="max-h-[65vh] w-auto object-contain rounded-lg shadow" />
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setViewDoorstepPhotoUrl(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 13 MOCK PAYMENT GATEWAY MODAL */}
      {paymentModalOrder && (

        <MockPaymentModal
          orderId={paymentModalOrder._id}
          amount={paymentModalOrder.totalAmount}
          onSuccess={() => {
            setPaymentModalOrder(null);
            fetchOrders();
          }}
          onClose={() => setPaymentModalOrder(null)}
        />
      )}
    </AppShell>
  );
}





