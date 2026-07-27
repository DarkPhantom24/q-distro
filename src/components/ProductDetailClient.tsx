"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/useCart";
import { ProductCard } from "./ProductCard";
import type { Product as ProductType } from "@/app/page";
import {
  Heart,
  Share2,
  Star,
  ShoppingCart,
  Check,
  ShieldCheck,
  Sparkles,
  PackageCheck,
  ScanLine,
  CreditCard,
  CircleDollarSign,
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

const SIZES = ["S", "M", "L", "XL", "XXL"];
const WARNA_LIST = ["Hitam", "Putih", "Abu-abu", "Navy"];

const PAYMENT_METHODS = [
  { name: "QRIS", icon: ScanLine, color: "text-slate-900" },
  { name: "OVO", icon: CircleDollarSign, color: "text-violet-600" },
  { name: "GoPay", icon: CreditCard, color: "text-cyan-500" },
  { name: "DANA", icon: CreditCard, color: "text-blue-600" },
  { name: "ShopeePay", icon: CircleDollarSign, color: "text-orange-500" },
  { name: "LinkAja", icon: ScanLine, color: "text-rose-500" },
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
  const { addToCart } = useCart();

  const images = [produk.image_url, produk.image_url, produk.image_url].filter(Boolean) as string[];
  const displayImages = images.length > 0 ? images : ["/placeholder.jpg"];
  const thumbnailImages = Array.from({ length: 5 }, (_, index) => displayImages[index % displayImages.length]);
  const activeImageSrc = thumbnailImages[0] ?? displayImages[0];
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);

  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedWarna, setSelectedWarna] = useState("Hitam");

  const [qty, setQty] = useState(1);
  const stokHabis = produk.stok === 0;
  const availableStock = produk.stok || 7;
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
    created_at: new Date().toISOString(),
  })) as ProductType[];

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleAddToCart = () => {
    if (stokHabis) return;
    for (let i = 0; i < qty; i += 1) {
      addToCart({
        id: produk.id.toString(),
        nama: produk.nama,
        harga: produk.harga,
        image_url: produk.image_url,
        stok: produk.stok,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 lg:py-6">
        <div className="mb-4 text-sm text-slate-500">
          <Link href="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900">
            &lt; Beranda
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-500">Kaos</span>
          <span className="mx-2">&gt;</span>
          <span className="font-semibold text-[#D62828]">Kaos Distro Katun Premium</span>
        </div>
        <div className="grid gap-4 xl:grid-cols-12 items-stretch">
          <div className="xl:col-span-5 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm shadow-slate-100 h-full">
            <div className="flex gap-3 items-start">
              <div className="flex flex-col gap-2">
                {thumbnailImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImg(index)}
                    className={`relative h-14 w-14 overflow-hidden rounded-lg border transition ${activeImg === index ? "border-[#D62828]" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="relative flex-none min-w-0 overflow-hidden rounded-2xl bg-slate-50 min-h-[420px]">
                <div className="relative aspect-[4/5] w-full h-full">
                  <Image
                    src={thumbnailImages[activeImg] ?? activeImageSrc}
                    alt={produk.nama}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-full w-full object-cover"
                    priority
                  />
                  <div className="absolute left-3 bottom-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-[#D62828]">
                      <span>🔥</span>
                      Terlaris
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-900">
                      <span className="text-emerald-500">✔</span>
                      100% Original
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-900">
                      <span className="text-orange-500">📦</span>
                      Bahan Premium
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWishlisted((value) => !value)}
                  className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:scale-105"
                >
                  <Heart className={`h-5 w-5 ${wishlisted ? "fill-[#D62828] text-[#D62828]" : "text-slate-500"}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100 h-full flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-[#D62828]">
                  <Sparkles className="h-3 w-3" /> {produk.kategori}
                </p>
                <h1 className="text-base font-semibold tracking-tight text-slate-900 md:text-lg">{produk.nama}</h1>
              </div>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#D62828] hover:text-[#D62828]"
              >
                {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Share2 className="h-5 w-5" />}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
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

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <p className="text-lg font-semibold text-[#D62828]">{formatRupiah(displayPrice)}</p>
              <p className="text-sm text-slate-500 line-through">{formatRupiah(originalPrice)}</p>
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-[#D62828]">-{discountPct}%</span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Stok tersedia ({availableStock})</span>
            </div>

            <div className="mt-3 flex-1 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-900">Pilih Ukuran</p>
                <Link href="#" className="text-sm font-semibold text-[#D62828] hover:text-red-600">
                  Panduan Ukuran
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
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

              <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-900">Pilih Warna</p>
                  <span className="text-sm text-slate-500">Hitam ✔ Tersedia</span>
                </div>
                <div className="flex items-center gap-3">
                  {WARNA_LIST.map((warna) => (
                    <button
                      key={warna}
                      type="button"
                      onClick={() => setSelectedWarna(warna)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${selectedWarna === warna ? "border-[#D62828] bg-[#D62828]/10" : "border-slate-200 bg-white hover:border-[#D62828]"}`}
                    >
                      <span className={`h-5 w-5 rounded-full ${warna === "Putih" ? "border border-slate-300 bg-white" : warna === "Hitam" ? "bg-slate-900" : warna === "Abu-abu" ? "bg-slate-400" : warna === "Navy" ? "bg-slate-800" : "bg-red-600"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stokHabis}
                className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#D62828] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#b91c1c] disabled:bg-slate-200 disabled:text-slate-400"
              >
                <ShoppingCart className="h-4 w-4" />
                {stokHabis ? "Stok Habis" : "Tambah ke Keranjang"}
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

          <aside className="xl:col-span-3 flex h-full flex-col gap-3 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Informasi Produk</h3>
              <div className="grid grid-cols-[1fr_1fr] gap-x-4 text-sm text-slate-700">
                <div className="space-y-3 border-r border-slate-200 pr-3">
                  {[
                    "Kategori",
                    "Material",
                    "Warna",
                    "Ukuran",
                    "Berat",
                    "Brand",
                  ].map((label) => (
                    <p key={label} className="text-sm text-slate-500">{label}</p>
                  ))}
                </div>
                <div className="space-y-3 pl-3">
                  {[
                    "Kaos",
                    "Cotton Combed 30s",
                    "Hitam",
                    "S - XXL",
                    "250 gram",
                    "Q-DISTRO",
                  ].map((value) => (
                    <p key={value} className="text-sm font-semibold text-slate-900">{value}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Keunggulan Produk</h3>
              <div className="space-y-3 text-sm text-slate-700">
                {[
                  "Bahan katun combed premium",
                  "Halus, lembut dan nyaman",
                  "Tidak mudah luntur",
                  "Jahitan rapi dan kuat",
                  "Cocok untuk aktivitas sehari-hari",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2">
                    <span className="mt-1 h-4 w-4 text-[#D62828]">✔</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Metode Pembayaran</h3>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-slate-700">
                {PAYMENT_METHODS.map(({ name, icon: Icon, color }) => (
                  <div key={name} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    {name === "ShopeePay" ? (
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-orange-500 text-[10px] font-bold text-white">S</span>
                    ) : (
                      <Icon className={`h-4 w-4 ${color}`} />
                    )}
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-stretch">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100 md:p-6 h-full flex flex-col">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Ulasan Produk ({ulasanCount})</h2>
                <p className="text-sm text-slate-500">Pendapat pelanggan yang sudah membeli</p>
              </div>
              <Link href="#" className="text-red-600 hover:underline font-medium text-sm">
                Lihat semua
              </Link>
            </div>

            <div className="rounded-xl bg-slate-50/70 p-4 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-red-600">{rating.toFixed(1)}</p>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">dari 25 ulasan</p>
                </div>
                <div className="w-full max-w-xs space-y-2">
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
                        <div className="h-2 rounded-full bg-amber-400" style={{ width: `${Math.max(10, count * 6)}%` }} />
                      </div>
                      <span className="w-10 text-right font-semibold text-slate-700">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex-1 border-t border-gray-100 pt-4">
              {REVIEWS.slice(0, 1).map((review) => (
                <div key={review.id} className="grid grid-cols-[1fr_auto] gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-sm font-bold">{review.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Andi Saputra</p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500">2 hari yang lalu</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{review.komentar}</p>
                  </div>
                  <div className="relative h-20 w-16 overflow-hidden rounded-lg bg-slate-100">
                    <Image src={thumbnailImages[activeImg] ?? activeImageSrc} alt="Review product thumbnail" fill className="h-full w-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100 md:p-6 h-full flex flex-col">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Produk Serupa</h2>
                <p className="text-sm text-slate-500">Pilihan yang cocok dengan style Anda</p>
              </div>
              <Link href="#" className="text-red-600 hover:underline font-medium text-sm">
                Lihat semua
              </Link>
            </div>

            {similarCards.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Tidak ada produk serupa.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {similarCards.slice(0, 4).map((item) => (
                  <div key={item.id} className="h-full rounded-xl bg-slate-50 p-3">
                    <div className="relative w-full overflow-hidden rounded-xl bg-white aspect-[3/4]">
                      <Image src={item.image_url ?? "/placeholder.jpg"} alt={item.nama} fill className="object-cover" />
                    </div>
                    <p className="mt-3 text-[11px] font-semibold text-gray-800 line-clamp-1">{item.nama}</p>
                    <p className="text-red-600 font-bold text-xs my-1">{formatRupiah(item.harga)}</p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <span className="text-amber-400">★</span>
                      <span>4.8</span>
                      <span className="text-slate-400">(143)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700"
        >
          <span className="text-white">💬</span>
          Butuh Bantuan?
        </button>
      </div>
    </div>
  );
}
