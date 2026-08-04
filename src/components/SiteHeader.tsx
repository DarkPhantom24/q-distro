"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import CartBadge from "./CartBadge";
import ProfileMenu from "./ProfileMenu";

interface SiteHeaderProps {
  namaUser?: string | null;
}

export default function SiteHeader({ namaUser = null }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#D62828] border-b border-[#b91c1c] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center gap-3 md:gap-4">
        <Link href="/" className="text-white font-bold text-xl tracking-tight shrink-0 hover:text-white/80 transition-colors">
          Q-DISTRO
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-4 shrink-0">
          <button aria-label="Wishlist" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors hidden sm:flex">
            <Heart className="h-5 w-5" />
            <span className="text-sm font-medium">Wishlist</span>
          </button>
          <div className="flex items-center gap-2 text-white hover:text-white/80 transition-colors hidden sm:flex">
            <CartBadge />
            <span className="text-sm font-medium">Keranjang</span>
          </div>
          <div className="sm:hidden"><CartBadge /></div>
          <div className="text-white">
            <ProfileMenu namaUser={namaUser} hoverClass="hover:text-white/80" />
          </div>
        </div>
      </div>
    </header>
  );
}
