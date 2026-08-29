"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Navbar({
  cartCount,
  wishlistCount,
  openCart,
  openWishlist,
  onCategorySelect,
}: {
  cartCount: number;
  wishlistCount: number;
  openCart: () => void;
  openWishlist: () => void;
  onCategorySelect: (category: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-50 flex flex-col shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-800 text-white text-xs md:text-sm font-medium py-2 px-6 flex justify-between items-center">
        <p className="hidden md:block">🌱 The Farm Brothers | 100% Certified Organic</p>
        <p className="mx-auto md:mx-0 font-semibold tracking-wide">
          🚚 Free Next-Day Delivery on all Daily Orders & Subscriptions!
        </p>
        <div className="hidden md:flex gap-4">
          <a href="#" className="hover:text-green-200 transition">Help & Support</a>
          <a href="#" className="hover:text-green-200 transition">Track Order</a>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <Logo href="/" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 font-semibold text-gray-600 text-sm xl:text-base">
            <a href="#home" className="hover:text-green-600 transition duration-300 hover:-translate-y-0.5">Home</a>
            <a href="#products" onClick={() => onCategorySelect("All")} className="hover:text-green-600 transition duration-300 hover:-translate-y-0.5">Products</a>
            <a href="#about" className="hover:text-green-600 transition duration-300 hover:-translate-y-0.5">About</a>
            <a href="#how-it-works" className="hover:text-green-600 transition duration-300 hover:-translate-y-0.5">Process</a>
            <a href="#faq" className="hover:text-green-600 transition duration-300 hover:-translate-y-0.5">FAQ</a>
            <a href="#contact" className="hover:text-green-600 transition duration-300 hover:-translate-y-0.5">Contact</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Account Icon (Placeholder for Login) */}
            {!user ? (
              <Link href="/login" className="text-gray-600 hover:text-green-700 transition flex items-center gap-1 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="text-sm">Sign In</span>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                {user.role === "admin" && (
                  <Link href="/admin" className="text-amber-600 hover:text-amber-700 transition font-bold text-sm bg-amber-50 px-3 py-1.5 rounded-full">
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="text-green-600 hover:text-green-700 transition font-bold text-sm">
                  Dashboard
                </Link>
                <button onClick={logout} className="text-gray-500 hover:text-red-500 transition text-sm">
                  Logout
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200"></div>

            {/* Wishlist */}
            <button
              onClick={openWishlist}
              className="relative text-gray-600 hover:text-red-500 transition"
              aria-label="Wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative bg-green-50 p-2 rounded-full text-green-700 hover:bg-green-100 transition"
              aria-label="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

          {/* Mobile Right Side */}
          <div className="flex md:hidden items-center gap-4">
            {/* Mobile Cart Icon */}
            <button
              onClick={openCart}
              className="relative text-green-700 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 p-1"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full">
            <div className="flex flex-col p-6 gap-4 text-gray-700 font-medium">
              <a href="#home" onClick={() => setMenuOpen(false)} className="hover:text-green-600 py-2 border-b border-gray-50">Home</a>
              <a href="#products" onClick={() => { onCategorySelect("All"); setMenuOpen(false); }} className="hover:text-green-600 py-2 border-b border-gray-50">Products</a>
              <a href="#about" onClick={() => setMenuOpen(false)} className="hover:text-green-600 py-2 border-b border-gray-50">About Us</a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="hover:text-green-600 py-2 border-b border-gray-50">How It Works</a>
              <a href="#faq" onClick={() => setMenuOpen(false)} className="hover:text-green-600 py-2 border-b border-gray-50">FAQ</a>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="hover:text-green-600 py-2 border-b border-gray-50">Contact Us</a>
              
              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={() => {
                    openWishlist();
                    setMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 bg-red-50 text-red-500 py-3 rounded-xl font-semibold border border-red-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  Wishlist ({wishlistCount})
                </button>

                {!user ? (
                  <Link href="/login" className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Sign In
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    {user.role === "admin" && (
                      <Link href="/admin" className="text-center bg-amber-100 text-amber-700 py-3 rounded-xl font-bold">
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/dashboard" className="text-center bg-green-100 text-green-700 py-3 rounded-xl font-bold">
                      Dashboard
                    </Link>
                    <button onClick={logout} className="text-center bg-gray-100 text-gray-700 py-3 rounded-xl font-bold">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}