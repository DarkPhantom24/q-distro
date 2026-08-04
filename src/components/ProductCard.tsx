"use client";

import { Product as ProductType } from "@/app/page";
import Link from "next/link";
import { useCart } from "@/lib/useCart";
import { Heart, Star, ShoppingCart, Flame } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  produk: ProductType;
  formatRupiah: (harga: number) => string;
  viewMode?: "grid" | "list";
}

function getBadges(produk: ProductType) {
  const badges: { label: string; color: string; icon?: React.ReactNode }[] = [];
  if (produk.stok === 0) return badges;
  const isNew = new Date(produk.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (produk.stok <= 3) badges.push({ label: "Terlaris", color: "bg-orange-500", icon: <Flame className="h-3 w-3" /> });
  else if (isNew) badges.push({ label: "Baru", color: "bg-emerald-500" });
  if (produk.stok > 0 && produk.stok <= 5 && produk.stok > 3) badges.push({ label: "-20%", color: "bg-red-600" });
  return badges;
}

export function ProductCard({ produk, formatRupiah, viewMode = "grid" }: ProductCardProps) {
  const { addToCart, cartItems } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const stokHabis = produk.stok === 0;
  // Qty produk ini yang sudah ada di cart (semua varian size/warna)
  const qtyDiCart = cartItems
    .filter((i) => i.id === produk.id)
    .reduce((s, i) => s + i.quantity, 0);
  const stokTercapai = produk.stok > 0 && qtyDiCart >= produk.stok;
  const isDisabled = stokHabis || stokTercapai;
  const stokSisa = Math.max(0, produk.stok - qtyDiCart);

  const badges = getBadges(produk);
  const hasDiskon = produk.stok > 0 && produk.stok <= 5 && produk.stok > 3;
  const hargaAsli = hasDiskon ? Math.round(produk.harga * 1.2) : null;
  const rating = 4.2 + (parseInt(produk.id) % 8) * 0.1;
  const ulasan = 12 + (parseInt(produk.id) % 50);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isDisabled) return;
    addToCart({ id: produk.id, nama: produk.nama, harga: produk.harga, image_url: produk.image_url, stok: produk.stok });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((w) => !w);
  }

  if (viewMode === "list") {
    return (
      <article className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex gap-3 sm:gap-4 p-2.5 sm:p-3">
        <Link href={`/product/${produk.id}`} className="shrink-0 relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100">
          <img src={produk.image_url || "/placeholder.jpg"} alt={produk.nama} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
            {badges.map((b) => (
              <span key={b.label} className={`${b.color} text-white text-[8px] sm:text-[9px] font-bold px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-md shadow-sm flex items-center gap-0.5`}>
                {b.icon}{b.label}
              </span>
            ))}
          </div>
        </Link>
        <div className="flex flex-1 items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="flex flex-col gap-1 min-w-0">
            <Link href={`/product/${produk.id}`}>
              <h2 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1 hover:text-[#D62828] transition-colors">{produk.nama}</h2>
            </Link>
            <div className="flex items-center gap-1">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] sm:text-xs text-gray-500">{rating.toFixed(1)} ({ulasan})</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-base font-black text-[#D62828]">{formatRupiah(produk.harga)}</span>
              {hargaAsli && <span className="text-[10px] sm:text-xs text-gray-400 line-through">{formatRupiah(hargaAsli)}</span>}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400">Stok: {stokSisa} • Terjual {ulasan * 2}+</p>
          </div>
          <button onClick={handleAddToCart} disabled={isDisabled}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 ${isDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : added ? "bg-green-500 text-white scale-95" : "bg-green-500 hover:bg-green-600 text-white hover:scale-105 active:scale-95"}`}>
            <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {isDisabled ? "Habis" : added ? "Done" : "Tambah"}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <Link href={`/product/${produk.id}`} className="relative block overflow-hidden bg-gray-100 aspect-square">
        <img src={produk.image_url || "/placeholder.jpg"} alt={produk.nama}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {/* Badges - responsive */}
        <div className="absolute top-1 left-1 z-10 flex flex-col gap-0.5">
          {badges.map((b) => (
            <span key={b.label} className={`${b.color} text-white text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-sm flex items-center gap-0.5 sm:gap-1`}>
              {b.icon}{b.label}
            </span>
          ))}
        </div>
        {isDisabled && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">Stok Habis</span>
          </div>
        )}
        {/* Wishlist - responsive */}
        <button onClick={handleWishlist} aria-label="Tambah ke wishlist"
          className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-1.5 shadow hover:scale-110 transition-transform duration-150">
          <Heart className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${wishlisted ? "fill-[#D62828] text-[#D62828]" : "text-gray-400"}`} />
        </button>
      </Link>

      <div className="flex flex-col flex-1 p-2.5 sm:p-3 gap-1.5 sm:gap-2">
        <Link href={`/product/${produk.id}`}>
          <h2 className="line-clamp-2 text-xs sm:text-sm font-semibold text-gray-800 leading-snug hover:text-[#D62828] transition-colors">
            {produk.nama}
          </h2>
        </Link>

        {/* Rating - responsive */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
          ))}
          <span className="text-[9px] sm:text-[11px] text-gray-400 ml-0.5">({ulasan})</span>
        </div>

        {/* Harga - responsive */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-xs sm:text-base font-black text-[#D62828]">{formatRupiah(produk.harga)}</span>
          {hargaAsli && <span className="text-[10px] sm:text-xs text-gray-400 line-through">{formatRupiah(hargaAsli)}</span>}
        </div>

        {/* Stok & terjual - responsive */}
        <p className="text-[9px] sm:text-[11px] text-gray-400">
          {isDisabled ? <span className="text-red-500 font-semibold">Stok habis</span> : `Stok ${stokSisa}`}
          {" · "}Terjual {ulasan * 2}+
        </p>

        <div className="flex-1" />
      </div>

      {/* Tombol - responsive */}
      <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3">
        <button onClick={handleAddToCart} disabled={isDisabled}
          className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 ${isDisabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : added
            ? "bg-green-500 text-white scale-95"
            : "bg-green-500 hover:bg-green-600 text-white hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"}`}>
          <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          {isDisabled ? "Habis" : added ? "Done" : "Tambah ke Keranjang"}
        </button>
      </div>
    </article>
  );
}
