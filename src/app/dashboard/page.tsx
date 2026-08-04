"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Chart3DRed from "@/components/Chart3DRed";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import {
  AlertTriangle,
  TrendingUp,
  Wallet,
  Boxes,
} from "lucide-react";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const STATUS_STYLE: Record<string, string> = {
  Lunas:   "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Batal:   "bg-red-100 text-red-600",
};

const COLOR_MAP = {
  red:    { bg: "bg-red-50",    icon: "bg-[#D62828] text-white",  badge: "text-[#D62828] bg-red-50" },
  green:  { bg: "bg-green-50",  icon: "bg-green-600 text-white",  badge: "text-green-700 bg-green-50" },
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-600 text-white",   badge: "text-blue-700 bg-blue-50" },
  orange: { bg: "bg-orange-50", icon: "bg-orange-500 text-white", badge: "text-orange-600 bg-orange-50" },
} as const;

/* ─────────────────────────────────────────
   SUB-KOMPONEN: STAT CARD
───────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: keyof typeof COLOR_MAP;
}) {
  const c = COLOR_MAP[color];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default">
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2.5 ${c.icon}`}>{icon}</div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${c.badge}`}>
          {sub}
        </span>
      </div>
      <p className="mt-3 text-xl font-bold leading-tight text-gray-900">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   KOMPONEN UTAMA — DASHBOARD ADMIN
───────────────────────────────────────── */

interface DashboardTransaksi {
  id: number;
  nama: string;
  jumlah: number;
  total: number;
  status: string;
  tanggal: string;
}

