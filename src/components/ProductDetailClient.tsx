"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/useCart";
import { ProductCard } from "./ProductCard";
import type { Product as ProductType } from "@/app/page";
import {
  Heart,
  Star,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  PackageCheck,
} from "lucide-react";

interface ProductDetail {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga: number;
  size: string | null;
  warna: string | null;
  image_url: string | null;
  created_at: string;
  kategori: string;
  stok: number;
}

interface SimilarProduct {
  id: string;
  nama: string;
  harga: number;
  image_url: string | null;
  kategori: string;
  stok: number;
}

interface Props {
  produk: ProductDetail;
  similarProducts: SimilarProduct[];
}

// Fallback sizes jika admin tidak mengisi ukuran (backward compatibility)
const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];
const DEFAULT_COLORS = ["Hitam", "Putih", "Abu-abu", "Navy"];

const PAYMENT_METHODS = [
  {
    name: "QRIS",
    logo: (
      <svg viewBox="0 0 48 18" fill="none" className="h-5 w-auto">
        <rect width="48" height="18" rx="3" fill="#E00025"/>
        <text x="24" y="13" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="1">QRIS</text>
      </svg>
    ),
  },
  {
    name: "OVO",
    logo: (
      <svg viewBox="0 0 48 18" fill="none" className="h-5 w-auto">
        <rect width="48" height="18" rx="3" fill="#4C3494"/>
        <text x="24" y="13" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="1">OVO</text>
      </svg>
    ),
  },
  {
    name: "GoPay",
    logo: (
      <svg viewBox="0 0 48 18" fill="none" className="h-5 w-auto">
        <rect width="48" height="18" rx="3" fill="#00AED6"/>
        <text x="24" y="13" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="0.5">GoPay</text>
      </svg>
    ),
  },
  {
    name: "DANA",
    logo: (
      <svg viewBox="0 0 48 18" fill="none" className="h-5 w-auto">
        <rect width="48" height="18" rx="3" fill="#118EEA"/>
        <text x="24" y="13" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="1">DANA</text>
      </svg>
    ),
  },
  {
    name: "ShopeePay",
    logo: (
      <svg viewBox="0 0 48 18" fill="none" className="h-5 w-auto">
        <rect width="48" height="18" rx="3" fill="#EE4D2D"/>
        <text x="24" y="13" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="0">ShopeePay</text>
      </svg>
    ),
  },
  {
    name: "LinkAja",
    logo: (
      <svg viewBox="0 0 48 18" fill="none" className="h-5 w-auto">
        <rect width="48" height="18" rx="3" fill="#E82529"/>
        <text x="24" y="13" textAnchor="middle" fill="white" fontSize="8" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="0.3">LinkAja</text>
      </svg>
    ),
  },
];

