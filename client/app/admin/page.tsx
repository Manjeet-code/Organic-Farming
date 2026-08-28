"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import AppShell from "../../components/AppShell";

export default function AdminPanel() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview"); // overview, catalog, zones, staff, dispatch, claims, orders, audit


  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Zones State
  const [zones, setZones] = useState<any[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);

  // Zone Form State
  const [zoneCode, setZoneCode] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [city, setCity] = useState("Arwal / Patna");
  const [pincodes, setPincodes] = useState("");

  const [cutoffTime, setCutoffTime] = useState("21:30");
  const [dispatchDeadline, setDispatchDeadline] = useState("04:30");
  const [dailyCapacity, setDailyCapacity] = useState("100");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [zoneMsg, setZoneMsg] = useState("");

  // Pincode Lookup Tester State
  const [testPincode, setTestPincode] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [testingLookup, setTestingLookup] = useState(false);

  // Doorstep Delivery Proof Viewer State (Phase 14)
  const [viewProofPhotoUrl, setViewProofPhotoUrl] = useState<string | null>(null);

  // Delivery Ops Staff Onboarding State

  const [opsName, setOpsName] = useState("");
  const [opsEmail, setOpsEmail] = useState("");
  const [opsPassword, setOpsPassword] = useState("password123");
  const [opsPhone, setOpsPhone] = useState("");
  const [opsZoneId, setOpsZoneId] = useState("");
  const [opsMsg, setOpsMsg] = useState("");
  const [creatingOps, setCreatingOps] = useState(false);

  // Catalog Products State (Phase 4)
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Product Form State
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("VEGETABLE");
  const [prodUnit, setProdUnit] = useState("kg");
  const [prodPrice, setProdPrice] = useState("");
  const [prodStock, setProdStock] = useState("50");
  const [prodSubstitute, setProdSubstitute] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodSubEligible, setProdSubEligible] = useState(true);
  const [prodSubDiscount, setProdSubDiscount] = useState("5");
  const [prodMsg, setProdMsg] = useState("");

  // Quality Claims State (Phase 9)
  const [allIssues, setAllIssues] = useState<any[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issuesMsg, setIssuesMsg] = useState("");
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);


  // Dispatch Routing State (Phase 7)
  const [dispatchSummary, setDispatchSummary] = useState<any>(null);
  const [loadingDispatch, setLoadingDispatch] = useState(false);
  const [dispatchMsg, setDispatchMsg] = useState("");

  // Admin Order Management & Fulfillment State (Phase 8 & 9)
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [adminOrderMsg, setAdminOrderMsg] = useState("");


  const handleAdminCutoffLock = async (orderId: string) => {
    setAdminOrderMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `http://localhost:5000/api/fulfillment/orders/${orderId}/cutoff-lock`,
        { remarks: "Locked cutoff stage by Super Admin" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminOrderMsg(`✅ ${data.message}`);
      fetchOrders();
    } catch (err: any) {
      setAdminOrderMsg("❌ Failed to lock cutoff stage");
    }
  };

  const handleAdminItemFulfillment = async (orderId: string, itemIndex: number, fulfillmentStatus: string) => {
    setAdminOrderMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `http://localhost:5000/api/fulfillment/orders/${orderId}/items/${itemIndex}`,
        { fulfillmentStatus, remarks: `Marked ${fulfillmentStatus} by Super Admin` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminOrderMsg(`✅ ${data.message}`);
      fetchOrders();
    } catch (err: any) {
      setAdminOrderMsg(`❌ ${err.response?.data?.message || "Failed to update item fulfillment status"}`);
    }
  };


  const handleAdminSubstitute = async (orderId: string, itemIndex: number) => {
    setAdminOrderMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.post(
        `http://localhost:5000/api/fulfillment/orders/${orderId}/substitute`,
        { itemIndex, remarks: "Original produce out of stock, substitute applied by Admin" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminOrderMsg(`✅ Mapped substitute produce applied: ${data.substituteName}`);
      fetchOrders();
    } catch (err: any) {
      setAdminOrderMsg("❌ Failed to apply produce substitution");
    }
  };

  const handleAdminDispatch = async (orderId: string) => {
    setAdminOrderMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `http://localhost:5000/api/fulfillment/orders/${orderId}/dispatch`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminOrderMsg(`✅ ${data.message}`);
      fetchOrders();
    } catch (err: any) {
      setAdminOrderMsg("❌ Failed to dispatch order");
    }
  };

  const handleAdminDeliver = async (orderId: string) => {
    setAdminOrderMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `http://localhost:5000/api/fulfillment/orders/${orderId}/deliver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminOrderMsg(`✅ ${data.message}`);
      fetchOrders();
    } catch (err: any) {
      setAdminOrderMsg("❌ Failed to complete delivery");
    }
  };

  const handleAdminCancel = async (orderId: string) => {
    setAdminOrderMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminOrderMsg(`✅ ${data.message}`);
      fetchOrders();
    } catch (err: any) {
      setAdminOrderMsg(`❌ ${err.response?.data?.message || "Failed to cancel order"}`);
    }
  };





  // Audit Logs State (Phase 12)
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(true);
  const [auditActionFilter, setAuditActionFilter] = useState("ALL");
  const [auditSearch, setAuditSearch] = useState("");

  const fetchAuditLogs = async () => {
    const token = localStorage.getItem("farmfresh_token");
    if (!token) return;

    setLoadingAuditLogs(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/audit-logs?action=${auditActionFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAuditLogs(data.auditLogs || []);
    } catch (e) {
      console.error("Failed to fetch audit logs");
    } finally {
      setLoadingAuditLogs(false);
    }
  };


  // Analytics State (Phase 11)
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [drillDownLevel, setDrillDownLevel] = useState<"PLATFORM" | "ZONE" | "ORDER">("PLATFORM");
  const [selectedDrillZone, setSelectedDrillZone] = useState<any>(null);
  const [selectedDrillOrder, setSelectedDrillOrder] = useState<any>(null);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem("farmfresh_token");
    if (!token) return;

    setLoadingAnalytics(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/analytics/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalyticsData(data);
    } catch (e) {
      console.error("Failed to fetch analytics");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Phase 13 Mock Payment Transactions State

  const [paymentTransactions, setPaymentTransactions] = useState<any[]>([]);
  const [loadingPaymentTxs, setLoadingPaymentTxs] = useState(false);

  const fetchPaymentTransactions = async () => {
    const token = localStorage.getItem("farmfresh_token");
    if (!token) return;

    setLoadingPaymentTxs(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/payments/all-transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentTransactions(data || []);
    } catch (e) {
      console.error("Failed to fetch payment transactions");
    } finally {
      setLoadingPaymentTxs(false);
    }
  };

  const fetchAllIssues = async () => {

    const token = localStorage.getItem("farmfresh_token");
    if (!token) return;

    setLoadingIssues(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/issues/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllIssues(data);
    } catch (error) {
      console.error("Failed to fetch quality claims");
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    fetchProducts();
    fetchZones();
    fetchOrders();
    fetchDispatchSummary();
    fetchAllIssues();
    fetchAnalytics();
    fetchAuditLogs();
    fetchPaymentTransactions();
  }, [user, router]);



  const handleResolveClaim = async (issueId: string, resolutionAction: string, defaultAmount: number) => {
    let refundAmount = defaultAmount;
    if (resolutionAction === "WALLET_CREDIT" || resolutionAction === "REFUND") {
      const input = prompt("Enter Wallet Refund Amount (₹):", defaultAmount ? String(defaultAmount) : "150");
      if (!input) return;
      refundAmount = Number(input);
    }

    const remarks = prompt("Enter Resolution Remarks / Note for Customer:", `Resolved via ${resolutionAction}`);
    setIssuesMsg("");

    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `http://localhost:5000/api/issues/${issueId}/resolve`,
        { resolutionAction, refundAmount, adminRemarks: remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIssuesMsg(`✅ ${data.message}`);
      fetchAllIssues();
    } catch (err: any) {
      setIssuesMsg("❌ Failed to resolve quality claim");
    }
  };


  const fetchDispatchSummary = async () => {
    const token = localStorage.getItem("farmfresh_token");
    if (!token) return;

    setLoadingDispatch(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/dispatch/zone-summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDispatchSummary(data);
    } catch (error) {
      console.error("Failed to fetch dispatch summary");
    } finally {
      setLoadingDispatch(false);
    }
  };


  const handleReassignZone = async (orderId: string, newZoneId: string) => {
    setDispatchMsg("");
    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.put(
        `http://localhost:5000/api/dispatch/orders/${orderId}/reassign-zone`,
        { newZoneId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDispatchMsg(`✅ ${data.message}`);
      fetchOrders();
      fetchDispatchSummary();
    } catch (err: any) {
      setDispatchMsg("❌ Failed to reassign order delivery zone");
    }
  };


  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/products?adminAll=true");
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch catalog products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchZones = async () => {
    setLoadingZones(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/zones");
      setZones(data);
    } catch (error) {
      console.error("Failed to fetch zones");
    } finally {
      setLoadingZones(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/orders/all");
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Phase 4: Product Save Handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdMsg("");

    try {
      const payload = {
        name: prodName,
        category: prodCategory,
        unit: prodUnit,
        price: Number(prodPrice),
        dailyStockCeiling: Number(prodStock),
        substituteProductId: prodSubstitute || null,
        image: prodImage,
        description: prodDesc,
        isSubscriptionEligible: prodSubEligible,
        subscriptionDiscount: Number(prodSubDiscount),
      };

      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, payload);
        setProdMsg("✅ Product updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/products", payload);
        setProdMsg("✅ Product added to catalog!");
      }

      resetProductForm();
      fetchProducts();
    } catch (err: any) {
      setProdMsg(`❌ Error: ${err.response?.data?.message || "Failed to save product"}`);
    }
  };

  // Phase 4: Toggle "Today's Harvest" Availability
  const handleToggleAvailability = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}/toggle-availability`);
      fetchProducts();
    } catch (err) {
      console.error("Failed to toggle product availability");
    }
  };

  // Phase 4: Delete Product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete '${productName}' from the organic catalog?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("farmfresh_token");
      const { data } = await axios.delete(
        `http://localhost:5000/api/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ ${data.message}`);
      fetchProducts();
    } catch (err: any) {
      alert(`❌ ${err.response?.data?.message || "Failed to delete product"}`);
    }
  };

  // Phase 4: Product Image File Upload
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProdMsg("❌ Image file exceeds maximum 5MB size limit");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProdImage(reader.result as string);
      setProdMsg("✅ Product image file loaded!");
    };
    reader.readAsDataURL(file);
  };

  const openEditProductModal = (product: any) => {

    setEditingProduct(product);
    setProdName(product.name);
    setProdCategory(product.category || "VEGETABLE");
    setProdUnit(product.unit || "kg");
    setProdPrice(product.price?.toString() || "");
    setProdStock(product.dailyStockCeiling?.toString() || "50");
    setProdSubstitute(product.substituteProductId?._id || product.substituteProductId || "");
    setProdImage(product.image || "");
    setProdDesc(product.description || "");
    setProdSubEligible(product.isSubscriptionEligible !== false);
    setProdSubDiscount(product.subscriptionDiscount?.toString() || "5");
    setShowProductModal(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdName("");
    setProdCategory("VEGETABLE");
    setProdUnit("kg");
    setProdPrice("");
    setProdStock("50");
    setProdSubstitute("");
    setProdImage("");
    setProdDesc("");
    setProdSubEligible(true);
    setProdSubDiscount("5");
    setShowProductModal(false);
  };

  // Zone handlers
  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setZoneMsg("");

    try {
      const payload = {
        zoneCode,
        name: zoneName,
        city,
        pincodeRanges: pincodes.split(",").map((p) => p.trim()).filter(Boolean),
        cutoffTime,
        dispatchDeadline,
        dailyCapacity: Number(dailyCapacity),
        primaryStaffId: assignedStaffId || null,
      };

      if (editingZone) {
        await axios.put(`http://localhost:5000/api/zones/${editingZone._id}`, payload);
        setZoneMsg("✅ Zone updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/zones", payload);
        setZoneMsg("✅ Delivery zone created successfully!");
      }

      resetZoneForm();
      fetchZones();
    } catch (err: any) {
      setZoneMsg(`❌ Error: ${err.response?.data?.message || "Failed to save zone"}`);
    }
  };

  const handleToggleZoneStatus = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/api/zones/${id}/toggle-status`);
      fetchZones();
    } catch (err) {
      console.error("Failed to toggle zone status");
    }
  };

  const handleTestPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPincode.trim()) return;

    setTestingLookup(true);
    setLookupResult(null);

    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/zones/serviceability/${testPincode.trim()}`
      );
      setLookupResult(data);
    } catch (err) {
      setLookupResult({ serviceable: false, message: "Error looking up pincode serviceability" });
    } finally {
      setTestingLookup(false);
    }
  };

  const handleCreateOpsAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOps(true);
    setOpsMsg("");

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/create-ops", {
        name: opsName,
        email: opsEmail,
        password: opsPassword,
        phone: opsPhone,
        zoneId: opsZoneId || null,
      });

      setOpsMsg(`✅ Delivery-Ops staff ${data.user?.name} onboarded successfully!`);
      setOpsName("");
      setOpsEmail("");
      setOpsPhone("");
      fetchZones();
    } catch (err: any) {
      setOpsMsg(`❌ ${err.response?.data?.message || "Failed to onboard staff account"}`);
    } finally {
      setCreatingOps(false);
    }
  };

  const openEditModal = (zone: any) => {
    setEditingZone(zone);
    setZoneCode(zone.zoneCode);
    setZoneName(zone.name);
    setCity(zone.city);
    setPincodes(zone.pincodeRanges?.join(", ") || "");
    setCutoffTime(zone.cutoffTime || "21:30");
    setDispatchDeadline(zone.dispatchDeadline || "04:30");
    setDailyCapacity(zone.dailyCapacity?.toString() || "100");
    setAssignedStaffId(zone.primaryStaffId?._id || "");
    setShowZoneModal(true);
  };

  const resetZoneForm = () => {
    setEditingZone(null);
    setZoneCode("");
    setZoneName("");
    setCity("Arwal / Patna");
    setPincodes("");

    setCutoffTime("21:30");
    setDispatchDeadline("04:30");
    setDailyCapacity("100");
    setAssignedStaffId("");
    setShowZoneModal(false);
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "All") return true;
    return p.category === selectedCategory;
  });

  if (!user || user.role !== "admin") return null;

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab} title="Admin Operations">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 mb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>⚙️</span> Platform Administration & Catalog Management
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage organic product catalog, "Today's Harvest" availability, daily stock ceilings, and zone routes.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold flex-wrap">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "analytics" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📊 Analytics & KPIs
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "catalog" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🌾 Product Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("zones")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "zones" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📍 Delivery Zones ({zones.length})
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "staff" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🚚 Onboard Ops Staff
          </button>
          <button
            onClick={() => setActiveTab("dispatch")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "dispatch" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🚚 Dispatch Routing & Queues
          </button>
          <button
            onClick={() => setActiveTab("claims")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "claims" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🛡️ Claims & Wallet Refunds ({allIssues.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "orders" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📦 Orders ({orders.length})
          </button>
        </div>


      </div>

      {/* TAB 0: ANALYTICS & EXECUTIVE KPI DASHBOARD (PHASE 11) */}
      {(activeTab === "analytics" || activeTab === "overview") && (

        <div className="space-y-6">
          {/* Executive Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Executive Decision-Maker Dashboard
              </span>
              <h2 className="text-2xl font-black mt-1">📊 Platform Analytics & SLA Performance</h2>
              <p className="text-xs text-emerald-200 mt-1">
                Real-time MongoDB revenue aggregation, category sales breakdown, 7 AM SLA compliance, and 4-tier drill-down.
              </p>
            </div>

            <button
              onClick={fetchAnalytics}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md"
            >
              ↻ Refresh Analytics KPIs
            </button>
          </div>

          {loadingAnalytics ? (
            <div className="p-12 text-center text-slate-400 font-bold">Generating platform analytics...</div>
          ) : !analyticsData ? (
            <div className="p-12 text-center text-slate-400">Failed to load analytics data.</div>
          ) : (
            <>
              {/* Executive KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Gross Revenue */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">₹{analyticsData.financials?.totalRevenue || 0}</h3>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1 text-[10px]">
                    <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded">🥦 ₹{analyticsData.financials?.revenueByCategory?.VEGETABLE || 0}</span>
                    <span className="bg-blue-50 text-blue-800 font-bold px-1.5 py-0.5 rounded">🥛 ₹{analyticsData.financials?.revenueByCategory?.DAIRY || 0}</span>
                  </div>
                </div>

                {/* 2. Total Orders & Split */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Orders</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">{analyticsData.totalOrders || 0}</h3>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-600 flex justify-between">
                    <span>⚡ Subscriptions: {analyticsData.orderTypeSplit?.subscription || 0}</span>
                    <span>🛒 One-Time: {analyticsData.orderTypeSplit?.oneTime || 0}</span>
                  </div>
                </div>

                {/* 3. 7 AM Doorstep SLA Compliance */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">7 AM SLA Compliance</span>
                    <h3 className="text-2xl font-black text-emerald-700 mt-0.5">{analyticsData.fulfillmentMetrics?.slaOnTimePercent || 100}%</h3>
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-800 pt-2 border-t border-slate-100">
                    ✅ {analyticsData.fulfillmentMetrics?.onTimeDeliveriesCount || 0} / {analyticsData.fulfillmentMetrics?.completedDeliveriesCount || 0} On-Time drops
                  </p>
                </div>

                {/* 4. Subscription Retention */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Subscription Retention</span>
                    <h3 className="text-2xl font-black text-purple-700 mt-0.5">{analyticsData.subscriptionMetrics?.retentionRatePercent || 100}%</h3>
                  </div>
                  <p className="text-[11px] font-semibold text-purple-900 pt-2 border-t border-slate-100">
                    ⚡ {analyticsData.subscriptionMetrics?.active || 0} Active ({analyticsData.subscriptionMetrics?.paused || 0} Paused)
                  </p>
                </div>

                {/* 5. Defects & Wallet Refunds */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Quality Defects & Refunds</span>
                    <h3 className="text-2xl font-black text-amber-700 mt-0.5">{analyticsData.qualityMetrics?.openQualityIssuesCount || 0} Open</h3>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 pt-2 border-t border-slate-100">
                    💳 ₹{analyticsData.qualityMetrics?.totalRefundCreditsGranted || 0} Wallet credits granted
                  </p>
                </div>
              </div>

              {/* Zone Performance Matrix Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Zone Route Performance & SLA Matrix</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Orders received, completion rates, and 7 AM SLA delivery compliance per route.</p>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{analyticsData.zonePerformanceMatrix?.length || 0} Active Zones</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Zone Code & Name</th>
                        <th className="p-3">City</th>
                        <th className="p-3">Capacity</th>
                        <th className="p-3">Orders Received</th>
                        <th className="p-3">Delivered</th>
                        <th className="p-3">Failed</th>
                        <th className="p-3">7 AM SLA On-Time %</th>
                        <th className="p-3 text-right">Drill-Down</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analyticsData.zonePerformanceMatrix?.map((z: any) => (
                        <tr key={z.zoneId} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">
                            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mr-2">{z.zoneCode}</span>
                            {z.name}
                          </td>
                          <td className="p-3 text-slate-600 font-semibold">{z.city}</td>
                          <td className="p-3 font-semibold text-slate-700">{z.dailyCapacity} orders/day</td>
                          <td className="p-3 font-bold text-slate-900">{z.totalOrders}</td>
                          <td className="p-3 font-bold text-emerald-700">{z.deliveredCount}</td>
                          <td className="p-3 font-bold text-red-600">{z.failedCount}</td>
                          <td className="p-3">
                            <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                              {z.slaPercent}% SLA
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedDrillZone(z);
                                setDrillDownLevel("ZONE");
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition"
                            >
                              Inspect Zone 🔍
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4-Tier Interactive Platform Drill-Down Hierarchy */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Interactive Hierarchy Inspector</span>
                    <h3 className="text-lg font-black mt-0.5">
                      Platform Drill-Down: <span className="text-emerald-400">{drillDownLevel}</span> LEVEL
                    </h3>
                  </div>

                  {drillDownLevel !== "PLATFORM" && (
                    <button
                      onClick={() => {
                        setDrillDownLevel("PLATFORM");
                        setSelectedDrillZone(null);
                        setSelectedDrillOrder(null);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-slate-700 transition"
                    >
                      ← Back to Platform Overview
                    </button>
                  )}
                </div>

                {drillDownLevel === "PLATFORM" && (
                  <div className="text-xs space-y-2">
                    <p className="text-slate-300">
                      Click any <strong>Inspect Zone 🔍</strong> button in the matrix above to drill down from Platform level to individual Zone route orders and item audit logs.
                    </p>
                    <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                      <span>🌐 Platform Status: <strong>ONLINE</strong></span>
                      <span>🏢 Active Zones: <strong>{analyticsData.zonePerformanceMatrix?.length || 0}</strong></span>
                      <span>👥 Total Customers: <strong>{analyticsData.totalCustomers || 0}</strong></span>
                      <span>📦 Active Queue: <strong>{analyticsData.fulfillmentMetrics?.pendingFulfillmentCount || 0} pending</strong></span>
                    </div>
                  </div>
                )}

                {drillDownLevel === "ZONE" && selectedDrillZone && (
                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-400">
                          Zone Route: {selectedDrillZone.name} ({selectedDrillZone.zoneCode})
                        </h4>
                        <p className="text-slate-400 mt-0.5">
                          City: {selectedDrillZone.city} • Daily Capacity: {selectedDrillZone.dailyCapacity} orders
                        </p>
                      </div>
                      <span className="bg-emerald-500 text-slate-950 font-black px-3 py-1 rounded-full text-xs">
                        {selectedDrillZone.slaPercent}% SLA Compliance
                      </span>
                    </div>

                    <p className="font-bold text-slate-300">Assigned Orders in this Zone Route:</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {orders
                        .filter((o) => o.zoneId?._id === selectedDrillZone.zoneId || o.zoneId === selectedDrillZone.zoneId)
                        .map((ord) => (
                          <div
                            key={ord._id}
                            className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center hover:border-emerald-500 transition cursor-pointer"
                            onClick={() => {
                              setSelectedDrillOrder(ord);
                              setDrillDownLevel("ORDER");
                            }}
                          >
                            <div>
                              <span className="font-mono font-bold text-emerald-300">
                                Order #{String(ord._id).substring(String(ord._id).length - 6).toUpperCase()}
                              </span>
                              <span className="ml-2 text-slate-300">👤 {ord.customerName} ({ord.phone})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-900 px-2.5 py-1 rounded font-bold text-xs text-white">
                                {ord.status}
                              </span>
                              <span className="text-emerald-400 font-bold">Inspect Order →</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {drillDownLevel === "ORDER" && selectedDrillOrder && (
                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-400">
                          Order #{String(selectedDrillOrder._id).substring(String(selectedDrillOrder._id).length - 6).toUpperCase()}
                        </h4>
                        <p className="text-slate-300 mt-0.5">
                          Customer: {selectedDrillOrder.customerName} • Address: {selectedDrillOrder.address} ({selectedDrillOrder.pincode})
                        </p>
                      </div>
                      <span className="bg-emerald-500 text-slate-950 font-black px-3 py-1 rounded-full text-xs">
                        ₹{selectedDrillOrder.totalAmount}
                      </span>
                    </div>

                    <p className="font-bold text-slate-300">Line Items & Produce Fulfillment:</p>
                    <div className="space-y-1.5">
                      {selectedDrillOrder.products?.map((prod: any, idx: number) => (
                        <div key={idx} className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex justify-between">
                          <span>{prod.name} x{prod.qty} ({prod.unit})</span>
                          <span className="text-emerald-400 font-bold">{prod.fulfillmentStatus || "Pending"}</span>
                        </div>
                      ))}
                    </div>

                    {selectedDrillOrder.auditLog && (
                      <div className="pt-2">
                        <p className="font-bold text-slate-300 mb-1">Audit Event History Log:</p>
                        <ul className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                          {selectedDrillOrder.auditLog.map((log: any, lIdx: number) => (
                            <li key={lIdx} className="text-slate-400">
                              <strong className="text-white">[{log.stage}]</strong> {log.remarks} ({log.updatedBy})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 1: PRODUCT CATALOG MANAGEMENT (PHASE 4) */}
      {activeTab === "catalog" && (

        <div className="space-y-6">
          {/* Top Actions & Category Filter Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Today's Harvest & Organic Produce Catalog</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Toggle daily availability, set stock ceilings, configure substitute produce items, and set prices.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Category Pills */}
              <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-bold">
                {["All", "VEGETABLE", "DAIRY", "FRUIT", "OTHER"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded transition ${
                      selectedCategory === cat ? "bg-emerald-700 text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  resetProductForm();
                  setShowProductModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3.5 rounded-lg transition shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <span>➕</span> Add Product
              </button>
            </div>
          </div>

          {/* Catalog Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                Catalog Items ({filteredProducts.length} Items Listed)
              </h3>
              <button onClick={fetchProducts} className="text-xs text-emerald-600 font-semibold hover:underline">
                ↻ Refresh Catalog
              </button>
            </div>

            {loadingProducts ? (
              <div className="p-8 text-center text-slate-400">Loading catalog items...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No items match the selected category.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Product & Category</th>
                      <th className="p-3">Price & Unit</th>
                      <th className="p-3">Daily Stock Ceiling</th>
                      <th className="p-3">Today's Harvest Availability</th>
                      <th className="p-3">Substitute Item</th>
                      <th className="p-3">Subscription</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod._id} className="hover:bg-slate-50 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-base">
                                🥦
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{prod.name}</p>
                              <span className="inline-block bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200 uppercase mt-0.5">
                                {prod.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-extrabold text-slate-900 text-sm">
                          ₹{prod.price} <span className="text-slate-400 text-xs font-normal">/ {prod.unit}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {prod.dailyStockCeiling} {prod.unit} / day
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleAvailability(prod._id)}
                            className={`px-3 py-1 rounded-full font-bold text-[10px] transition flex items-center gap-1.5 ${
                              prod.isAvailableToday
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm"
                                : "bg-amber-100 text-amber-800 border border-amber-300 opacity-70"
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${prod.isAvailableToday ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                            {prod.isAvailableToday ? "HARVEST AVAILABLE" : "UNAVAILABLE TODAY"}
                          </button>
                        </td>
                        <td className="p-3">
                          {prod.substituteProductId ? (
                            <div className="bg-blue-50 border border-blue-200 text-blue-900 p-1.5 rounded text-[11px]">
                              <p className="font-bold">↳ {prod.substituteProductId.name}</p>
                              <p className="text-[10px] text-blue-600">₹{prod.substituteProductId.price} / {prod.substituteProductId.unit}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No substitute set</span>
                          )}
                        </td>
                        <td className="p-3">
                          {prod.isSubscriptionEligible ? (
                            <span className="bg-purple-50 text-purple-700 font-bold text-[10px] px-2 py-0.5 rounded border border-purple-200">
                              {prod.subscriptionDiscount}% Disc. Subs
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">One-Time Only</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditProductModal(prod)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-bold transition text-[11px]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id, prod.name)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded font-bold transition text-[11px]"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DELIVERY ZONES & PINCODE SERVICEABILITY */}
      {activeTab === "zones" && (
        <div className="space-y-6">
          {/* Top Actions & Pincode Tester */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Create Button & Stat */}
            <div className="lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-base mb-1">Delivery Zone Network</h2>
                <p className="text-slate-500 text-xs">
                  Configure cutoff times, dispatch deadlines, and pincode mapping for same-night harvest routing.
                </p>
              </div>
              <button
                onClick={() => {
                  resetZoneForm();
                  setShowZoneModal(true);
                }}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>➕</span> Create New Delivery Zone
              </button>
            </div>

            {/* Pincode Lookup Tester */}
            <div className="lg:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h2 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                <span>🔍</span> Pincode Serviceability Lookup Tool
              </h2>
              <p className="text-slate-500 text-xs mb-3">
                Test any pincode to check which active delivery zone handles its 7 AM morning deliveries.
              </p>

              <form onSubmit={handleTestPincode} className="flex gap-2">
                <input
                  type="text"
                  value={testPincode}
                  onChange={(e) => setTestPincode(e.target.value)}
                  placeholder="e.g. 226010 or 226001"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  disabled={testingLookup}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
                >
                  {testingLookup ? "Searching..." : "Check Serviceability"}
                </button>
              </form>

              {lookupResult && (
                <div
                  className={`mt-3 p-3 rounded-lg border text-xs ${
                    lookupResult.serviceable
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <p className="font-bold">{lookupResult.message}</p>
                  {lookupResult.zone && (
                    <div className="mt-1 flex flex-wrap gap-4 text-[11px] text-emerald-700">
                      <span>Cutoff: <strong>{lookupResult.zone.cutoffTime} PM</strong></span>
                      <span>Dispatch: <strong>{lookupResult.zone.dispatchDeadline} AM</strong></span>
                      <span>Primary Staff: <strong>{lookupResult.zone.primaryStaffId?.name || "Unassigned"}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Zones Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Active Delivery Routes & Pincode Mappings</h3>
              <button onClick={fetchZones} className="text-xs text-emerald-600 font-semibold hover:underline">
                ↻ Refresh List
              </button>
            </div>

            {loadingZones ? (
              <div className="p-8 text-center text-slate-400">Loading delivery zones...</div>
            ) : zones.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p>No delivery zones configured yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Zone Code & Name</th>
                      <th className="p-3">City / Region</th>
                      <th className="p-3">Pincodes Covered</th>
                      <th className="p-3">Cutoff / Dispatch SLA</th>
                      <th className="p-3">Primary Ops Staff</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {zones.map((zone) => (
                      <tr key={zone._id} className="hover:bg-slate-50 transition">
                        <td className="p-3">
                          <span className="font-mono text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                            {zone.zoneCode}
                          </span>
                          <p className="font-bold text-slate-900 mt-1">{zone.name}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-700">{zone.city}</p>
                          <p className="text-slate-400 text-[11px]">{zone.state}</p>
                        </td>
                        <td className="p-3 max-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {zone.pincodeRanges?.map((pin: string, i: number) => (
                              <span key={i} className="bg-emerald-50 text-emerald-800 font-bold text-[10px] px-1.5 py-0.5 rounded border border-emerald-200">
                                {pin}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-700">Cutoff: <strong className="text-slate-900">{zone.cutoffTime} PM</strong></p>
                          <p className="text-slate-500 text-[11px]">Dispatch: <strong className="text-amber-700">{zone.dispatchDeadline} AM</strong></p>
                        </td>
                        <td className="p-3">
                          {zone.primaryStaffId ? (
                            <div>
                              <p className="font-bold text-slate-800">{zone.primaryStaffId.name}</p>
                              <p className="text-slate-400 text-[11px]">{zone.primaryStaffId.email}</p>
                            </div>
                          ) : (
                            <span className="text-amber-600 font-semibold italic text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleZoneStatus(zone._id)}
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              zone.isActive
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-slate-200 text-slate-600 border border-slate-300"
                            }`}
                          >
                            {zone.isActive ? "ACTIVE" : "INACTIVE"}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => openEditModal(zone)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded font-bold transition text-[11px]"
                          >
                            Edit Zone
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ONBOARD DELIVERY OPS STAFF */}
      {activeTab === "staff" && (
        <div className="max-w-2xl mx-auto bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h2 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
            <span>🚚</span> Onboard Delivery-Ops Staff Account
          </h2>
          <p className="text-slate-500 text-xs mb-4">
            Create field staff credentials and assign them to an active delivery zone route.
          </p>

          {opsMsg && (
            <div className="mb-4 text-xs p-3 rounded-lg bg-white border border-slate-200 font-semibold">
              {opsMsg}
            </div>
          )}

          <form onSubmit={handleCreateOpsAccount} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  value={opsName}
                  onChange={(e) => setOpsName(e.target.value)}
                  placeholder="Ramesh Kumar"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={opsEmail}
                  onChange={(e) => setOpsEmail(e.target.value)}
                  placeholder="ops.gomti@farmfresh.com"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={opsPassword}
                  onChange={(e) => setOpsPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={opsPhone}
                  onChange={(e) => setOpsPhone(e.target.value)}
                  placeholder="+91 98765 00002"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Assign to Delivery Zone Route</label>
              <select
                value={opsZoneId}
                onChange={(e) => setOpsZoneId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                <option value="">-- Select Zone Route (Optional) --</option>
                {zones.map((z) => (
                  <option key={z._id} value={z._id}>
                    {z.name} ({z.zoneCode}) - {z.city}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={creatingOps}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {creatingOps ? "Creating Ops Account..." : "Onboard Delivery-Ops Staff"}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: ORDERS OVERSIGHT */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Platform Incoming Orders</h3>
            <button onClick={fetchOrders} className="text-xs text-emerald-600 font-semibold hover:underline">
              ↻ Refresh Orders
            </button>
          </div>

          {loadingOrders ? (
            <div className="p-8 text-center text-slate-400">Loading platform orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No customer orders recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{order.customerName}</p>
                        <p className="text-slate-500 text-[11px]">{order.phone}</p>
                      </td>
                      <td className="p-3 font-bold text-emerald-700">₹{order.totalAmount}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                          {order.orderType}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {order.status}
                        </span>
                        {order.deliveryProofPhoto && (
                          <button
                            onClick={() => setViewProofPhotoUrl(order.deliveryProofPhoto)}
                            className="mt-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[9px] px-2 py-0.5 rounded border border-emerald-300 transition block"
                          >
                            📸 View Proof
                          </button>
                        )}
                      </td>

                    </tr>

                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DISPATCH ROUTING & ZONE QUEUES (PHASE 7) */}
      {activeTab === "dispatch" && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg flex justify-between items-center">
            <div>
              <h2 className="font-extrabold text-base flex items-center gap-2">

                <span>🚚</span> Automated Dispatch Routing & Zone Capacity Control
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Auto-assigned by pincode • 9:30 PM Cutoff Dispatch Queues • Staff Allocation Oversight
              </p>
            </div>

            <button
              onClick={fetchDispatchSummary}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl transition"
            >
              ↻ Refresh Routing Queues
            </button>
          </div>

          {dispatchMsg && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
              {dispatchMsg}
            </div>
          )}

          {/* Zone Routing Capacity Cards */}
          {loadingDispatch ? (
            <div className="p-8 text-center text-slate-400">Loading dispatch summary...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dispatchSummary?.zonesSummary?.map((item: any) => (
                <div key={item.zone._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                        {item.zone.zoneCode}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{item.zone.name}</h4>
                    </div>
                    <span className="text-xs font-black text-emerald-700">{item.orderCount} Orders</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Staff: <strong>{item.zone.primaryStaffId?.name || "Unassigned Staff"}</strong>
                  </p>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>Capacity Utilization</span>
                      <span>{item.capacityUtilizationPercent}% ({item.orderCount}/{item.zone.dailyCapacity || 100})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${item.capacityUtilizationPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orders Routing Table & Admin Zone Reassignment */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Zone Route Assignments & Admin Override</h3>
              <span className="text-xs text-slate-500 font-semibold">{orders.length} Total Orders Routed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer & Contact</th>
                    <th className="p-3">Address & Pincode</th>
                    <th className="p-3">Current Assigned Zone Route</th>
                    <th className="p-3">Admin Manual Zone Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        #{String(order._id).substring(String(order._id).length - 6).toUpperCase()}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{order.customerName}</p>
                        <p className="text-slate-500 text-[11px]">{order.phone}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-slate-700">{order.address}</p>
                        <span className="font-mono text-emerald-700 font-bold text-[11px]">
                          Pincode: {order.pincode}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                          {order.zoneId?.name || "Unassigned Route"} ({order.zoneId?.zoneCode || "NONE"})
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={order.zoneId?._id || ""}
                          onChange={(e) => handleReassignZone(order._id, e.target.value)}
                          className="p-1.5 rounded-lg border border-slate-300 text-slate-900 font-semibold text-xs bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                        >
                          <option value="">-- Reassign Route Zone --</option>
                          {zones.map((z) => (
                            <option key={z._id} value={z._id}>
                              {z.name} ({z.zoneCode})
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ALL CUSTOMER ORDERS MANAGEMENT & LIFECYCLE TRACKING ENGINE (PHASE 8 & 9) */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Full Order Lifecycle Command
              </span>
              <h2 className="text-2xl font-black mt-1">📦 Customer Order Management & Tracking</h2>
              <p className="text-xs text-slate-300 mt-1">
                Real-time harvest, packing, dispatch, delivery SLA compliance, and stage overrides.
              </p>
            </div>

            <button
              onClick={fetchOrders}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md"
            >
              ↻ Refresh Orders
            </button>
          </div>

          {adminOrderMsg && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
              {adminOrderMsg}
            </div>
          )}

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 mr-1">Status Filter:</span>
            {["ALL", "Placed", "Cutoff Locked", "Harvested", "Packed", "Out for Delivery", "Delivered", "Cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  orderStatusFilter === st
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {loadingOrders ? (
            <div className="p-12 text-center text-slate-400 font-bold">Loading customer orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
              No customer orders recorded in system.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <ul className="divide-y divide-slate-100">
                {orders
                  .filter((o) => orderStatusFilter === "ALL" || o.status === orderStatusFilter)
                  .map((order) => {
                    const stages = ["Placed", "Cutoff Locked", "Harvested", "Packed", "Out for Delivery", "Delivered"];
                    const currentStageIdx = stages.indexOf(order.status);

                    return (
                      <li key={order._id} className="p-5 hover:bg-slate-50/80 transition space-y-4">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-slate-900 text-sm">
                                Order #{String(order._id).substring(String(order._id).length - 6).toUpperCase()}
                              </span>
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
                              {order.isOnTimeDelivery && order.status === "Delivered" && (
                                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                                  ✅ 7 AM SLA Compliant
                                </span>
                              )}
                              {order.isSubscriptionGenerated && (
                                <span className="bg-purple-100 text-purple-800 font-bold text-[10px] px-2 py-0.5 rounded border border-purple-200">
                                  Subscription Batch
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 font-bold mt-1">
                              👤 Customer: {order.customerName} ({order.phone})
                            </p>
                            <p className="text-xs text-slate-500">
                              📍 Address: {order.address} — <strong>Pincode {order.pincode}</strong> (Route: {order.zoneId?.name || "Standard Zone"})
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivery SLA Target</span>
                            <span className="font-bold text-emerald-700 text-xs">
                              {new Date(order.deliveryDate).toLocaleDateString()} (07:00 AM)
                            </span>
                            <span className="font-black text-slate-900 text-base block mt-0.5">
                              ₹{order.totalAmount}
                            </span>
                          </div>
                        </div>

                        {/* Lifecycle Progress Stepper */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Morning Delivery Lifecycle Progress:</p>
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            {stages.map((stg, sIdx) => {
                              const isDone = sIdx <= currentStageIdx && order.status !== "Cancelled" && order.status !== "Failed Delivery";
                              return (
                                <div key={stg} className="flex flex-col items-center flex-1 text-center">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                                      isDone ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-200 text-slate-500"
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

                        {/* Produce Line Items & Fulfillment Action Controls */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                          <p className="text-[11px] font-bold text-slate-600 uppercase">Dispatch Packing List & Line-Item Operations:</p>
                          <div className="space-y-2">
                            {order.products?.map((p: any, i: number) => (
                              <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                                <div>
                                  <span className="font-bold text-slate-900">{p.name}</span>
                                  <span className="text-slate-500 font-bold ml-1">x{p.qty} ({p.unit}) — ₹{p.price}</span>
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

                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleAdminItemFulfillment(order._id, i, "Harvested")}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] px-2.5 py-1 rounded border border-emerald-200 transition"
                                  >
                                    Harvested 🥦
                                  </button>
                                  <button
                                    onClick={() => handleAdminItemFulfillment(order._id, i, "Packed")}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] px-2.5 py-1 rounded border border-blue-200 transition"
                                  >
                                    Packed 📦
                                  </button>
                                  <button
                                    onClick={() => handleAdminSubstitute(order._id, i)}
                                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-1 rounded border border-amber-200 transition"
                                  >
                                    Substitute 🔄
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Admin Stage Override Action Bar */}
                          <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-200">
                            <button
                              onClick={() => handleAdminCutoffLock(order._id)}
                              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                            >
                              Lock Cutoff (9:30 PM) 🔒
                            </button>
                            <button
                              onClick={() => handleAdminDispatch(order._id)}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                            >
                              Out for Delivery 🚚
                            </button>
                            <button
                              onClick={() => handleAdminDeliver(order._id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                            >
                              Mark Delivered 🏡 (7 AM SLA)
                            </button>
                            <button
                              onClick={() => handleAdminCancel(order._id)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-red-200 transition"
                            >
                              Cancel Order ❌
                            </button>
                          </div>
                        </div>

                        {/* Audit Log Timeline Events */}
                        {order.auditLog && order.auditLog.length > 0 && (
                          <details className="text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600">
                            <summary className="font-bold text-slate-800 cursor-pointer text-[11px]">
                              📜 View Order Audit Timeline ({order.auditLog.length} events logged)
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

      {/* TAB 6: QUALITY CLAIMS & WALLET REFUNDS (PHASE 9) */}
      {activeTab === "claims" && (

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg flex justify-between items-center">
            <div>
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <span>🛡️</span> Customer Quality Claims & Wallet Refund Resolution Engine
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                100% Quality Guarantee • Instant Wallet Credits • Replacement & Refund Management
              </p>
            </div>

            <button
              onClick={fetchAllIssues}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl transition"
            >
              ↻ Refresh Claims
            </button>
          </div>

          {issuesMsg && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
              {issuesMsg}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Customer Reported Quality Issue Claims</h3>
              <span className="text-xs text-slate-500 font-semibold">{allIssues.length} Total Claims Recorded</span>
            </div>

            {loadingIssues ? (
              <div className="p-8 text-center text-slate-400 font-bold">Loading quality claims...</div>
            ) : allIssues.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No customer quality issue claims recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Claim ID & Date</th>
                      <th className="p-3">Customer & Contact</th>
                      <th className="p-3">Product SKU & Defect</th>
                      <th className="p-3">Status & Credit</th>
                      <th className="p-3">Admin Resolution Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allIssues.map((issue) => (
                      <tr key={issue._id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-900 block">
                            #{String(issue._id).substring(String(issue._id).length - 6).toUpperCase()}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{issue.user?.name || "Customer"}</p>
                          <p className="text-slate-500 text-[11px]">{issue.user?.email}</p>
                          <p className="text-emerald-700 text-[10px] font-bold">
                            Wallet: ₹{issue.user?.walletBalance || 0}
                          </p>
                        </td>

                        <td className="p-3">
                          <p className="font-bold text-slate-900">{issue.productName}</p>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                            {issue.issueType}
                          </span>
                          <p className="text-slate-600 text-[11px] mt-1">"{issue.description}"</p>
                          {issue.photoUrl && (
                            <button
                              onClick={() => setViewPhotoUrl(issue.photoUrl)}
                              className="mt-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition shadow-sm flex items-center gap-1"
                            >
                              <span>📷 View Photo Evidence</span>
                            </button>
                          )}
                        </td>


                        <td className="p-3">
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
                          {issue.refundAmount > 0 && (
                            <p className="font-black text-emerald-700 text-xs mt-1">
                              +₹{issue.refundAmount} Wallet Credit
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => handleResolveClaim(issue._id, "WALLET_CREDIT", 150)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded transition"
                            >
                              Grant Wallet Credit 💳
                            </button>
                            <button
                              onClick={() => handleResolveClaim(issue._id, "REPLACEMENT", 0)}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-2.5 py-1 rounded transition"
                            >
                              Replacement 🔄
                            </button>
                            <button
                              onClick={() => handleResolveClaim(issue._id, "REJECTED", 0)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] px-2.5 py-1 rounded border border-red-200 transition"
                            >
                              Reject ❌
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: FULL SYSTEM AUDIT LOGS VIEWER (PHASE 12) */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>📜</span> Platform Security Audit Trail & Event Logs
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Immutable audit records tracking administrative, fulfillment, product, and financial refund actions across staff identities.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="p-2 border rounded-xl text-xs bg-slate-50 border-slate-300 text-slate-900"
                />
                <button
                  onClick={fetchAuditLogs}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition"
                >
                  ↻ Refresh Logs
                </button>
              </div>
            </div>

            {loadingAuditLogs ? (
              <div className="p-12 text-center text-slate-400 font-bold">Loading security audit records...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-semibold">No audit logs recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Staff / Actor</th>
                      <th className="p-3">Action Event</th>
                      <th className="p-3">Target Entity</th>
                      <th className="p-3">Details & Audit Remarks</th>
                      <th className="p-3 text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditLogs
                      .filter((log: any) => {
                        if (!auditSearch) return true;
                        const term = auditSearch.toLowerCase();
                        return (
                          log.actorName?.toLowerCase().includes(term) ||
                          log.action?.toLowerCase().includes(term) ||
                          log.details?.toLowerCase().includes(term)
                        );
                      })
                      .map((log: any) => (
                        <tr key={log._id} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-500 font-mono text-[11px] shrink-0 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{log.actorName}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">{log.actorRole}</span>
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded border border-slate-700">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">
                            {log.targetEntity} {log.targetId ? `#${String(log.targetId).substring(String(log.targetId).length - 6).toUpperCase()}` : ""}
                          </td>
                          <td className="p-3 text-slate-600 max-w-xs leading-snug">
                            {log.details}
                          </td>
                          <td className="p-3 text-right font-mono text-[11px] text-slate-400">
                            {log.ipAddress || "127.0.0.1"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PHASE 13 MOCK PAYMENT GATEWAY API & DB SYNC AUDIT LOGS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>💳</span> Mock Payment Gateway API Settlement & DB Sync Logs
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Real-time transaction settlement request/response payloads, gateway authorization codes, and database payment status sync.
                </p>
              </div>
              <button
                onClick={fetchPaymentTransactions}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition"
              >
                ↻ Refresh Gateway Logs
              </button>
            </div>

            {loadingPaymentTxs ? (
              <div className="p-8 text-center text-slate-400 font-bold">Loading payment gateway transactions...</div>
            ) : paymentTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-semibold">No mock payment transactions logged yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Transaction ID</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Gateway Status</th>
                      <th className="p-3 text-right">DB Sync Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paymentTransactions.map((tx: any) => (
                      <tr key={tx._id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{tx.user?.name || "Customer"}</span>
                          <span className="text-[10px] text-slate-400">{tx.user?.email}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800 text-[11px]">
                          {tx.transactionId}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-800 font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200">
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3 font-black text-emerald-700 text-sm">
                          ₹{tx.amount}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.status === "SUCCESS"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-red-100 text-red-700 border border-red-200"
                            }`}
                          >
                            {tx.status} {tx.gatewayAuthCode ? `(${tx.gatewayAuthCode})` : ""}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="bg-purple-50 text-purple-700 font-bold text-[10px] px-2 py-0.5 rounded border border-purple-200">
                            {tx.syncStatus || "SYNCED"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}





      {/* CREATE / EDIT PRODUCT MODAL (PHASE 4) */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingProduct ? "Edit Catalog Item" : "Add New Organic Product"}
              </h3>
              <button onClick={resetProductForm} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
                ✕
              </button>
            </div>

            {prodMsg && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold">
                {prodMsg}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Farm Organic Fresh Milk"
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  >
                    <option value="VEGETABLE">VEGETABLE</option>
                    <option value="DAIRY">DAIRY</option>
                    <option value="FRUIT">FRUIT</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Unit of Measure *</label>
                  <select
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="piece">piece</option>
                    <option value="pack">pack</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="45"
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Daily Stock Ceiling *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="50"
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Substitute Product Mapping (Optional)
                </label>
                <select
                  value={prodSubstitute}
                  onChange={(e) => setProdSubstitute(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                >
                  <option value="">-- No Substitute Mapping --</option>
                  {products
                    .filter((p) => !editingProduct || p._id !== editingProduct._id)
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (₹{p.price}/{p.unit})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Surfaced by AI if supply shortfall occurs at 9:30 PM cutoff.</p>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1 flex items-center justify-between">
                  <span>📸 Upload Product Image *</span>
                  {prodImage && (
                    <button
                      type="button"
                      onClick={() => setProdImage("")}
                      className="text-red-600 hover:underline text-[11px] font-bold"
                    >
                      Remove Photo
                    </button>
                  )}
                </label>

                {prodImage ? (
                  <div className="relative w-full h-36 bg-slate-900 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center p-2">
                    <img src={prodImage} alt="Product Preview" className="max-h-32 w-auto object-contain rounded" />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center transition bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <label htmlFor="product-image-upload" className="cursor-pointer flex flex-col items-center gap-1">
                      <span className="text-2xl">📸</span>
                      <span className="font-bold text-slate-800 text-xs">Click to Select Product Image File</span>
                      <span className="text-[10px] text-slate-400">Supports PNG, JPG, WebP (Max 5MB)</span>
                    </label>
                  </div>
                )}

                <div className="mt-2">
                  <input
                    type="text"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="w-full p-1.5 rounded-lg border border-slate-300 text-slate-900 text-[11px]"
                  />
                </div>
              </div>


              <div>
                <label className="block text-slate-600 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="100% organic, pesticide-free fresh farm harvest."
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodSubEligible}
                    onChange={(e) => setProdSubEligible(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800">Subscription Eligible</span>
                </label>

                {prodSubEligible && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-slate-600">Discount:</span>
                    <input
                      type="number"
                      value={prodSubDiscount}
                      onChange={(e) => setProdSubDiscount(e.target.value)}
                      className="w-14 p-1 text-center rounded border border-slate-300 font-bold text-slate-900"
                    />
                    <span>%</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                >
                  {editingProduct ? "Save Product" : "Add to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ZONE MODAL */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingZone ? "Edit Delivery Zone" : "Create New Delivery Zone"}
              </h3>
              <button onClick={resetZoneForm} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
                ✕
              </button>
            </div>

            {zoneMsg && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold">
                {zoneMsg}
              </div>
            )}

            <form onSubmit={handleSaveZone} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Zone Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingZone}
                    value={zoneCode}
                    onChange={(e) => setZoneCode(e.target.value)}
                    placeholder="ZN-LKO-04"
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Zone Route Name *</label>
                  <input
                    type="text"
                    required
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    placeholder="Lucknow - Indira Nagar Route"
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lucknow"
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Pincodes Covered (Comma Separated) *
                </label>
                <input
                  type="text"
                  required
                  value={pincodes}
                  onChange={(e) => setPincodes(e.target.value)}
                  placeholder="226016, 226020, 226024"
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Orders from these pincodes will auto-route to this zone.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Cutoff Time</label>
                  <input
                    type="text"
                    value={cutoffTime}
                    onChange={(e) => setCutoffTime(e.target.value)}
                    placeholder="21:30"
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Dispatch SLA</label>
                  <input
                    type="text"
                    value={dispatchDeadline}
                    onChange={(e) => setDispatchDeadline(e.target.value)}
                    placeholder="04:30"
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Daily Cap</label>
                  <input
                    type="number"
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(e.target.value)}
                    placeholder="100"
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetZoneForm}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                >
                  {editingZone ? "Save Changes" : "Create Delivery Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHASE 14 DOORSTEP DELIVERY PROOF PHOTO VIEWER MODAL */}
      {viewProofPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-3 border border-slate-700">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>📸</span> Verified Doorstep Delivery Photo Proof (Phase 14)
              </h3>
              <button
                onClick={() => setViewProofPhotoUrl(null)}
                className="text-slate-400 hover:text-slate-900 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>
            <div className="w-full max-h-[70vh] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2">
              <img src={viewProofPhotoUrl} alt="Doorstep Drop Proof" className="max-h-[65vh] w-auto object-contain rounded-lg shadow" />
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setViewProofPhotoUrl(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Close Viewer
              </button>
            </div>
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
    </AppShell>
  );
}