export default function DashboardPage() {
  const [transaksi, setTransaksi] = useState<DashboardTransaksi[]>([]);
  const [totalPenjualan, setTotalPenjualan] = useState(0);
  const [totalStok, setTotalStok] = useState(0);
  const [stokPeringatan, setStokPeringatan] = useState(0);
  const [chartData, setChartData] = useState<{ bulan: string; omset: number; laba: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);

      // 1. Fetch orders dengan payment status
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, customer_name, tanggal_order, total_harga, payments(status_pembayaran)")
        .order("tanggal_order", { ascending: false })
        .limit(10);

      if (ordersData && ordersData.length > 0) {
        const trx: DashboardTransaksi[] = ordersData.map((o: any) => {
          // Ambil nama produk dari order_details
          return {
            id: o.id,
            nama: o.customer_name,
            jumlah: 1,
            total: Number(o.total_harga),
            status: o.payments?.status_pembayaran === "paid" ? "Lunas" : "Gagal",
            tanggal: o.tanggal_order,
          };
        });
        setTransaksi(trx);
        setTotalPenjualan(trx.filter(t => t.status === "Lunas").reduce((s, t) => s + t.total, 0));
      }

      // 2. Fetch stok
      const { data: stocksData } = await supabase
        .from("stocks")
        .select("jumlah_stok");

      if (stocksData) {
        const total = stocksData.reduce((s: number, st: any) => s + (st.jumlah_stok || 0), 0);
        const rendah = stocksData.filter((st: any) => st.jumlah_stok > 0 && st.jumlah_stok <= 3).length;
        setTotalStok(total);
        setStokPeringatan(rendah);
      }

      // 3. Build chart data dari payments
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("jumlah_bayar, status_pembayaran, created_at")
        .eq("status_pembayaran", "paid");

      if (paymentsData && paymentsData.length > 0) {
        const perBulan: Record<number, number> = {};
        paymentsData.forEach((p: any) => {
          const bln = new Date(p.created_at).getMonth();
          perBulan[bln] = (perBulan[bln] ?? 0) + Number(p.jumlah_bayar);
        });

        const now = new Date();
        const chart: { bulan: string; omset: number; laba: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const blnIdx = (now.getMonth() - i + 12) % 12;
          chart.push({
            bulan: BULAN[blnIdx],
            omset: perBulan[blnIdx] ?? 0,
            laba: Math.round((perBulan[blnIdx] ?? 0) * 0.38),
          });
        }
        setChartData(chart);
      }

      setLoading(false);
    }
    fetchDashboard();
  }, []);

  // Estimasi pajak
  const PPH_RATE = 0.005;
  const PPN_RATE = 0.11;
  const PKP_THRESHOLD = 4_800_000_000;
  const isPKP = totalPenjualan * 12 >= PKP_THRESHOLD;
  const estimasiPPh = totalPenjualan * PPH_RATE;
  const estimasiPPN = isPKP ? totalPenjualan * PPN_RATE : 0;

  const STATUS_MAP: Record<string, string> = {
    Lunas: "bg-green-100 text-green-700",
    Gagal: "bg-red-100 text-red-600",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader title="Dashboard Summary" subtitle="Selamat datang kembali, Admin!" />

        {/* ── SCROLLABLE BODY ── */}
        <main className="flex-1 space-y-6 overflow-y-auto px-6 py-6">

          {/* ── BARIS 1: 4 STAT CARDS ── */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Total Penjualan"
              value={loading ? "Memuat..." : fmt(totalPenjualan)}
              sub="Bulan ini"
              color="red"
            />
            <StatCard
              icon={<Wallet className="h-5 w-5" />}
              label="Keuntungan Bersih"
              value={loading ? "Memuat..." : fmt(Math.round(totalPenjualan * 0.38))}
              sub="Margin ~30%"
              color="green"
            />
            <StatCard
              icon={<Boxes className="h-5 w-5" />}
              label="Total Stok Tersedia"
              value={loading ? "Memuat..." : `${totalStok} pcs`}
              sub="Semua kategori"
              color="blue"
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5" />}
              label="Peringatan Stok"
              value={loading ? "Memuat..." : `${stokPeringatan} produk`}
              sub="Stok ≤ 3 unit"
              color="orange"
            />
          </div>

          {/* ── BARIS 2: TRANSAKSI TERBARU ── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-bold text-gray-800">Transaksi Terbaru</h2>
              <Link href="/transaksi" className="text-xs font-medium text-[#D62828] hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Memuat data...</td></tr>
                  ) : transaksi.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Belum ada transaksi</td></tr>
                  ) : transaksi.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">#{String(t.id).padStart(4, "0")}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{t.nama}</td>
                      <td className="px-5 py-3 text-xs text-gray-500">{t.tanggal}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-800">{fmt(t.total)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_MAP[t.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── BARIS 3: BAR CHART + ESTIMASI PAJAK ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* Bar Chart 3D Merah */}
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Grafik Penjualan Bulanan</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {chartData.length} bulan · hover titik untuk detail
                  </p>
                </div>
                <span className="text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
                  {chartData[0]?.bulan} – {chartData[chartData.length - 1]?.bulan}{" "}
                  {new Date().getFullYear()}
                </span>
              </div>
              <div className="px-0 py-2">
                {loading ? (
                  <div className="flex items-center justify-center py-10 text-gray-400 text-sm">Memuat data chart...</div>
                ) : (
                  <Chart3DRed data={chartData.length > 0 ? chartData : [{ bulan: "Jun", omset: 0, laba: 0 }]} />
                )}
              </div>
            </div>

            {/* Estimasi Pajak UMKM */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-bold text-gray-800">Estimasi Pajak UMKM</h2>
                <p className="mt-0.5 text-[10px] text-gray-500">Otomatis · Bulan ini</p>
              </div>
              <div className="space-y-3 px-5 py-4">
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Total Omset</p>
                  <p className="mt-0.5 text-base font-bold text-gray-900">{fmt(totalPenjualan)}</p>
                </div>
                <div className="rounded-lg bg-green-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">PPh Final (0,5%)</p>
                      <p className="text-[10px] text-green-600">PP 55/2022 · UMKM</p>
                    </div>
                    <p className="text-sm font-bold text-green-800">{fmt(estimasiPPh)}</p>
                  </div>
                </div>
                <div className={`rounded-lg px-4 py-3 ${isPKP ? "bg-red-50" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-[10px] font-semibold uppercase tracking-wide ${isPKP ? "text-red-700" : "text-gray-500"}`}>
                        PPN (11%)
                      </p>
                      <p className={`text-[10px] ${isPKP ? "text-red-500" : "text-gray-400"}`}>
                        {isPKP ? "Status: PKP" : "Belum PKP"}
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${isPKP ? "text-red-800" : "text-gray-400"}`}>
                      {isPKP ? fmt(estimasiPPN) : "—"}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-[#D62828] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-red-200">Total Estimasi Pajak</p>
                  <p className="mt-0.5 text-base font-bold text-white">{fmt(estimasiPPh + estimasiPPN)}</p>
                </div>
                <Link
                  href="/pajak"
                  className="block w-full rounded-lg border border-[#D62828] py-2 text-center text-xs font-semibold text-[#D62828] transition-colors hover:bg-red-50"
                >
                  Lihat Detail Pajak
                </Link>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