const REVIEWS = [
  {
    id: 1,
    nama: "Andi S.",
    rating: 5,
    tanggal: "12 Jan 2026",
    komentar: "Bahan tebal dan jahitan rapih, sangat puas dengan produknya.",
    avatar: "A",
  },
  {
    id: 2,
    nama: "Budi R.",
    rating: 4,
    tanggal: "8 Jan 2026",
    komentar: "Warna sesuai katalog, pengiriman cepat dan kemasan rapi.",
    avatar: "B",
  },
];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function ProductDetailClient({ produk, similarProducts }: Props) {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();

  const images = [produk.image_url, produk.image_url, produk.image_url].filter(Boolean) as string[];
  const displayImages = images.length > 0 ? images : ["/placeholder.jpg"];
  const thumbnailImages = Array.from({ length: 5 }, (_, index) => displayImages[index % displayImages.length]);
  const activeImageSrc = thumbnailImages[0] ?? displayImages[0];
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  const detailCardRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [sidebarCorrection, setSidebarCorrection] = useState(0);

  useEffect(() => {
    const sync = () => {
      if (!detailCardRef.current) return;
      const targetH = detailCardRef.current.offsetHeight;
      if (sidebarRef.current) {
        setSidebarCorrection(sidebarRef.current.offsetHeight - targetH);
      }
    };
    sync();
    const raf = requestAnimationFrame(sync);
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sync);
    };
  }, []);

  // Ukuran & warna tersedia dari admin — fallback ke default jika kosong
  const availableSizes = produk.size
    ? [produk.size]  // Ukuran yang admin stock
    : DEFAULT_SIZES;  // Fallback jika admin tidak isi

  const availableColors = produk.warna
    ? [produk.warna]  // Warna yang admin stock
    : DEFAULT_COLORS;  // Fallback jika admin tidak isi

  // Auto-select ukuran & warna jika hanya ada 1 pilihan
  const [selectedSize, setSelectedSize] = useState(() =>
    availableSizes.length === 1 ? availableSizes[0] : (availableSizes[0] || "L")
  );
  const [selectedWarna, setSelectedWarna] = useState(() =>
    availableColors.length === 1 ? availableColors[0] : (availableColors[0] || "Hitam")
  );

  const [qty, setQty] = useState(1);
  const stokHabis = produk.stok === 0;
  const availableStock = produk.stok || 7;

  // Hitung qty produk ini (dengan size+warna yang dipilih) yang sudah ada di cart
  const qtyDiCart = cartItems
    .filter(
      (i) => i.id === produk.id.toString() && i.size === selectedSize && i.warna === selectedWarna
    )
    .reduce((s, i) => s + i.quantity, 0);
  const stokTercapai = produk.stok > 0 && qtyDiCart >= produk.stok;
  const displayPrice = 120000;
  const originalPrice = 150000;
  const discountPct = 20;
  const rating = 4.9;
  const ulasanCount = 187;
  const terjual = 210;
  const productWeight = "250 gram";

  const similarCards = similarProducts.slice(0, 4).map((item) => ({
    id: item.id,
    nama: item.nama,
    harga: item.harga,
    size: null,
    warna: null,
    stok: item.stok,
    kategori: item.kategori,
    image_url: item.image_url,
    created_at: "2026-01-01T00:00:00.000Z", // Fixed timestamp to prevent hydration mismatch
  })) as ProductType[];

  const [toast, setToast] = useState<"success" | null>(null);

  const handleAddToCart = () => {
    if (stokHabis || stokTercapai) return;
    const success = addToCart(
      {
        id: produk.id.toString(),
        nama: produk.nama,
        harga: produk.harga,
        image_url: produk.image_url,
        stok: produk.stok,
        size: selectedSize,
        warna: selectedWarna,
      },
      qty
    );
    if (success) {
      setToast("success");
      window.setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-5 md:px-6 lg:py-6">
        {/* Breadcrumb - responsive */}
        <div className="mb-3 text-xs sm:text-sm text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900">
            &lt; Beranda
          </Link>
          <span className="mx-1 sm:mx-2">&gt;</span>
          <span className="text-slate-500">{produk.kategori}</span>
          <span className="mx-1 sm:mx-2">&gt;</span>
          <span className="font-semibold text-[#D62828] truncate inline-block max-w-[180px] sm:max-w-none">{produk.nama}</span>
        </div>
        {/* Grid: 1 kolom di mobile, 12 kolom di xl */}
        <div className="grid gap-3 sm:gap-4 xl:grid-cols-12 items-stretch">
          {/* Image section - responsive */}
          <div className="xl:col-span-5 rounded-[20px] sm:rounded-[28px] border border-slate-200 bg-white p-2 sm:p-3 shadow-sm shadow-slate-100 flex flex-col">
            <div className="flex gap-2 sm:gap-3 flex-1 min-h-0">
              {/* Thumbnails - hide on smallest mobile */}
              <div className="hidden sm:flex flex-col gap-2 shrink-0 justify-start">
                {thumbnailImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImg(index)}
                    className={`relative h-12 w-12 lg:h-14 lg:w-14 overflow-hidden rounded-lg border transition ${activeImg === index ? "border-[#D62828]" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              {/* Main image - responsive height */}
              <div className="relative flex-1 min-w-0 h-[300px] sm:h-[400px] lg:h-full overflow-hidden rounded-xl sm:rounded-2xl bg-slate-50">
                <Image
                  src={thumbnailImages[activeImg] ?? activeImageSrc}
                  alt={produk.nama}
                  fill
                  sizes="(max-width: 440px) 100vw, (max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                {/* Badges - responsive size & layout */}
                <div className="absolute left-2 bottom-2 sm:left-3 sm:bottom-3 flex flex-wrap items-center gap-1 sm:gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold text-[#D62828]">
                    <span>🔥</span>
                    Terlaris
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold text-slate-900">
                    <span className="text-emerald-500">✔</span>
                    <span className="hidden sm:inline">100% Original</span>
                    <span className="sm:hidden">Original</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-900">
                    <span className="text-orange-500">📦</span>
                    Bahan Premium
                  </span>
                </div>
                {/* Wishlist button - responsive size */}
                <button
                  type="button"
                  onClick={() => setWishlisted((value) => !value)}
                  className="absolute right-2 top-2 sm:right-3 sm:top-3 inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:scale-105"
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${wishlisted ? "fill-[#D62828] text-[#D62828]" : "text-slate-500"}`} />
                </button>
              </div>
            </div>
          </div>

          <div ref={detailCardRef} className="xl:col-span-4 rounded-[20px] sm:rounded-[28px] border border-slate-200 bg-white p-3 sm:p-4 shadow-sm shadow-slate-100 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="mb-1 sm:mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-2 py-1 text-[9px] sm:text-[10px] font-semibold text-[#D62828]">
                  <Sparkles className="h-3 w-3" /> {produk.kategori}
                </p>
                <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900 md:text-lg">{produk.nama}</h1>
              </div>
            </div>

            <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-3 w-3 sm:h-4 sm:w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                ))}
              </div>
              <span className="font-semibold text-slate-900">{rating.toFixed(1)}</span>
              <span className="text-slate-400">•</span>
              <Link href="#reviews" className="font-medium text-[#D62828] underline decoration-[#D62828]/30 decoration-2 underline-offset-4">
                {ulasanCount} ulasan
              </Link>
              <span className="text-slate-400">•</span>
              <span>Terjual {terjual}+</span>
            </div>

            <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 text-sm">
              <p className="text-base sm:text-lg font-semibold text-[#D62828]">{formatRupiah(displayPrice)}</p>
              <p className="text-xs sm:text-sm text-slate-500 line-through">{formatRupiah(originalPrice)}</p>
              <span className="rounded-full bg-red-50 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-[#D62828]">-{discountPct}%</span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${stokHabis || stokTercapai ? "bg-red-500" : "bg-emerald-500"}`} />
              <span>
                {stokHabis || stokTercapai
                  ? "Stok habis"
                  : `Stok tersedia (${availableStock - qtyDiCart})`}
              </span>
            </div>

            <hr className="border-t border-slate-200 mt-3" />

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-900">Pilih Ukuran</p>
                <Link href="#" className="text-sm font-semibold text-[#D62828] hover:text-red-600">
                  Panduan Ukuran
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${selectedSize === size ? "border-[#D62828] bg-[#D62828] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-[#D62828] hover:text-[#D62828]"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <hr className="border-t border-slate-200 !my-3" />

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-900">Pilih Warna</p>
                  <span className="text-sm text-slate-500">
                    {selectedWarna} ✔ Tersedia
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {availableColors.map((warna) => (
                    <button
                      key={warna}
                      type="button"
                      onClick={() => setSelectedWarna(warna)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${selectedWarna === warna ? "border-[#D62828]" : "border-transparent hover:border-slate-300"}`}
                    >
                      <span className={`h-6 w-6 rounded-full ${warna === "Putih" ? "border border-slate-300 bg-white" : warna === "Hitam" ? "bg-slate-900" : warna === "Abu-abu" ? "bg-slate-400" : warna === "Navy" ? "bg-slate-800" : "bg-red-600"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-t border-slate-200 !my-3" />

              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-900">Jumlah</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 text-base font-semibold transition hover:border-slate-300 disabled:opacity-40"
                  >
                    −
                  </button>
                  <div className="flex h-8 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-900">
                    {qty}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(availableStock, q + 1))}
                    disabled={qty >= availableStock}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 text-base font-semibold transition hover:border-slate-300 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stokHabis || stokTercapai}
                className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#D62828] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#b91c1c] disabled:bg-slate-200 disabled:text-slate-400"
              >
                <ShoppingCart className="h-4 w-4" />
                {stokHabis || stokTercapai ? "Stok Habis" : "Tambah ke Keranjang"}
              </button>
              <button
                type="button"
                onClick={() => setWishlisted((value) => !value)}
                className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-[#D62828] bg-white px-3 py-2 text-xs font-semibold text-[#D62828] transition hover:bg-red-50"
              >
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-[#D62828]" : ""}`} />
                {wishlisted ? "Wishlist" : "Tambah Wishlist"}
              </button>
            </div>
          </div>

          {/* Sidebar - responsive: full width on mobile, 3 cols on xl */}
          <aside
            ref={sidebarRef}
            className="xl:col-span-3 flex flex-col text-sm self-start gap-3 sm:gap-2"
          >
            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100 p-3 sm:p-4">
              <h3 className="mb-2 sm:mb-2.5 text-xs font-semibold text-slate-900">Informasi Produk</h3>
              <div className="grid grid-cols-[35%_65%] sm:grid-cols-[40%_60%] gap-x-2 sm:gap-x-3 text-slate-700 items-start">
                <div className="space-y-1 border-r border-slate-200 pr-2 sm:pr-3 text-left">
                  {["Kategori","Material","Warna","Ukuran","Berat","Brand"].map((label) => (
                    <p key={label} className="text-[10px] sm:text-[11px] text-slate-500 leading-[1.65]">{label}</p>
                  ))}
                </div>
                <div className="space-y-1 pl-2 sm:pl-3 text-left">
                  {[produk.kategori, "Cotton Combed 30s", selectedWarna, selectedSize, "250 gram", "Q-DISTRO"].map((value, i) => (
                    <p key={i} className="text-[10px] sm:text-[11px] font-semibold text-slate-900 truncate leading-[1.65]">{value}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100 p-3 sm:p-4">
              <h3 className="mb-2 sm:mb-2.5 text-xs font-semibold text-slate-900">Keunggulan Produk</h3>
              <div className="space-y-1.5 text-slate-700">
                {[
                  "Bahan katun combed premium",
                  "Halus, lembut dan nyaman",
                  "Tidak mudah luntur",
                  "Jahitan rapi dan kuat",
                  "Cocok untuk aktivitas sehari-hari",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-1.5">
                    <span className="flex h-3 w-3 shrink-0 items-center justify-center text-[#D62828] text-[10px]">✔</span>
                    <span className="text-[11px] leading-[1.65]">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100 p-3 sm:p-4">
              <h3 className="mb-2 sm:mb-2.5 text-xs font-semibold text-slate-900">Metode Pembayaran</h3>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {PAYMENT_METHODS.map(({ name, logo }) => (
                  <div key={name} className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-1 sm:p-1.5">
                    <div className="flex items-center justify-center">{logo}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-3 sm:mt-4 grid gap-3 sm:gap-4 xl:grid-cols-[1.1fr_0.9fr] items-stretch">
          <div className="rounded-xl sm:rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm shadow-slate-100">
            <div className="mb-4 sm:mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Ulasan Produk ({ulasanCount})</h2>
                <p className="text-xs text-slate-500">Pendapat pelanggan yang sudah membeli</p>
              </div>
              <Link href="#" className="text-red-600 hover:underline font-medium text-sm">
                Lihat semua
              </Link>
            </div>

            <div className="rounded-xl bg-slate-50/70 px-3 pb-3 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-red-600">{rating.toFixed(1)}</p>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">dari 25 ulasan</p>
                </div>
                <div className="w-full max-w-xs space-y-1">
                  {[
                    { label: "5★", count: 159 },
                    { label: "4★", count: 22 },
                    { label: "3★", count: 4 },
                    { label: "2★", count: 1 },
                    { label: "1★", count: 1 },
                  ].map(({ label, count }) => (
                    <div key={label} className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="w-8 text-right font-medium">{label}</span>
                      <div className="flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${Math.max(10, count * 6)}%` }} />
                      </div>
                      <span className="w-10 text-right font-semibold text-slate-700">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3">
              {REVIEWS.slice(0, 1).map((review) => (
                <div key={review.id} className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-sm font-bold">{review.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Andi Saputra</p>
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500">2 hari yang lalu</p>
                      </div>
                    </div>
                    <p className="text-sm leading-5 text-slate-600">{review.komentar}</p>
                  </div>
                  <div className="relative w-16 self-stretch overflow-hidden rounded-lg bg-slate-100">
                    <Image src={thumbnailImages[activeImg] ?? activeImageSrc} alt="Review product thumbnail" fill className="h-full w-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Produk Serupa</h2>
                <p className="text-xs text-slate-500">Pilihan yang cocok dengan style Anda</p>
              </div>
              <Link href="/" className="text-red-600 hover:underline font-medium text-sm">
                Lihat semua
              </Link>
            </div>

            {similarCards.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Tidak ada produk serupa.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {similarCards.slice(0, 4).map((item) => (
                  <Link key={item.id} href={`/product/${item.id}`} className="h-full rounded-xl bg-slate-50 p-3 block hover:bg-slate-100 transition-colors">
                    <div className="relative w-full overflow-hidden rounded-xl bg-white aspect-[2/3]">
                      <Image src={item.image_url ?? "/placeholder.jpg"} alt={item.nama} fill className="object-cover" />
                    </div>
                    <p className="mt-3 text-[11px] font-semibold text-gray-800 line-clamp-1">{item.nama}</p>
                    <p className="text-red-600 font-bold text-xs my-1">{formatRupiah(item.harga)}</p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <span className="text-amber-400">★</span>
                      <span>4.8</span>
                      <span className="text-slate-400">(143)</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {toast === "success" && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all">
          <span>✔</span>
          <span>{produk.nama} ({selectedSize} · {selectedWarna}) ditambahkan ke keranjang</span>
        </div>
      )}
    </div>
  );
}
