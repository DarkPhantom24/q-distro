"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { Search, Plus, Minus, Trash2, ShoppingBag, CheckCircle, X } from "lucide-react";
import { PPH_RATE, PPN_RATE, PKP_THRESHOLD, hitungPPNKasir } from "@/lib/tax";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

interface Product {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  kategori: string;
  image_url: string | null;
}

interface CartItem extends Product {
  qty: number;
}

const MOCK_PRODUCTS: Product[] = [
  { id: "1", nama: "Kaos Distro Katun Premium", harga: 120000, stok: 15, kategori: "Kaos", image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop" },
  { id: "2", nama: "Jaket Denim Original", harga: 285000, stok: 2, kategori: "Jaket", image_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=80&h=80&fit=crop" },
  { id: "3", nama: "Topi Snapback Custom", harga: 75000, stok: 20, kategori: "Aksesoris", image_url: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=80&h=80&fit=crop" },
  { id: "4", nama: "Kaos Oversize Streetwear", harga: 135000, stok: 1, kategori: "Kaos", image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=80&h=80&fit=crop" },
  { id: "5", nama: "Celana Chino Slim Fit", harga: 195000, stok: 8, kategori: "Celana", image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=80&h=80&fit=crop" },
  { id: "6", nama: "Jaket Hoodie Parasut", harga: 245000, stok: 5, kategori: "Jaket", image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=80&h=80&fit=crop" },
  { id: "7", nama: "Celana Jogger Premium", harga: 175000, stok: 3, kategori: "Celana", image_url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=80&h=80&fit=crop" },
  { id: "8", nama: "Kaos Polo Distro", harga: 145000, stok: 12, kategori: "Kaos", image_url: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=80&h=80&fit=crop" },
];

const KATEGORI = ["Semua", "Kaos", "Jaket", "Celana", "Aksesoris"];

export default function KasirPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [namaCustomer, setNamaCustomer] = useState("");
  const [metodeBayar, setMetodeBayar] = useState<"tunai" | "qris">("tunai");
  const [bayar, setBayar] = useState("");
  const [sukses, setSukses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kembalianFinal, setKembalianFinal] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [isPKP, setIsPKP] = useState(false);

  // PKP threshold: Rp 4,8M/tahun (PMK 197/2013) — dari lib/tax.ts
  // PPH_RATE, PPN_RATE, PKP_THRESHOLD diimport dari shared constants
  const clickTimer = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const clickCount = useRef<Record<string, number>>({});

  function handleProductClick(p: Product) {
    const id = p.id;
    clickCount.current[id] = (clickCount.current[id] ?? 0) + 1;

    if (clickTimer.current[id]) clearTimeout(clickTimer.current[id]);

    clickTimer.current[id] = setTimeout(() => {
      const count = clickCount.current[id] ?? 1;
      for (let i = 0; i < count; i++) addToCart(p);
      clickCount.current[id] = 0;
      setFlashId(id);
      setTimeout(() => setFlashId(null), 300);
    }, 250);
  }

  useEffect(() => {
    async function fetchPKPStatus() {
      const { data, error } = await supabase
        .from("payments")
        .select("jumlah_bayar")
        .eq("status_pembayaran", "paid");
      if (!error && data && data.length > 0) {
        const omsetBulanIni = data.reduce((s: number, p: any) => s + Number(p.jumlah_bayar), 0);
        setIsPKP(omsetBulanIni * 12 >= PKP_THRESHOLD);
      }
    }
    fetchPKPStatus();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, nama, harga, image_url, categories(nama), stocks(jumlah_stok)")
        .order("nama");
      if (!error && data && data.length > 0) {
        setProducts(data.map((p: any) => ({
          id: p.id.toString(),
          nama: p.nama,
          harga: Number(p.harga),
          stok: p.stocks?.jumlah_stok ?? 0,
          kategori: p.categories?.nama ?? "Lainnya",
          image_url: p.image_url,
        })));
      }
    }
    fetchProducts();
  }, []);

  const filtered = products.filter(p =>
    (kategori === "Semua" || p.kategori === kategori) &&
    p.nama.toLowerCase().includes(search.toLowerCase()) &&
    p.stok > 0
  );

  function addToCart(p: Product) {
    setCart(prev => {
      const exist = prev.find(c => c.id === p.id);
      if (exist) {
        if (exist.qty >= p.stok) return prev;
        return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...p, qty: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev
      .map(c => c.id === id ? { ...c, qty: c.qty + delta } : c)
      .filter(c => c.qty > 0)
    );
  }

  const subtotal = cart.reduce((s, c) => s + c.harga * c.qty, 0);
  const pajak    = hitungPPNKasir(subtotal, isPKP);
  const total    = subtotal + pajak;
  const kembalian = metodeBayar === "tunai" ? Math.max(0, Number(bayar.replace(/\D/g, "")) - total) : 0;

  async function handleCheckout() {
    if (!namaCustomer.trim()) { alert("Isi nama customer!"); return; }
    if (cart.length === 0) { alert("Keranjang kosong!"); return; }
    if (metodeBayar === "tunai" && Number(bayar.replace(/\D/g, "")) < total) {
      alert("Uang bayar kurang!"); return;
    }
    setLoading(true);
    try {
      // 1. Kurangi stok via RPC
      for (const item of cart) {
        for (let i = 0; i < item.qty; i++) {
          await supabase.rpc("checkout_product", { p_product_id: parseInt(item.id) });
        }
      }

      // 2. Buat record orders
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: namaCustomer,
          tanggal_order: new Date().toISOString().split("T")[0],
          total_harga: total,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      // 3. Buat record order_details
      const orderDetails = cart.map(item => ({
        order_id: orderData.id,
        product_id: parseInt(item.id),
        jumlah: item.qty,
        harga_satuan: item.harga,
        subtotal: item.harga * item.qty,
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
          metode_pembayaran: metodeBayar === "tunai" ? "Tunai" : "QRIS",
          jumlah_bayar: total,
          status_pembayaran: "paid",
        });

      if (paymentError) throw paymentError;

      setKembalianFinal(kembalian);
      setTotalFinal(total);
      setSukses(true);
      setCart([]);
      setNamaCustomer("");
      setBayar("");
    } catch {
      alert("Gagal checkout, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (sukses) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <AdminSidebar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center bg-white rounded-2xl p-10 shadow-lg max-w-sm w-full mx-4">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Transaksi Berhasil!</h2>
            <p className="text-gray-500 text-sm mb-6">Pembayaran telah diterima</p>
            <p className="text-3xl font-black text-[#D62828] mb-6">{fmt(totalFinal)}</p>
            {metodeBayar === "tunai" && (
              <p className="text-sm text-gray-600 mb-6">Kembalian: <span className="font-bold text-green-600">{fmt(kembalianFinal)}</span></p>
            )}
            <button onClick={() => setSukses(false)}
              className="w-full rounded-xl bg-[#D62828] py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors">
              Transaksi Baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader title="Kasir / POS" subtitle="Point of Sale — Transaksi langsung di toko" />
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">

          {/* ── KIRI: PRODUK ── */}
          <div className="flex flex-1 flex-col overflow-hidden border-b border-gray-200 bg-white lg:border-b-0 lg:border-r">
            {/* Search & Filter */}
            <div className="border-b border-gray-100 px-3 py-2 sm:px-4 sm:py-3 space-y-1.5 sm:space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 border border-gray-300 rounded-lg outline-none focus:border-[#D62828] focus:ring-1 focus:ring-red-100 placeholder:text-gray-500" />
              </div>
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
                {KATEGORI.map(k => (
                  <button key={k} onClick={() => setKategori(k)}
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold transition-colors ${
                      kategori === k ? "bg-[#D62828] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>{k}</button>
                ))}
              </div>
            </div>

            {/* Grid Produk */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {filtered.map(p => {
                  const inCart = cart.find(c => c.id === p.id);
                  const isFlash = flashId === p.id;
                  return (
                  <button key={p.id}
                    onClick={() => handleProductClick(p)}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border-2 bg-white text-left shadow-sm transition-all duration-200 active:scale-95 ${
                      isFlash ? "border-green-400 shadow-green-200 shadow-md scale-[1.03]" :
                      inCart  ? "border-[#D62828] -translate-y-0.5 shadow-md" :
                                "border-gray-200 hover:border-[#D62828] hover:shadow-md hover:-translate-y-1"
                    }`}>
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                      <img src={p.image_url ?? ""} alt={p.nama} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      {p.stok <= 3 && (
                        <span className="absolute top-2 right-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          Sisa {p.stok}
                        </span>
                      )}
                      {inCart && (
                        <span className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D62828] text-[10px] font-black text-white">
                          {inCart.qty}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="line-clamp-2 text-xs font-semibold text-gray-800 leading-snug">{p.nama}</p>
                      <p className="mt-1 text-sm font-bold text-[#D62828]">{fmt(p.harga)}</p>
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center rounded-xl transition-opacity ${
                      isFlash ? "bg-green-500/70 opacity-100" : "bg-[#D62828]/75 opacity-0 group-hover:opacity-100"
                    }`}>
                      <Plus className="h-8 w-8 text-white" />
                    </div>
                  </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── KANAN: CART & BAYAR ── */}
          <div className="flex h-[420px] flex-col bg-gray-50 lg:h-auto lg:w-80 xl:w-96">
            {/* Header Cart */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#D62828]" />
                <span className="text-sm font-bold text-gray-800">Keranjang</span>
                <span className="rounded-full bg-[#D62828] px-2 py-0.5 text-[10px] font-bold text-white">{cart.reduce((s,c)=>s+c.qty,0)}</span>
              </div>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-700">Kosongkan</button>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                  <ShoppingBag className="h-12 w-12 mb-2 opacity-30" />
                  <p className="text-sm">Belum ada produk</p>
                  <p className="text-xs">Klik produk untuk menambahkan</p>
                </div>
              ) : cart.map(c => (
                <div key={c.id} className="flex items-center gap-2 rounded-lg bg-white p-2.5 shadow-sm">
                  <img src={c.image_url ?? ""} alt={c.nama} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-semibold text-gray-800">{c.nama}</p>
                    <p className="text-xs text-[#D62828] font-bold">{fmt(c.harga)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => updateQty(c.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-red-50 hover:border-red-400 text-gray-700 hover:text-red-600 transition-colors">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-gray-900">{c.qty}</span>
                    <button onClick={() => updateQty(c.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-green-50 hover:border-green-400 text-gray-700 hover:text-green-600 transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setCart(prev => prev.filter(x => x.id !== c.id))} className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-red-50 hover:border-red-400 text-gray-500 hover:text-red-600 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Ringkasan & Bayar */}
            <div className="border-t border-gray-200 bg-white px-4 py-4 space-y-3">
              {/* Nama Customer */}
              <input value={namaCustomer} onChange={e => setNamaCustomer(e.target.value)}
                placeholder="Nama customer..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 font-medium outline-none focus:border-[#D62828] focus:ring-1 focus:ring-red-100 placeholder:text-gray-400 placeholder:font-normal" />

              {/* Ringkasan Harga */}
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{fmt(subtotal)}</span></div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    PPN 11%
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      isPKP ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"
                    }`}>{isPKP ? "PKP" : "Non-PKP"}</span>
                  </span>
                  <span className={`font-semibold ${isPKP ? "text-gray-700" : "text-gray-400"}`}>
                    {isPKP ? fmt(pajak) : "—"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-1 text-sm font-bold text-gray-900">
                  <span>Total</span><span className="text-[#D62828]">{fmt(total)}</span>
                </div>
              </div>


              {/* Input Uang Tunai */}
              {metodeBayar === "tunai" && (
                <div>
                  <input value={bayar} onChange={e => setBayar(e.target.value.replace(/\D/g,""))}
                    placeholder="Uang diterima (Rp)"
                    inputMode="numeric"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 font-medium outline-none focus:border-[#D62828] focus:ring-1 focus:ring-red-100 placeholder:text-gray-400 placeholder:font-normal" />
                  {bayar && Number(bayar) >= total && (
                    <p className="mt-1 text-xs text-green-600 font-semibold">Kembalian: {fmt(kembalian)}</p>
                  )}
                </div>
              )}

              <button onClick={handleCheckout} disabled={loading || cart.length === 0}
                className="w-full rounded-xl bg-[#D62828] py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                {loading ? "Memproses..." : "Selesaikan Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
