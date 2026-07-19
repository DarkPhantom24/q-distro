"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import ProfileMenu from "./ProfileMenu";
import CartBadge from "./CartBadge";

/* ==========================================
   TIPE DATA
   ========================================== */

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

/* ==========================================
   KOMPONEN CATALOG PAGE
   ========================================== */

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

  const kategoriList = ["Semua", "Kaos", "Jaket", "Aksesoris", "Celana"];
  const produkPerHalaman = 8;

  // Filter produk berdasarkan kategori & pencarian
  const produkFiltered = products.filter((produk) => {
    const cocokKategori =
      kategoriAktif === "Semua" || produk.kategori === kategoriAktif;
    const cocokPencarian = produk.nama
      .toLowerCase()
      .includes(queryPencarian.toLowerCase());
    return cocokKategori && cocokPencarian;
  });

  // Pagination
  const totalHalaman = Math.ceil(produkFiltered.length / produkPerHalaman);
  const indexAwal = (halamanSaatIni - 1) * produkPerHalaman;
  const indexAkhir = indexAwal + produkPerHalaman;
  const produkTampil = produkFiltered.slice(indexAwal, indexAkhir);

  // Format harga ke Rupiah
  const formatRupiah = (harga: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(harga);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========================================
          NAVBAR - TOP LEFT
          ======================================== */}
      <nav className="sticky top-0 z-50 bg-[#D62828] shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-white">Q-Distro</h1>

          {/* Ikon Aksi */}
          <div className="flex items-center gap-5">
            {/* Keranjang Belanja */}
            <CartBadge />

            {/* Profil Pengguna */}
            <ProfileMenu namaUser={namaUser} />
          </div>
        </div>
      </nav>

      {/* HEADER SECTION - CENTER */}
      <header className="bg-[#D62828] border-b border-red-800">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">QDistro</h2>
          <p className="text-lg text-red-100">
            Belanja Produk Distro Berkualitas dengan Harga Terjangkau!
          </p>
        </div>
      </header>

      {/* ========================================
          SEARCH BAR & KATEGORI
          ======================================== */}
      <section className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari produk..."
                value={queryPencarian}
                onChange={(e) => {
                  setQueryPencarian(e.target.value);
                  setHalamanSaatIni(1); // Reset ke halaman 1 saat pencarian
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Dropdown Kategori */}
            <div className="md:w-48">
              <select
                value={kategoriAktif}
                onChange={(e) => {
                  setKategoriAktif(e.target.value);
                  setHalamanSaatIni(1); // Reset ke halaman 1 saat kategori berubah
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                {kategoriList.map((kategori) => (
                  <option key={kategori} value={kategori}>
                    {kategori}
                  </option>
                ))}
              </select>
            </div>

            {/* Tombol Search */}
            <button
              type="button"
              onClick={() => {
                setHalamanSaatIni(1);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 active:bg-green-800"
            >
              <Search className="h-4 w-4" />
              Cari
            </button>
          </div>
        </div>
      </section>

      {/* ========================================
          GRID KATALOG PRODUK
          ======================================== */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        {fetchError && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
            <p className="font-medium">Error: {fetchError}</p>
            <p className="text-sm">Menampilkan data sample sebagai fallback.</p>
          </div>
        )}

        {produkTampil.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p className="text-lg font-medium">Produk tidak ditemukan.</p>
            <p className="mt-1 text-sm">Coba kata kunci atau kategori lain.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {produkTampil.map((produk) => (
                <ProductCard
                  key={produk.id}
                  produk={produk}
                  formatRupiah={formatRupiah}
                />
              ))}
            </div>

            {/* ========================================
                PAGINATION - BOTTOM RIGHT
                ======================================== */}
            {totalHalaman > 1 && (
              <div className="mt-8 flex justify-end">
                <div className="flex items-center gap-2">
                  {/* Tombol Previous */}
                  <button
                    type="button"
                    onClick={() => {
                      if (halamanSaatIni > 1) {
                        setHalamanSaatIni(halamanSaatIni - 1);
                      }
                    }}
                    disabled={halamanSaatIni === 1}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                      halamanSaatIni === 1
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Nomor Halaman */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalHalaman }, (_, i) => i + 1).map(
                      (nomor) => (
                        <button
                          key={nomor}
                          type="button"
                          onClick={() => setHalamanSaatIni(nomor)}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                            halamanSaatIni === nomor
                              ? "bg-green-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {nomor}
                        </button>
                      )
                    )}
                  </div>

                  {/* Tombol Next */}
                  <button
                    type="button"
                    onClick={() => {
                      if (halamanSaatIni < totalHalaman) {
                        setHalamanSaatIni(halamanSaatIni + 1);
                      }
                    }}
                    disabled={halamanSaatIni === totalHalaman}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                      halamanSaatIni === totalHalaman
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-label="Halaman berikutnya"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
