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
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const stokHabis = produk.stok === 0;
  const badges = getBadges(produk);
  const hasDiskon = produk.stok > 0 && produk.stok <= 5 && produk.stok > 3;
  const hargaAsli = hasDiskon ? Math.round(produk.harga * 1.2) : null;
  // Simulasi rating
  const rating = 4.2 + (parseInt(produk.id) % 8) * 0.1;
  const ulasan = 12 + (parseInt(produk.id) % 50);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (stokHabis) return;
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
      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex gap-4 p-3">
        <Link href={`/product/${produk.id}`} className="shrink-0 relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
          <img src={produk.image_url || "/placeholder.jpg"} alt={produk.nama} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
            {badges.map((b) => (
              <span key={b.label} className={`${b.color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5`}>
                {b.icon}{b.label}
              </span>
            ))}
          </div>
        </Link>
        <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
          <div className="flex flex-col gap-1 min-w-0">
            <Link href={`/product/${produk.id}`}>
              <h2 className="text-sm font-semibold text-gray-800 line-clamp-1 hover:text-[#D62828] transition-colors">{produk.nama}</h2>
            </Link>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-500">{rating.toFixed(1)} ({ulasan})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-[#D62828]">{formatRupiah(produk.harga)}</span>
              {hargaAsli && <span className="text-xs text-gray-400 line-through">{formatRupiah(hargaAsli)}</span>}
            </div>
            <p className="text-xs text-gray-400">Stok: {produk.stok} • Terjual {ulasan * 2}+</p>
          </div>
          <button onClick={handleAddToCart} disabled={stokHabis}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${stokHabis ? "bg-gray-100 text-gray-400 cursor-not-allowed" : added ? "bg-green-500 text-white scale-95" : "bg-green-500 hover:bg-green-600 text-white hover:scale-105 active:scale-95"}`}>
            <ShoppingCart className="h-3.5 w-3.5" />
            {stokHabis ? "Stok Habis" : added ? "Ditambahkan!" : "Tambah"}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      <Link href={`/product/${produk.id}`} className="relative block overflow-hidden bg-gray-100 aspect-square">
        <img src={produk.image_url || "/placeholder.jpg"} alt={produk.nama}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {badges.map((b) => (
            <span key={b.label} className={`${b.color} text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1`}>
              {b.icon}{b.label}
            </span>
          ))}
        </div>
        {stokHabis && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">Stok Habis</span>
          </div>
        )}
        {/* Wishlist */}
        <button onClick={handleWishlist} aria-label="Tambah ke wishlist"
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow hover:scale-110 transition-transform duration-150">
          <Heart className={`h-4 w-4 transition-colors ${wishlisted ? "fill-[#D62828] text-[#D62828]" : "text-gray-400"}`} />
        </button>
      </Link>

      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <Link href={`/product/${produk.id}`}>
          <h2 className="line-clamp-2 text-sm font-semibold text-gray-800 leading-snug hover:text-[#D62828] transition-colors">
            {produk.nama}
          </h2>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`h-3 w-3 ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
          ))}
          <span className="text-[11px] text-gray-400 ml-0.5">({ulasan})</span>
        </div>

        {/* Harga */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-base font-black text-[#D62828]">{formatRupiah(produk.harga)}</span>
          {hargaAsli && <span className="text-xs text-gray-400 line-through">{formatRupiah(hargaAsli)}</span>}
        </div>

        {/* Stok & terjual */}
        <p className="text-[11px] text-gray-400">
          {stokHabis ? <span className="text-red-500 font-semibold">Stok habis</span> : `Stok ${produk.stok}`}
          {" · "}Terjual {ulasan * 2}+
        </p>

        <div className="flex-1" />
      </div>

      {/* Tombol */}
      <div className="px-3 pb-3">
        <button onClick={handleAddToCart} disabled={stokHabis}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${stokHabis
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : added
            ? "bg-green-500 text-white scale-95"
            : "bg-green-500 hover:bg-green-600 text-white hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"}`}>
          <ShoppingCart className="h-3.5 w-3.5" />
          {stokHabis ? "Stok Habis" : added ? "Ditambahkan! ✓" : "Tambah ke Keranjang"}
        </button>
      </div>
    </article>
  );
}
