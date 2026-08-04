"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  CircleHelp,
  Lock,
  Package,
  QrCode,
  ShoppingCart,
  Store,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/useCart";
import CartBadge from "@/components/CartBadge";

/* ==========================================
   HELPER
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
    selectedItems,
    allSelected,
    removeFromCart,
    updateQuantity,
    toggleSelected,
    selectAll,
    clearCart,
    clearSelected,
    getTotalItems,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [showQRIS, setShowQRIS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const checkoutTotalRef = useRef(0);

  const biayaLayanan = 1000;
  const pajak = 0.11;
  const deliveryFee = 10000;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hitung hanya dari selectedItems
  const subtotal = selectedItems.reduce((sum, item) => sum + item.harga * item.quantity, 0);
  const pajakAmount = Math.round(subtotal * pajak);
  const deliveryAmount = paymentMethod === "delivery" ? deliveryFee : 0;
  const total = subtotal + pajakAmount + biayaLayanan + deliveryAmount;

  async function handleCheckout() {
    if (selectedItems.length === 0) {
      alert("Pilih produk terlebih dahulu untuk checkout!");
      return;
    }
    if (paymentMethod === "delivery" && !address.trim()) {
      alert("Mohon isi alamat pengiriman!");
      return;
    }

    setLoading(true);
    try {
      // 1. Kurangi stok via RPC
      for (const item of selectedItems) {
        for (let i = 0; i < item.quantity; i++) {
          const { data, error } = await supabase.rpc("checkout_product", {
            p_product_id: parseInt(item.id),
          });
          if (error) throw error;
          if (!data) {
            alert(`Maaf, stok "${item.nama}" baru saja habis dibeli orang lain!`);
            setLoading(false);
            router.push("/");
            return;
          }
        }
      }

      // 2. Buat record orders
      const namaCustomer = selectedItems.map(i => i.nama).join(", ");
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: "Pembeli Online",
          tanggal_order: new Date().toISOString().split("T")[0],
          total_harga: total,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      // 3. Buat record order_details
      const orderDetails = selectedItems.map(item => ({
        order_id: orderData.id,
        product_id: parseInt(item.id),
        jumlah: item.quantity,
        harga_satuan: item.harga,
        subtotal: item.harga * item.quantity,
      }));

      const { error: detailError } = await supabase
        .from("order_details")
        .insert(orderDetails);

      if (detailError) throw detailError;

      // 4. Buat record payments
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          order_id: orderData.id,
          metode_pembayaran: "QRIS",
          jumlah_bayar: total,
          status_pembayaran: "paid",
        });

      if (paymentError) throw paymentError;

      // Simpan total sebelum menampilkan QRIS
      checkoutTotalRef.current = total;
      setShowQRIS(true);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Terjadi kesalahan saat checkout. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentSuccess() {
    clearSelected(); // hanya hapus item yang sudah dibayar
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md rounded-xl sm:rounded-2xl bg-white p-5 sm:p-8 shadow-xl text-center">
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900">Pembayaran QRIS</h2>
          <div className="mx-auto mb-4 sm:mb-6 flex h-48 w-48 sm:h-64 sm:w-64 items-center justify-center rounded-xl sm:rounded-2xl bg-gray-100">
            <img
              src="https://via.placeholder.com/256x256/E5E7EB/9CA3AF?text=QR+CODE"
              alt="QRIS"
              className="h-full w-full rounded-xl sm:rounded-2xl"
            />
          </div>
          <p className="mb-1.5 sm:mb-2 text-lg sm:text-xl font-bold text-gray-900">{formatRupiah(checkoutTotalRef.current)}</p>
          <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600">Menunggu Pembayaran... kedaluwarsa dalam 05:00</p>
          <button
            onClick={handlePaymentSuccess}
            className="w-full rounded-xl bg-green-600 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            Simulasi: Sukses Bayar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-[#D62828] border-b border-[#b91c1c] shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg sm:text-xl tracking-tight shrink-0 hover:text-white/80 transition-colors">
            Q-DISTRO
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 text-white hover:text-white/80 transition-colors">
            <CartBadge />
            <span className="text-xs sm:text-sm font-medium">Keranjang</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            aria-label="Kembali ke katalog"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Pembayaran</h1>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 lg:grid-cols-12">
          {/* ===== KOLOM KIRI: PESANAN SAYA ===== */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <div className="flex h-full flex-col rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              {/* Header */}
              <div className="mb-3 sm:mb-4 flex items-center gap-2">
                <div className="rounded-full bg-red-100 p-1.5 sm:p-2 text-red-600">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Pesanan Saya</h2>
              </div>

              {/* Pilih semua + jumlah item + hapus semua */}
              {cartItems.length > 0 && (
                <div className="mb-2 sm:mb-3 flex cursor-pointer items-center gap-2 sm:gap-3 px-2 sm:px-3">
                  <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => selectAll(e.target.checked)}
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded accent-red-600"
                    />
                    Pilih Semua
                  </label>
                  <span className="ml-auto flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                    <span className="text-gray-400">{getTotalItems()} item</span>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={clearCart}
                      className="text-[10px] sm:text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Hapus Semua
                    </button>
                  </span>
                </div>
              )}

              {/* Empty state */}
              {cartItems.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-10 sm:py-16 text-center">
                  <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                  <p className="text-xs sm:text-sm font-semibold text-gray-500">Belum ada produk di keranjang</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">Tambahkan produk terlebih dahulu dari halaman katalog</p>
                  <Link
                    href="/"
                    className="mt-1.5 sm:mt-2 rounded-lg sm:rounded-xl bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Lihat Katalog
                  </Link>
                </div>
              ) : (
                <div className="flex-1 space-y-2 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
                  {cartItems.map((item, i) => {
                    const isSelected = item.selectedForCheckout ?? false;
                    return (
                      <div
                        key={`${item.id}-${item.size}-${item.warna}-${i}`}
                        onClick={() => toggleSelected(item.id, item.size, item.warna)}
                        className={`flex cursor-pointer items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border p-2.5 sm:p-3 transition-all ${
                          isSelected
                            ? "border-red-300 bg-red-50/60"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelected(item.id, item.size, item.warna)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 rounded accent-red-600"
                        />
                        {/* Gambar */}
                        <img
                          src={item.image_url || "/placeholder.jpg"}
                          alt={item.nama}
                          className="h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 rounded-lg object-cover"
                        />
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate text-xs sm:text-sm">{item.nama}</p>
                          <p className="text-xs sm:text-sm font-medium text-red-600">{formatRupiah(item.harga)}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {[item.size, item.warna].filter(Boolean).join(" · ")}
                          </p>
                          <p className="mt-0.5 text-[10px] sm:text-xs text-gray-500">
                            Jumlah: <span className="font-semibold text-gray-700">{item.quantity} item</span>
                          </p>
                        </div>
                        {/* Hapus */}
                        <div
                          className="shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => removeFromCart(item.id, item.size, item.warna)}
                            className="rounded-full p-1 sm:p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-red-600"
                            aria-label="Hapus"
                          >
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ===== KOLOM KANAN ===== */}
          <div className="lg:col-span-5">
            <div className="flex h-full flex-col gap-6">

              {/* Card Keranjang — hanya item selected */}
              <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-100 p-1.5 sm:p-2 text-red-600">
                      <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Keranjang</h2>
                  </div>
                  {selectedItems.length > 0 && (
                    <button
                      onClick={() => selectAll(false)}
                      className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Batal Pilih
                    </button>
                  )}
                </div>

                {selectedItems.length === 0 ? (
                  <div className="flex min-h-[100px] sm:min-h-[120px] items-center justify-center rounded-xl sm:rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center px-3">
                    <p className="text-xs sm:text-sm text-gray-400">Centang produk di kiri untuk menambahkan ke keranjang</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    <div className="mb-1 space-y-2">
                      {selectedItems.map((item, i) => (
                        <div
                          key={`sel-${item.id}-${item.size}-${item.warna}-${i}`}
                          className="flex items-start justify-between gap-2 text-xs sm:text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.nama}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">
                              {[item.size, item.warna].filter(Boolean).join(" · ")} × {item.quantity}
                            </p>
                          </div>
                          <span className="shrink-0 font-medium text-gray-900">
                            {formatRupiah(item.harga * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2 sm:pb-3 text-xs sm:text-sm">
                      <span className="text-gray-600">Total Item</span>
                      <span className="font-semibold text-gray-900">
                        {selectedItems.reduce((s, i) => s + i.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Pajak (PPN 11%)</span>
                      <span className="font-medium text-gray-900">{formatRupiah(pajakAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        Biaya Layanan
                        <CircleHelp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400" />
                      </span>
                      <span className="font-medium text-gray-900">{formatRupiah(biayaLayanan)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-2 sm:pt-3 text-base sm:text-lg font-bold">
                      <span>Total</span>
                      <span className="text-xl sm:text-xl font-bold text-red-600">{formatRupiah(total)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Metode Pembayaran */}
              <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
                <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-gray-900">Metode Pembayaran</h2>

                <div className="space-y-2 sm:space-y-3">
                  <label
                    className={`flex cursor-pointer items-start gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition ${
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
                      className="mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4 border-gray-300 text-red-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-red-100 p-1.5 sm:p-2 text-red-600">
                          <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Ambil di Toko</p>
                          <p className="text-xs sm:text-sm text-gray-500">Jl. Sam Ratulangi No. 45</p>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-3 inline-flex items-center rounded-full bg-emerald-100 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-emerald-700">
                        ✓ Pesanan siap diambil hari ini
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition ${
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
                      className="mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4 border-gray-300 text-red-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-red-100 p-1.5 sm:p-2 text-red-600">
                            <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Diantar oleh Kurir</p>
                            <p className="text-xs sm:text-sm text-gray-500">Estimasi 30 - 60 menit</p>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-red-600">Rp 10.000</span>
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
                    className="mt-3 sm:mt-4 w-full rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 p-2 sm:p-3 text-xs sm:text-sm text-gray-700 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                  />
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading || selectedItems.length === 0}
                  className="mt-4 sm:mt-5 flex w-full items-center justify-between rounded-lg sm:rounded-xl bg-red-600 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Bayar dengan QRIS
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <p className="mt-2 sm:mt-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                  <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Pembayaran aman & terenkripsi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
