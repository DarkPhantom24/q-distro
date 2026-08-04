"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { Search, Receipt, TrendingUp, CheckCircle, XCircle, Filter } from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

interface Transaksi {
  id: number;
  customer_name: string;
  tanggal_order: string;
  total_harga: number;
  status: string;
  metode: string;
}

// Hanya 2 status: paid (Lunas) dan failed (Gagal)
// Konsep kasir: bayar langsung di tempat — tidak ada pending
const STATUS_MAP = {
  paid:   { label: "Lunas", cls: "bg-green-100 text-green-700", icon: CheckCircle },
  failed: { label: "Gagal", cls: "bg-red-100 text-red-600",    icon: XCircle },
};

// Data dummy sinkron dengan MOCK_PRODUCTS di kasir & produk
// Harga mengacu pada: Kaos Katun 120k, Jaket Denim 285k, Celana Chino 195k,
// Jaket Hoodie 245k, Topi Snapback 75k, Jaket Bomber 320k, Kaos Polo 145k,
// Celana Jogger 175k, Kaos Oversize 135k, Celana Cargo 215k
const MOCK_TRANSAKSI: Transaksi[] = [
  { id: 1, customer_name: "Budi Santoso",  tanggal_order: "2025-06-15T10:30:00", total_harga: 360000, status: "paid",   metode: "QRIS"  },
  { id: 2, customer_name: "Siti Rahayu",   tanggal_order: "2025-06-15T11:15:00", total_harga: 285000, status: "paid",   metode: "Tunai" },
  { id: 3, customer_name: "Rizky Pratama", tanggal_order: "2025-06-13T16:45:00", total_harga: 245000, status: "failed", metode: "QRIS"  },
];

export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>(MOCK_TRANSAKSI);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, tanggal_order, total_harga, payments(status_pembayaran, metode_pembayaran)")
        .order("tanggal_order", { ascending: false })
        .limit(50);
      if (!error && data && data.length > 0) {
        setTransaksi(data.map((o: any) => ({
          id: o.id,
          customer_name: o.customer_name,
          tanggal_order: o.tanggal_order,
          total_harga: Number(o.total_harga),
          // Mapping: jika dari DB ada pending → tampilkan sebagai paid (kasir langsung bayar)
          status: o.payments?.status_pembayaran === "failed" ? "failed" : "paid",
          metode: o.payments?.metode_pembayaran ?? "—",
        })));
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = transaksi.filter(t => {
    const matchSearch = t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toString().includes(search);
    const matchStatus = filterStatus === "semua" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPaid   = transaksi.filter(t => t.status === "paid").reduce((s, t) => s + t.total_harga, 0);
  const countPaid   = transaksi.filter(t => t.status === "paid").length;
  const countFailed = transaksi.filter(t => t.status === "failed").length;
  const successRate = transaksi.length > 0 ? Math.round((countPaid / transaksi.length) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader title="Transaksi" subtitle="Riwayat semua transaksi penjualan" />
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Stat Cards — 3 kolom, tanpa pending */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default">
              <div className="inline-flex rounded-lg p-2.5 bg-[#D62828]"><TrendingUp className="h-4 w-4 text-white" /></div>
              <p className="mt-3 text-xl font-bold text-gray-900">{fmt(totalPaid)}</p>
              <p className="text-xs text-gray-500">Total Pendapatan</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default">
              <div className="inline-flex rounded-lg p-2.5 bg-green-600"><CheckCircle className="h-4 w-4 text-white" /></div>
              <p className="mt-3 text-xl font-bold text-gray-900">{countPaid} transaksi</p>
              <p className="text-xs text-gray-500">Berhasil / Lunas</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default">
              <div className="inline-flex rounded-lg p-2.5 bg-gray-500"><XCircle className="h-4 w-4 text-white" /></div>
              <p className="mt-3 text-xl font-bold text-gray-900">{countFailed} transaksi</p>
              <p className="text-xs text-gray-500">Gagal</p>
            </div>
          </div>

          {/* Hero Banner */}
          <div
            className="relative overflow-hidden rounded-xl px-6 py-5 text-white"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=200&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#111827]/90 to-[#D62828]/70" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-red-200">Ringkasan Transaksi</p>
                <p className="mt-1 text-2xl font-black">{transaksi.length} Total Transaksi</p>
                <p className="text-xs text-gray-300 mt-0.5">Tingkat keberhasilan: {successRate}%</p>
              </div>
              <Receipt className="h-16 w-16 opacity-20" />
            </div>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama customer atau ID..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#D62828] focus:ring-1 focus:ring-red-100 text-gray-900 placeholder:text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
              {(["semua", "paid", "failed"] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterStatus === s
                      ? s === "paid"   ? "bg-green-600 text-white"
                        : s === "failed" ? "bg-red-600 text-white"
                        : "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {s === "semua" ? "Semua" : s === "paid" ? "Lunas" : "Gagal"}
                </button>
              ))}
            </div>
          </div>

          {/* Tabel */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Metode</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">Memuat data...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">Tidak ada transaksi ditemukan</td></tr>
                  ) : filtered.map(t => {
                    const s = STATUS_MAP[t.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.paid;
                    return (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-gray-500">#{String(t.id).padStart(4, "0")}</td>
                        <td className="px-5 py-3 font-semibold text-gray-800">{t.customer_name}</td>
                        <td className="px-5 py-3 text-xs text-gray-500">{fmtDate(t.tanggal_order)}</td>
                        <td className="px-5 py-3">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{t.metode}</span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-gray-800">{fmt(t.total_harga)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                            <s.icon className="h-3 w-3" />{s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
              Menampilkan {filtered.length} dari {transaksi.length} transaksi
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
