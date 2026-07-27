"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search, ChevronLeft, ChevronRight, Menu, Heart, ShoppingCart,
  User, ArrowRight, Star, Grid3X3, List,
  MessageCircle, X, Phone, Mail, ChevronDown, Truck,
  CreditCard, Shield, Headphones, Tag, Store,
} from "lucide-react";
import { ProductCard } from "./ProductCard";
import ProfileMenu from "./ProfileMenu";
import CartBadge from "./CartBadge";

interface Product {
  id: string;
  nama: string;
  harga: number;
  size: string | null;
  warna: string | null;
  stok: number;
  kategori: string;
  image_url: string | null;
  created_at: string;
}

interface CatalogPageProps {
  products: Product[];
  initialKategori?: string;
  initialSearch?: string;
  initialPage?: number;
  fetchError?: string | null;
  namaUser?: string | null;
}

const KATEGORI_LIST = ["Semua", "Kaos", "Hoodie", "Jaket", "Celana", "Topi", "Aksesoris"];
const SORT_OPTIONS = ["Terbaru", "Harga Terendah", "Harga Tertinggi", "Terlaris"];
const PRODUK_PER_HALAMAN = 12;

const HERO_SLIDES = [
  { bg: "from-[#D62828] via-[#b91c1c] to-[#7f1d1d]" },
  { bg: "from-[#991b1b] via-[#D62828] to-[#c2410c]" },
  { bg: "from-[#7f1d1d] via-[#991b1b] to-[#D62828]" },
];

const PAYMENT_METHODS = ["QRIS", "OVO", "GoPay", "DANA", "ShopeePay", "LinkAja"];
const SHIPPING_METHODS = ["JNE", "J&T", "SiCepat", "POS Indonesia"];

function formatRupiah(harga: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(harga);
}

/* ── Fade-up animation hook ── */
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; } },
      { threshold: 0.1 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── Floating Contact Button ── */
function FloatingContact() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="mb-2 flex flex-col gap-2 items-end">
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg hover:bg-green-600 transition-all duration-200 hover:scale-105">
            <Phone className="h-4 w-4" /> WhatsApp
          </a>
          <a href="https://instagram.com/qdistro" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg hover:opacity-90 transition-all duration-200 hover:scale-105">
            <Heart className="h-4 w-4" /> Instagram
          </a>
          <a href="mailto:admin@qdistro.id"
            className="flex items-center gap-2 bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105">
            <Mail className="h-4 w-4" /> Email
          </a>
          <button onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-gray-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg hover:bg-gray-600 transition-all duration-200 hover:scale-105">
            <X className="h-4 w-4" /> Tutup
          </button>
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-label="Butuh Bantuan?"
        className="flex items-center gap-2 bg-[#D62828] text-white font-semibold px-4 py-3 rounded-full shadow-xl hover:bg-[#b91c1c] transition-all duration-200 hover:scale-105 active:scale-95">
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm hidden sm:inline">Butuh Bantuan?</span>
      </button>
    </div>
  );
}

const TOTAL_DOTS = 6;

