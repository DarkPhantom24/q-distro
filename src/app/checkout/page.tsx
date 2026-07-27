"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  CircleHelp,
  Lock,
  Minus,
  Plus,
  QrCode,
  Search,
  ShoppingCart,
  Store,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/useCart";

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
    updateQuantity,
    clearCart,
    getTotalItems,
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
  const pajak = 0.11;
  const deliveryFee = 10000;

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === "Semua" || p.kategori === selectedCategory;
    const matchSearch = p.nama
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch && p.stok > 0;
  });

  function handleAddToCart(product: Product) {
    addToCart({
      id: product.id,
      nama: product.nama,
      harga: product.harga,
      image_url: product.image_url,
      stok: product.stok,
    });
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.harga * item.quantity,
    0
  );
  const pajakAmount = Math.round(subtotal * pajak);
  const deliveryAmount = paymentMethod === "delivery" ? deliveryFee : 0;
  const total = subtotal + pajakAmount + biayaLayanan + deliveryAmount;

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

      setShowQRIS(true);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Terjadi kesalahan saat checkout. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentSuccess() {
    clearCart();
    router.push("/success");
  }

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
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Pembayaran QRIS
          </h2>

          <div className="mx-auto mb-6 flex h-64 w-64 items-center justify-center rounded-2xl bg-gray-100">
            <img
              src="https://via.placeholder.com/256x256/E5E7EB/9CA3AF?text=QR+CODE"
              alt="QRIS"
              className="h-full w-full rounded-2xl"
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
            className="w-full rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            Simulasi: Sukses Bayar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7f7_0%,#f9fafb_100%)]">
      <nav className="sticky top-0 z-50 border-b border-red-700/20 bg-[#D62828] shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white">
            Q-Distro
          </Link>
          <Link href="/checkout" className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <ShoppingCart className="h-5 w-5" />
            <span>Keranjang</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-gray-900">
              {getTotalItems()}
            </span>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            aria-label="Kembali ke katalog"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm font-medium text-red-600">Checkout</p>
            <h1 className="text-xl font-semibold text-gray-900">Pembayaran</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Pilih Produk</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Tambahkan item favorit Anda sebelum checkout.
                  </p>
                </div>
                <div className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
                  {filteredProducts.length} tersedia
                </div>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div className="mb-6 flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
                {filteredProducts.map((product) => {
                  const cartItem = cartItems.find((item) => item.id === product.id);
                  const itemQuantity = cartItem?.quantity ?? 0;
                  const stockBadge =
                    product.stok > 3
                      ? { label: `Stok: ${product.stok}`, tone: "bg-emerald-50 text-emerald-700" }
                      : { label: `Sisa: ${product.stok}`, tone: "bg-amber-50 text-amber-700" };

                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3 transition-all hover:border-red-200 hover:bg-red-50/50"
                    >
                      <img
                        src={product.image_url || "/placeholder.jpg"}
                        alt={product.nama}
                        className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{product.nama}</h3>
                            <p className="mt-1 text-sm font-medium text-red-600">
                              {formatRupiah(product.harga)}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Ukuran: {product.size || "-"} • Warna: {product.warna || "-"}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${stockBadge.tone}`}>
                            {stockBadge.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 p-1">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              if (itemQuantity > 0) {
                                updateQuantity(product.id, itemQuantity - 1);
                              }
                            }}
                            className="rounded-full p-1 text-gray-600 transition hover:bg-white hover:text-red-600"
                            aria-label={`Kurangi ${product.nama}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-gray-900">
                            {itemQuantity}
                          </span>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="rounded-full p-1 text-gray-600 transition hover:bg-white hover:text-red-600"
                            aria-label={`Tambah ${product.nama}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatRupiah(itemQuantity > 0 ? product.harga * itemQuantity : product.harga)}
                          </span>
                          {itemQuantity > 0 && (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                removeFromCart(product.id);
                              }}
                              className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-red-600"
                              aria-label={`Hapus ${product.nama}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex h-full flex-col gap-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-100 p-2 text-red-600">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Keranjang</h2>
                  </div>
                  {cartItems.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-gray-500">
                    Keranjang kosong
                  </div>
                ) : (
                  <>
                    <div className="mb-4 max-h-56 space-y-3 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-gray-200 p-3"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={item.image_url || "/placeholder.jpg"}
                              alt={item.nama}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  {item.nama}
                                </h3>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-red-600"
                                  aria-label={`Hapus ${item.nama}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                {formatRupiah(item.harga)} / item
                              </p>
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 p-1">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="rounded-full p-1 text-gray-600 transition hover:bg-white hover:text-red-600"
                                    aria-label={`Kurangi ${item.nama}`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="min-w-8 text-center text-sm font-semibold text-gray-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="rounded-full p-1 text-gray-600 transition hover:bg-white hover:text-red-600"
                                    aria-label={`Tambah ${item.nama}`}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatRupiah(item.harga * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 border-t border-dashed border-gray-200 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Item</span>
                        <span className="font-semibold text-gray-900">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">{formatRupiah(subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Pajak (PPN 11%)</span>
                        <span className="font-medium text-gray-900">{formatRupiah(pajakAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          Biaya Layanan
                          <CircleHelp className="h-3.5 w-3.5 text-gray-400" />
                        </span>
                        <span className="font-medium text-gray-900">{formatRupiah(biayaLayanan)}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-3 text-sm">
                        <span className="text-gray-600">Pengiriman</span>
                        <span className="font-medium text-gray-900">{formatRupiah(deliveryAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-base font-bold">
                        <span>Total</span>
                        <span className="text-xl font-bold text-red-600">{formatRupiah(total)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Metode Pembayaran</h2>

                <div className="space-y-3">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                      paymentMethod === "pickup"
                        ? "border-red-300 bg-red-50 shadow-sm"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "pickup"}
                      onChange={() => setPaymentMethod("pickup")}
                      className="mt-1 h-4 w-4 border-gray-300 text-red-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-red-100 p-2 text-red-600">
                          <Store className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Ambil di Toko</p>
                          <p className="text-sm text-gray-500">Jl. Sam Ratulangi No. 45, Kota Palu</p>
                        </div>
                      </div>
                      <div className="mt-3 inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        ✓ Pesanan siap diambil hari ini
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                      paymentMethod === "delivery"
                        ? "border-red-300 bg-red-50 shadow-sm"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "delivery"}
                      onChange={() => setPaymentMethod("delivery")}
                      className="mt-1 h-4 w-4 border-gray-300 text-red-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-red-100 p-2 text-red-600">
                            <Truck className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Diantar oleh Kurir Toko</p>
                            <p className="text-sm text-gray-500">Estimasi 30 - 60 menit</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-red-600">Rp 10.000</span>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentMethod === "delivery" && (
                  <textarea
                    placeholder="Masukkan alamat lengkap..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                  />
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                  className="mt-5 flex w-full items-center justify-between rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <span className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Bayar dengan QRIS
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Lock className="h-4 w-4" /> Pembayaran aman & terenkripsi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
