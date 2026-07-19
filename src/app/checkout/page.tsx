"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, X } from "lucide-react";
import Link from "next/link";
import { useCart, CartItem } from "@/lib/useCart";

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
}

/* ==========================================
   HELPER FUNCTIONS
   ========================================== */

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/* ==========================================
   KOMPONEN UTAMA
   ========================================== */

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [paymentMethod, setPaymentMethod] = useState<"pickup" | "delivery">(
    "pickup"
  );
  const [address, setAddress] = useState("");
  const [showQRIS, setShowQRIS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const categories = ["Semua", "Kaos", "Jaket", "Aksesoris", "Celana"];
  const biayaLayanan = 1000;
  const pajak = 0.11; // 11% PPN

  // Pastikan sudah mounted (hindari hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          nama,
          harga,
          size,
          warna,
          image_url,
          categories(nama),
          stocks(jumlah_stok)
        `
        )
        .order("nama");

      if (error) throw error;

      if (data) {
        const mappedProducts: Product[] = data.map((item: any) => ({
          id: item.id.toString(),
          nama: item.nama,
          harga: Number(item.harga),
          size: item.size,
          warna: item.warna,
          stok: (item.stocks as any)?.jumlah_stok || 0,
          kategori: (item.categories as any)?.nama || "Lainnya",
          image_url: item.image_url,
        }));
        setProducts(mappedProducts);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === "Semua" || p.kategori === selectedCategory;
    const matchSearch = p.nama
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch && p.stok > 0;
  });

  // Add to cart dari daftar produk
  function handleAddToCart(product: Product) {
    addToCart({
      id: product.id,
      nama: product.nama,
      harga: product.harga,
      image_url: product.image_url,
      stok: product.stok,
    });
  }

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.harga * item.quantity,
    0
  );
  const pajakAmount = Math.round(subtotal * pajak);
  const total = subtotal + pajakAmount + biayaLayanan;

  // Checkout with QRIS
  async function handleCheckout() {
    if (cartItems.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    if (paymentMethod === "delivery" && !address.trim()) {
      alert("Mohon isi alamat pengiriman!");
      return;
    }

    setLoading(true);

    try {
      // Check and update stock for all items
      for (const item of cartItems) {
        for (let i = 0; i < item.quantity; i++) {
          const { data, error } = await supabase.rpc("checkout_product", {
            p_product_id: parseInt(item.id),
          });

          if (error) throw error;

          if (!data) {
            alert(
              `Maaf, stok "${item.nama}" baru saja habis dibeli orang lain!`
            );
            setLoading(false);
            router.push("/");
            return;
          }
        }
      }

      // Jika semua berhasil, tampilkan QRIS
      setShowQRIS(true);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Terjadi kesalahan saat checkout. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  // Simulasi pembayaran sukses
  function handlePaymentSuccess() {
    clearCart();
    router.push("/success");
  }

  // Loading state untuk hydration
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  if (showQRIS) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Pembayaran QRIS
          </h2>

          {/* QR Code Placeholder */}
          <div className="mx-auto mb-6 flex h-64 w-64 items-center justify-center rounded-lg bg-gray-200">
            <img
              src="https://via.placeholder.com/256x256/E5E7EB/9CA3AF?text=QR+CODE"
              alt="QRIS"
              className="h-full w-full rounded-lg"
            />
          </div>

          <p className="mb-2 text-xl font-bold text-gray-900">
            {formatRupiah(total)}
          </p>
          <p className="mb-6 text-sm text-gray-600">
            Menunggu Pembayaran... kedaluwarsa dalam 05:00
          </p>

          <button
            onClick={handlePaymentSuccess}
            className="w-full rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            Simulasi: Sukses Bayar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#D62828] shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-white">
            Q-Distro
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/checkout" className="relative">
              <ShoppingCart className="h-6 w-6 text-white" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-gray-900">
                {getTotalItems()}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tombol Back + Judul */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            aria-label="Kembali ke katalog"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Pembayaran</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* KOLOM KIRI - KATALOG PRODUK */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Pilih Produk
              </h2>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              {/* Kategori Horizontal */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Daftar Produk */}
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    className="flex w-full items-center gap-4 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <img
                      src={product.image_url || "/placeholder.jpg"}
                      alt={product.nama}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {product.nama}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatRupiah(product.harga)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN - KERANJANG & PEMBAYARAN */}
          <div className="lg:col-span-1">
            {/* Keranjang */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Keranjang</h2>
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <p className="py-8 text-center text-gray-500">
                  Keranjang kosong
                </p>
              ) : (
                <>
                  <div className="mb-4 max-h-48 space-y-3 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 border-b border-gray-100 pb-3"
                      >
                        <img
                          src={item.image_url || "/placeholder.jpg"}
                          alt={item.nama}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {item.nama}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {item.quantity} x {formatRupiah(item.harga)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Ringkasan */}
                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pajak (11%)</span>
                      <span className="font-medium">
                        {formatRupiah(pajakAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Biaya Layanan</span>
                      <span className="font-medium">
                        {formatRupiah(biayaLayanan)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                      <span>Total</span>
                      <span className="text-[#D62828]">
                        {formatRupiah(total)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Metode Pembayaran */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Metode Pengiriman
              </h2>

              <div className="mb-4 space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "pickup"}
                    onChange={() => setPaymentMethod("pickup")}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Ambil di Tempat
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "delivery"}
                    onChange={() => setPaymentMethod("delivery")}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Antar ke Alamat
                  </span>
                </label>
              </div>

              {paymentMethod === "delivery" && (
                <textarea
                  placeholder="Masukkan alamat lengkap..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="mb-4 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                />
              )}

              <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className="w-full rounded-lg bg-[#D62828] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loading ? "Memproses..." : "Bayar Dengan QRIS"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