/* ── Hero Banner ── */
function HeroBanner() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % TOTAL_DOTS), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #c0392b 0%, #D62828 40%, #b91c1c 70%, #7f1d1d 100%)",
      }}
    >
      {/* Ornamen kurva kiri */}
      <svg className="absolute left-0 top-0 h-full w-64 opacity-10 pointer-events-none" viewBox="0 0 200 460" preserveAspectRatio="none">
        <ellipse cx="0" cy="230" rx="180" ry="220" fill="white" />
        <ellipse cx="-40" cy="80" rx="120" ry="100" fill="white" />
        <ellipse cx="20" cy="400" rx="100" ry="80" fill="white" />
      </svg>
      {/* Ornamen kurva kanan */}
      <svg className="absolute right-0 top-0 h-full w-64 opacity-10 pointer-events-none" viewBox="0 0 200 460" preserveAspectRatio="none">
        <ellipse cx="200" cy="230" rx="180" ry="220" fill="white" />
        <ellipse cx="240" cy="60" rx="120" ry="100" fill="white" />
        <ellipse cx="180" cy="420" rx="100" ry="80" fill="white" />
      </svg>
      {/* Cahaya melingkar tengah */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
      </div>

      {/* Tombol nav kiri */}
      <button
        onClick={() => setSlide((s) => (s - 1 + TOTAL_DOTS) % TOTAL_DOTS)}
        aria-label="Slide sebelumnya"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white border border-white/30 transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      {/* Tombol nav kanan */}
      <button
        onClick={() => setSlide((s) => (s + 1) % TOTAL_DOTS)}
        aria-label="Slide berikutnya"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white border border-white/30 transition-all duration-200 hover:scale-110"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Konten 3 kolom */}
      <div className="mx-auto max-w-7xl px-14 pt-8 pb-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">

        {/* KOLOM KIRI */}
        <div className="flex flex-col gap-5">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            Q-DISTRO
          </h1>
          <p className="text-red-100 text-base md:text-lg font-medium leading-relaxed">
            Fashion Lokal Berkualitas<br />Mendukung UMKM Indonesia
          </p>
          {/* 3 badge info horizontal sejajar */}
          <div className="flex flex-row items-center gap-4">
            <div className="flex items-center gap-1.5 text-white text-xs font-medium">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span>Produk Original</span>
            </div>
            <div className="flex items-center gap-1.5 text-white text-xs font-medium">
              <Tag className="h-3.5 w-3.5 shrink-0" />
              <span>Harga Terjangkau</span>
            </div>
            <div className="flex items-center gap-1.5 text-white text-xs font-medium">
              <Store className="h-3.5 w-3.5 shrink-0" />
              <span>UMKM Lokal</span>
            </div>
          </div>
          <a
            href="#katalog"
            className="inline-flex items-center gap-2 bg-white text-[#D62828] font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 w-fit text-sm"
          >
            Belanja Sekarang <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* KOLOM TENGAH — mockup combo produk distro */}
        <div className="hidden md:flex items-center justify-center h-full">
          <img
            src="/project/hero-product.png"
            alt="Produk Q-DISTRO"
            className="object-contain max-h-[280px] w-auto"
            loading="eager"
            style={{ filter: "drop-shadow(0 16px 48px rgba(0,0,0,0.6)) brightness(1.05)" }}
          />
        </div>

        {/* KOLOM KANAN — Promo Card */}
        <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col justify-between">
          {/* Badge */}
          <span className="text-[10px] font-black text-white bg-[#D62828] px-3 py-1 rounded-full tracking-wide w-fit mb-3">
            PROMO SPESIAL
          </span>
          {/* Diskon horizontal */}
          <div className="flex flex-row items-baseline gap-3 mb-2">
            <span className="text-xl font-bold text-gray-800">Diskon</span>
            <span className="text-5xl font-black text-red-600 leading-none">20%</span>
          </div>
          {/* Deskripsi */}
          <p className="font-bold text-gray-900 text-sm">Semua Produk Distro</p>
          <p className="text-sm text-gray-600 mt-0.5">Bayar praktis dengan QRIS</p>
          {/* Logo pembayaran — 1 baris wajib */}
          <div className="flex flex-row items-center justify-between gap-1.5 w-full my-3">
            {([
              { label: "QRIS",      bg: "#000000", text: "#ffffff" },
              { label: "OVO",       bg: "#4c3494", text: "#ffffff" },
              { label: "GoPay",     bg: "#00aed6", text: "#ffffff" },
              { label: "DANA",      bg: "#118eea", text: "#ffffff" },
              { label: "SPay",      bg: "#ee4d2d", text: "#ffffff" },
              { label: "LinkAja",   bg: "#e82529", text: "#ffffff" },
            ] as const).map((m) => (
              <span
                key={m.label}
                className="text-[9px] font-black px-1.5 py-1 rounded-md text-center flex-1 whitespace-nowrap"
                style={{ backgroundColor: m.bg, color: m.text }}
              >
                {m.label}
              </span>
            ))}
          </div>
          {/* Periode */}
          <p className="text-xs text-gray-500 text-center mt-2">
            Periode: 26 Jul – 31 Jul 2026
          </p>
        </div>
      </div>

      {/* Dots indikator — 6 bulatan */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`Slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === slide
                ? "bg-white w-6 h-2.5"
                : "bg-white/40 w-2.5 h-2.5 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* ── Feature Section ── */
function FeatureSection() {
  const ref = useFadeUp();
  const features = [
    { icon: <Truck className="h-6 w-6 text-[#D62828]" />, title: "Gratis Ongkir", desc: "Min. Pembelian Rp150.000" },
    { icon: <CreditCard className="h-6 w-6 text-[#D62828]" />, title: "Bayar QRIS", desc: "Cepat, Aman & Mudah" },
    { icon: <Shield className="h-6 w-6 text-[#D62828]" />, title: "Produk Original", desc: "100% Garansi Keaslian" },
    { icon: <Headphones className="h-6 w-6 text-[#D62828]" />, title: "Fast Response", desc: "WhatsApp Admin Aktif" },
  ];
  return (
    <div ref={ref} className="mx-auto max-w-7xl px-6 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((f) => (
          <div key={f.title} className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 px-4 py-4 hover:shadow-md transition-shadow duration-200">
            <div className="shrink-0 bg-red-50 rounded-lg p-2">{f.icon}</div>
            <div>
              <p className="text-sm font-bold text-gray-800">{f.title}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-300 mt-6">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Col 1 — Brand */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-xl font-black text-red-500 mb-2">Q-DISTRO</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Marketplace fashion lokal berkualitas yang mendukung UMKM Indonesia.
          </p>
          <div className="flex gap-2">
            {[
              { icon: <Heart className="h-4 w-4" />, href: "#", label: "Instagram" },
              { icon: <Phone className="h-4 w-4" />, href: "#", label: "WhatsApp" },
              { icon: <MessageCircle className="h-4 w-4" />, href: "#", label: "Facebook" },
              { icon: <Mail className="h-4 w-4" />, href: "#", label: "TikTok" },
            ].map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label}
                className="bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Informasi */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Informasi</h4>
          <ul className="space-y-2 text-sm">
            {["Tentang Kami", "Cara Belanja", "Kebijakan Privasi", "Syarat & Ketentuan"].map((l) => (
              <li key={l}><a href="#" className="text-gray-300 hover:text-white transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Bantuan */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Bantuan</h4>
          <ul className="space-y-2 text-sm">
            {["FAQ", "Panduan Pembayaran", "Pengembalian Barang", "Hubungi Kami"].map((l) => (
              <li key={l}><a href="#" className="text-gray-300 hover:text-white transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Pembayaran */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Pembayaran</h4>
          <div className="flex flex-wrap gap-1.5">
            {([
              { label: "QRIS",      bg: "#000000", text: "#ffffff" },
              { label: "OVO",       bg: "#4c3494", text: "#ffffff" },
              { label: "GoPay",     bg: "#00aed6", text: "#ffffff" },
              { label: "DANA",      bg: "#118eea", text: "#ffffff" },
              { label: "ShopeePay", bg: "#ee4d2d", text: "#ffffff" },
              { label: "LinkAja",   bg: "#e82529", text: "#ffffff" },
            ] as const).map((m) => (
              <span key={m.label}
                className="text-[10px] font-black px-2 py-1 rounded-md"
                style={{ backgroundColor: m.bg, color: m.text }}>
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Q-DISTRO. All rights reserved.
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════
   MAIN CATALOG PAGE
   ══════════════════════════════════════════ */
export function CatalogPage({
  products,
  initialKategori = "Semua",
  initialSearch = "",
  initialPage = 1,
  fetchError = null,
  namaUser = null,
}: CatalogPageProps) {
  const [kategoriAktif, setKategoriAktif] = useState(initialKategori);
  const [queryPencarian, setQueryPencarian] = useState(initialSearch);
  const [halamanSaatIni, setHalamanSaatIni] = useState(initialPage);
  const [sortBy, setSortBy] = useState("Terbaru");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const produkFiltered = products
    .filter((p) => {
      const cocokKategori = kategoriAktif === "Semua" || p.kategori === kategoriAktif;
      const cocokSearch = p.nama.toLowerCase().includes(queryPencarian.toLowerCase());
      return cocokKategori && cocokSearch;
    })
    .sort((a, b) => {
      if (sortBy === "Harga Terendah") return a.harga - b.harga;
      if (sortBy === "Harga Tertinggi") return b.harga - a.harga;
      return 0;
    });

  const totalHalaman = Math.ceil(produkFiltered.length / PRODUK_PER_HALAMAN);
  const indexAwal = (halamanSaatIni - 1) * PRODUK_PER_HALAMAN;
  const produkTampil = produkFiltered.slice(indexAwal, indexAwal + PRODUK_PER_HALAMAN);

  const gridRef = useFadeUp();

  function handleKategori(k: string) { setKategoriAktif(k); setHalamanSaatIni(1); }
  function handleSearch(v: string) { setQueryPencarian(v); setHalamanSaatIni(1); }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center gap-3 md:gap-4">
          {/* Logo */}
          <a href="/" className="text-red-600 font-bold text-xl tracking-tight shrink-0 hover:text-red-700 transition-colors">
            Q-DISTRO
          </a>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari produk, kategori, atau merek..."
              value={queryPencarian}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-2 pr-10 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-red-400 transition-all duration-200"
              aria-label="Cari produk"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4 shrink-0">
            <button aria-label="Wishlist" className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors hidden sm:flex">
              <Heart className="h-5 w-5" />
              <span className="text-sm font-medium">Wishlist</span>
            </button>
            <div className="flex items-center gap-2 text-gray-700 hidden sm:flex">
              <CartBadge />
              <span className="text-sm font-medium">Keranjang</span>
            </div>
            <div className="sm:hidden"><CartBadge /></div>
            <ProfileMenu namaUser={namaUser} />
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {KATEGORI_LIST.map((k) => (
              <button key={k} onClick={() => { handleKategori(k); setMobileMenuOpen(false); }}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${kategoriAktif === k ? "bg-[#D62828] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#D62828] hover:text-[#D62828]"}`}>
                {k}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── HERO BANNER ── */}
      <HeroBanner />

      {/* ── FEATURE SECTION ── */}
      <FeatureSection />

      {/* ── CATALOG SECTION ── */}
      <main id="katalog" className="mx-auto max-w-7xl px-4 md:px-6 pb-12">

        {/* Category Chips + Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          {/* Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {KATEGORI_LIST.map((k) => (
              <button key={k} onClick={() => handleKategori(k)}
                className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 ${kategoriAktif === k
                  ? "bg-[#D62828] text-white shadow-md shadow-red-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#D62828] hover:text-[#D62828]"}`}>
                {k}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none text-sm border border-gray-200 bg-white text-gray-700 rounded-lg pl-3 pr-8 py-2 outline-none focus:border-[#D62828] cursor-pointer">
                {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button onClick={() => setViewMode("grid")} aria-label="Grid view"
              className={`p-2 rounded-lg border transition-colors ${viewMode === "grid" ? "bg-[#D62828] border-[#D62828] text-white" : "bg-white border-gray-200 text-gray-500 hover:border-[#D62828]"}`}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("list")} aria-label="List view"
              className={`p-2 rounded-lg border transition-colors ${viewMode === "list" ? "bg-[#D62828] border-[#D62828] text-white" : "bg-white border-gray-200 text-gray-500 hover:border-[#D62828]"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {fetchError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-red-600 text-sm">
            <p className="font-semibold">Gagal memuat data: {fetchError}</p>
            <p className="text-xs mt-1">Menampilkan data sample sebagai fallback.</p>
          </div>
        )}

        {produkTampil.length === 0 ? (
          <div className="py-24 text-center text-gray-400">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-semibold text-gray-500">Produk tidak ditemukan</p>
            <p className="text-sm mt-1">Coba kata kunci atau kategori lain.</p>
          </div>
        ) : (
          <>
            <div ref={gridRef}
              className={viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                : "flex flex-col gap-4"}>
              {produkTampil.map((produk) => (
                <ProductCard key={produk.id} produk={produk} formatRupiah={formatRupiah} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {totalHalaman > 0 && (
              <div className="flex justify-center items-center gap-2 my-8">
                <button onClick={() => setHalamanSaatIni((h) => Math.max(1, h - 1))} disabled={halamanSaatIni === 1}
                  aria-label="Halaman sebelumnya"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {(() => {
                  const pages: (number | "...")[] = [];
                  if (totalHalaman <= 6) {
                    for (let i = 1; i <= totalHalaman; i++) pages.push(i);
                  } else {
                    pages.push(1, 2, 3);
                    if (halamanSaatIni > 4) pages.push("...");
                    if (halamanSaatIni > 3 && halamanSaatIni < totalHalaman - 1) pages.push(halamanSaatIni);
                    if (halamanSaatIni < totalHalaman - 2) pages.push("...");
                    pages.push(totalHalaman);
                  }
                  return pages.map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">...</span>
                    ) : (
                      <button key={p} onClick={() => setHalamanSaatIni(p as number)}
                        className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg px-3 py-1.5 text-sm font-bold transition-colors shadow-sm ${
                          halamanSaatIni === p
                            ? "bg-red-600 text-white shadow-red-200"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}>
                        {p}
                      </button>
                    )
                  );
                })()}
                <button onClick={() => setHalamanSaatIni((h) => Math.min(totalHalaman, h + 1))} disabled={halamanSaatIni === totalHalaman}
                  aria-label="Halaman berikutnya"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
      <FloatingContact />
    </div>
  );
}
