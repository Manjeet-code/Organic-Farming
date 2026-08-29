"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, API_BASE_URL } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import Logo from "./Logo";

interface AppShellProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  title?: string;
}

export default function AppShell({
  children,
  activeTab = "overview",
  onTabChange,
  title = "Dashboard",
}: AppShellProps) {
  const { user, logout } = useAuth();
  const { totalItems, toggleCart } = useCart();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification State (Phase 10)
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    const token = localStorage.getItem("farmfresh_token");
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.log("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (notifId: string) => {
    const token = localStorage.getItem("farmfresh_token");
    if (!token) return;
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/notifications/${notifId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(data.unreadCount);
    } catch (e) {
      console.log("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("farmfresh_token");
    if (!token) return;
    try {
      await axios.put(
        `${API_BASE_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.log("Failed to mark all notifications as read");
    }
  };



  const role = user?.role || "user";

  const getNavLinks = () => {
    if (role === "admin") {
      return [
        { id: "overview", label: "Analytics & KPIs", icon: "📊" },
        { id: "catalog", label: "Catalog & Stock", icon: "🌾" },
        { id: "zones", label: "Delivery Zones", icon: "📍" },
        { id: "staff", label: "Onboard Staff", icon: "👥" },
        { id: "dispatch", label: "Dispatch Routing", icon: "🚚" },
        { id: "claims", label: "Quality Claims", icon: "🛡️" },
        { id: "orders", label: "All Orders", icon: "📦" },
        { id: "audit", label: "Audit Logs", icon: "📜" },
      ];
    } else if (role === "delivery_ops" || role === "delivery-ops") {

      return [
        { id: "overview", label: "Zone Queue", icon: "🚚" },
        { id: "dispatches", label: "Dispatch Manager", icon: "🛵" },
        { id: "issues", label: "Quality Reports", icon: "⚠️" },
      ];
    } else {
      // Customer
      return [
        { id: "catalog", label: "Storefront Catalog", icon: "🥦" },
        { id: "overview", label: "My Orders & Subs", icon: "🛒" },
        { id: "wallet", label: "Wallet & Billing", icon: "💳" },
        { id: "issues", label: "Report Quality Issue", icon: "🛡️" },
      ];
    }
  };

  const handleNavClick = (linkId: string) => {
    if (onTabChange) {
      onTabChange(linkId);
    }

    if (role === "admin") {
      if (typeof window !== "undefined" && window.location.pathname !== "/admin") {
        router.push("/admin");
      }
    } else if (role === "delivery_ops" || role === "delivery-ops") {
      if (typeof window !== "undefined" && window.location.pathname !== "/dashboard") {
        router.push("/dashboard");
      }
    } else {
      // Customer
      if (linkId === "catalog") {
        if (typeof window !== "undefined" && window.location.pathname !== "/storefront") {
          router.push("/storefront");
        }
      } else if (linkId === "overview" || linkId === "wallet" || linkId === "issues") {
        if (typeof window !== "undefined" && window.location.pathname !== "/dashboard") {
          router.push("/dashboard");
        }
      }
    }
  };

  const navLinks = getNavLinks();


  const getRoleBadge = () => {
    switch (role) {
      case "admin":
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border border-amber-300">Admin</span>;
      case "delivery_ops":
      case "delivery-ops":
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border border-blue-300">Delivery Ops</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border border-emerald-300">Customer</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <CartDrawer />

      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Logo href="/" size="sm" isDark={true} />
              <div className="hidden sm:block pl-3 border-l border-slate-700">
                {getRoleBadge()}
              </div>
            </div>

            {/* Right Profile / Cart / Controls */}
            <div className="flex items-center gap-4">
              {/* Shopping Cart Button (Customer Only) */}
              {role !== "admin" && role !== "delivery_ops" && role !== "delivery-ops" && (
                <button
                  onClick={toggleCart}
                  className="relative bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl transition shadow-md flex items-center gap-2"
                  title="View Morning Harvest Cart"
                >
                  <span className="text-lg">🛒</span>
                  <span className="hidden sm:inline text-xs font-bold">Cart</span>
                  {totalItems > 0 && (
                    <span className="bg-amber-400 text-slate-900 font-black text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}

              {/* Notification Center Bell Icon Button (Phase 10) */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="relative bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-xl border border-slate-700 transition shadow-md flex items-center gap-1.5"
                    title="In-App Notification Center"
                  >
                    <span className="text-lg">🔔</span>
                    {unreadCount > 0 && (
                      <span className="bg-emerald-500 text-slate-950 font-black text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Panel */}
                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-slate-900">
                      <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🔔</span>
                          <span className="font-bold text-sm">Notifications & Alerts</span>
                          {unreadCount > 0 && (
                            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-[11px] text-emerald-400 hover:underline font-bold"
                          >
                            Mark All Read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 font-semibold">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => !notif.isRead && markAsRead(notif._id)}
                              className={`p-3.5 transition cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                                !notif.isRead ? "bg-emerald-50/60 font-semibold" : "opacity-80"
                              }`}
                            >
                              <span className="text-xl shrink-0 mt-0.5">
                                {notif.type === "ORDER_PLACED" && "🥦"}
                                {notif.type === "CUTOFF_REMINDER" && "🔒"}
                                {notif.type === "HARVESTED" && "🥦"}
                                {notif.type === "PACKED" && "📦"}
                                {notif.type === "OUT_FOR_DELIVERY" && "🚚"}
                                {notif.type === "DELIVERED" && "🏡"}
                                {notif.type === "SUBSTITUTION" && "🔄"}
                                {notif.type === "ISSUE_RESOLVED" && "💳"}
                                {notif.type === "ALERT" && "🔔"}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <p className="font-bold text-slate-900 text-xs truncate">{notif.title}</p>
                                  <span className="text-[10px] text-slate-400 shrink-0">
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{notif.message}</p>
                              </div>
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}




              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm"
                >
                  Sign In
                </Link>
              )}


              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-slate-400 hover:text-white p-1"
                aria-label="Toggle Navigation"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  handleNavClick(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === link.id
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-24">
            <div className="px-3 py-2 mb-2 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {role === "admin" ? "Admin Ops" : role === "delivery_ops" ? "Field Ops" : "Customer Portal"}
              </h2>
              {getRoleBadge()}
            </div>
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === link.id
                      ? "bg-emerald-700 text-white shadow-sm font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>


            <div className="mt-8 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-500">
              <p className="font-semibold text-slate-700 mb-1">⏱️ Delivery Cutoff</p>
              <p>Next Morning 7 AM Delivery cutoff locks at <strong>9:30 PM</strong> daily.</p>
            </div>
          </div>
        </aside>

        {/* Workspace Content View */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto text-xs text-slate-500 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 The Farm Brothers — Farm-to-Doorstep Delivery & Subscription Platform</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-800 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-800 transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
