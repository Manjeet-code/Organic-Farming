"use client";

import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({ href = "/", size = "md", className = "" }: LogoProps) {
  const iconSizeClass =
    size === "sm"
      ? "w-9 h-9 rounded-[14px]"
      : size === "lg"
      ? "w-14 h-14 rounded-[20px]"
      : "w-11 h-11 rounded-[16px]";

  const titleSizeClass =
    size === "sm"
      ? "text-base font-black"
      : size === "lg"
      ? "text-2xl font-black"
      : "text-lg md:text-xl font-black";

  const taglineSizeClass =
    size === "sm"
      ? "text-[9px] font-extrabold mt-0.5"
      : size === "lg"
      ? "text-xs font-extrabold mt-1.5"
      : "text-[10px] md:text-[11px] font-extrabold mt-1";

  const content = (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Soft Mint Green Emblem Badge */}
      <div
        className={`relative ${iconSizeClass} bg-[#eefdf5] border border-[#7ce0ad] p-1.5 shadow-[0_2px_10px_rgba(16,185,129,0.12)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
      >
        <img
          src="/icon.png"
          alt="The Farm Brothers Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Brand Name & Subtext */}
      <div className="flex flex-col justify-center">
        <span
          className={`${titleSizeClass} tracking-tight text-slate-900 leading-none group-hover:text-emerald-800 transition-colors`}
        >
          THE FARM <span className="text-[#00875a]">BROTHERS</span>
        </span>
        <span
          className={`${taglineSizeClass} text-[#00704a] tracking-wider uppercase leading-none`}
        >
          FROM OUR FARM FOR YOUR FAMILY
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="cursor-pointer inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
