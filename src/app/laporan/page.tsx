"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { TrendingUp, TrendingDown, Wallet, BarChart2, Download, Calendar, Shirt, Package, ShoppingBag, Tag } from "lucide-react";
import Chart3DRed from "@/components/Chart3DRed";
import { PPH_RATE, PPN_RATE, hitungPajak } from "@/lib/tax";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

// Data dummy sinkron dengan transaksi (3 data: 360k+285k paid, 245k failed)
// Total omset paid = 360.000 + 285.000 = 645.000
// Chart mock 6 bulan dengan proporsi realistis
const CHART_MOCK = [
  { bulan: "Jan", omset: 1_200_000, laba: 456_000 },
  { bulan: "Feb", omset: 1_850_000, laba: 703_000 },
  { bulan: "Mar", omset: 975_000,   laba: 370_500 },
  { bulan: "Apr", omset: 2_100_000, laba: 798_000 },
  { bulan: "Mei", omset: 1_560_000, laba: 592_800 },
  { bulan: "Jun", omset: 645_000,   laba: 245_100 }, // Jun = data dummy transaksi (360k+285k)
];

const KATEGORI_DATA = [
  { nama: "Kaos",      nilai: 255_000, pct: 40, icon: Shirt,       color: "#D62828", bg: "bg-red-50",     text: "text-red-700" },
  { nama: "Jaket",     nilai: 285_000, pct: 44, icon: Package,     color: "#2563eb", bg: "bg-blue-50",    text: "text-blue-700" },
  { nama: "Celana",    nilai: 105_000, pct: 16, icon: ShoppingBag, color: "#7c3aed", bg: "bg-violet-50",  text: "text-violet-700" },
  { nama: "Aksesoris", nilai: 0,       pct: 0,  icon: Tag,         color: "#ea580c", bg: "bg-orange-50",  text: "text-orange-700" },
];

// Tahun tersedia: dari 2022 sampai tahun sekarang + 5 ke depan
const THIS_YEAR = new Date().getFullYear();
const TAHUN_LIST = Array.from({ length: THIS_YEAR - 2022 + 6 }, (_, i) => String(2022 + i)).reverse();

export default function LaporanPage() {
  const currentYear = new Date().getFullYear().toString();
  const [periode, setPeriode]               = useState(currentYear);
  const [totalOmset, setTotalOmset]         = useState(645_000);
  const [totalHPP, setTotalHPP]             = useState(399_900);
  const [totalTransaksi, setTotalTransaksi] = useState(2); // 2 paid dari dummy
  const [loading, setLoading]               = useState(true);
  const [chartData, setChartData]           = useState(CHART_MOCK);

  const labaKotor = totalOmset - totalHPP;
  const marginPct = totalOmset > 0 ? Math.round((labaKotor / totalOmset) * 100) : 0;
  const rataRata  = totalTransaksi > 0 ? Math.round(totalOmset / totalTransaksi) : 0;

  // Kalkulasi pajak otomatis dari lib/tax.ts — sinkron dengan halaman Pajak & Kasir
  const { isPKP, pph: estimasiPPh, ppn: estimasiPPN } = hitungPajak(totalOmset);
  const labaBersih = labaKotor - estimasiPPh - estimasiPPN;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Reset ke fallback dulu saat ganti tahun
      setTotalOmset(0);
      setTotalHPP(0);
      setTotalTransaksi(0);
      setChartData(CHART_MOCK);

      const { data, error } = await supabase
        .from("payments")
        .select("jumlah_bayar, status_pembayaran, created_at")
        .eq("status_pembayaran", "paid")
        .gte("created_at", `${periode}-01-01`)
        .lte("created_at", `${periode}-12-31T23:59:59`);

      if (!error && data && data.length > 0) {
        const omset = data.reduce((s: number, p: any) => s + Number(p.jumlah_bayar), 0);
        setTotalOmset(omset);
        setTotalTransaksi(data.length);
        setTotalHPP(Math.round(omset * 0.62));

        // Build chart dari data real per bulan
        const perBulan: Record<number, number> = {};
        data.forEach((p: any) => {
          const bln = new Date(p.created_at).getMonth();
          perBulan[bln] = (perBulan[bln] ?? 0) + Number(p.jumlah_bayar);
        });
        const chart = Object.entries(perBulan)
          .sort(([a], [b]) => Number(a) - Number(b))
          .slice(-6)
          .map(([bln, o]) => ({ bulan: BULAN[Number(bln)], omset: o, laba: Math.round(o * 0.38) }));
        if (chart.length > 0) setChartData(chart);
      }
      setLoading(false);
    }
    fetchData();
  }, [periode]);

  // Export CSV
  function handleExport() {
    const rows = [
      ["Laporan Keuangan Q-Distro", `Periode ${periode}`],
      [],
      ["Keterangan", "Jumlah (Rp)", "% Omset", "Catatan"],
      ["Total Omset / Pendapatan",  totalOmset,          "100%",                  "Semua transaksi paid"],
      ["Harga Pokok Penjualan (HPP)", -totalHPP,         "-62%",                  "Estimasi modal produk"],
      ["Laba Kotor",                labaKotor,           `${marginPct}%`,         "Omset - HPP"],
      ["Estimasi PPh Final (0,5%)", -estimasiPPh,        "-0.5%",                 "PP 55/2022"],
      ["Estimasi PPN (11%)",        -estimasiPPN,        isPKP ? "-11%" : "0%",   isPKP ? "Wajib PKP" : "Non-PKP — tidak berlaku"],
      ["Laba Bersih Estimasi",      labaBersih,          `${((labaBersih/totalOmset)*100).toFixed(1)}%`, "Setelah semua pajak"],
      [],
      ["Detail Grafik Bulanan"],
      ["Bulan", "Omset (Rp)", "Laba (Rp)"],
      ...chartData.map(d => [d.bulan, d.omset, d.laba]),
    ];

    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `laporan-keuangan-qdistro-${periode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader title="Laporan Keuangan" subtitle="Analisis keuangan & performa penjualan" />
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl text-white"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&h=300&fit=crop')", backgroundSize: "cover", backgroundPosition: "center top" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#1e293b]/80 to-[#D62828]/60" />
            <div className="relative px-8 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-red-300">Laporan Keuangan</p>
                <h2 className="mt-1 text-3xl font-black">Q-Distro Financial Report</h2>
                <p className="mt-1 text-sm text-gray-300">Periode {periode} · Data real-time dari Supabase</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Dropdown tahun dinamis */}
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <Calendar className="h-4 w-4 text-red-300 flex-shrink-0" />
                  <select value={periode} onChange={e => setPeriode(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-white outline-none cursor-pointer">
                    {TAHUN_LIST.map(y => (
                      <option key={y} value={y} className="text-gray-900 bg-white">{y}</option>
                    ))}
                  </select>
                </div>
                {/* Export CSV berfungsi */}
                <button onClick={handleExport}
                  className="flex items-center gap-2 rounded-xl bg-[#D62828] px-4 py-2 text-sm font-bold hover:bg-red-700 transition-colors">
                  <Download className="h-4 w-4" /> Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              { label: "Total Omset",         value: fmt(totalOmset), sub: `${totalTransaksi} transaksi`, icon: TrendingUp,   color: "bg-[#D62828]", trend: "" },
              { label: "HPP / Modal",         value: fmt(totalHPP),   sub: "Estimasi 62% omset",          icon: TrendingDown, color: "bg-blue-600",  trend: "" },
              { label: "Laba Kotor",          value: fmt(labaKotor),  sub: `Margin ${marginPct}%`,        icon: Wallet,       color: "bg-green-600", trend: `Margin ${marginPct}%` },
              { label: "Rata-rata/Transaksi", value: fmt(rataRata),   sub: "Per order",                   icon: BarChart2,    color: "bg-purple-600",trend: "" },
            ].map(c => (
              <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default">
                <div className="flex items-start justify-between">
                  <div className={`inline-flex rounded-lg p-2.5 ${c.color}`}><c.icon className="h-4 w-4 text-white" /></div>
                  {c.trend && <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">{c.trend}</span>}
                </div>
                <p className="mt-3 text-xl font-bold text-gray-900 leading-tight">{loading ? "Memuat..." : c.value}</p>
                <p className="mt-0.5 text-xs font-medium text-gray-700">{c.label}</p>
                <p className="text-[10px] text-gray-400">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Grafik + Kategori */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            {/* Grafik 3D — 2/3 */}
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Grafik Omset & Tren Laba</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {loading ? "Memuat data..." : `${chartData.length} bulan terakhir · Hover titik untuk detail`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <span className="inline-block h-0.5 w-5 rounded bg-[#D62828]" />
                    <span className="inline-block h-2 w-2 -ml-1 rounded-full border border-[#D62828] bg-white" />
                    Omset
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <span className="inline-block h-0.5 w-5 rounded"
                      style={{ background: "repeating-linear-gradient(to right,#fb923c 0,#fb923c 4px,transparent 4px,transparent 7px)" }} />
                    <span className="inline-block h-2 w-2 -ml-1 rounded-full border border-[#fb923c] bg-white" />
                    Laba
                  </div>
                  {!loading && chartData.length > 0 && (
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
                      {chartData[0].bulan} – {chartData[chartData.length - 1].bulan} {periode}
                    </span>
                  )}
                </div>
              </div>
              <div className="px-0 py-2">
                <Chart3DRed data={chartData} />
              </div>
              {/* Info ringkasan bawah grafik */}
              {!loading && chartData.length > 0 && (() => {
                const totalO = chartData.reduce((s, d) => s + d.omset, 0);
                const totalL = chartData.reduce((s, d) => s + d.laba, 0);
                const best   = chartData.reduce((a, b) => a.omset > b.omset ? a : b);
                return (
                  <div className="flex items-center gap-4 border-t border-gray-100 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#D62828]" />
                      <span className="text-[10px] text-gray-500">Total Omset</span>
                      <span className="text-[10px] font-bold text-gray-800">{fmt(totalO)}</span>
                    </div>
                    <div className="h-3 w-px bg-gray-200" />
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#fb923c]" />
                      <span className="text-[10px] text-gray-500">Total Laba</span>
                      <span className="text-[10px] font-bold text-gray-800">{fmt(totalL)}</span>
                    </div>
                    <div className="h-3 w-px bg-gray-200" />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500">Bulan Terbaik</span>
                      <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-[#D62828]">
                        {best.bulan} · {fmt(best.omset)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Penjualan per Kategori — 1/3 */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-bold text-gray-800">Penjualan per Kategori</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">Klik irisan untuk detail</p>
              </div>
              <Pie3DKategori />
            </div>
          </div>

          {/* Ringkasan Laba Rugi */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="relative px-5 py-4 border-b border-gray-100"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=100&fit=crop')", backgroundSize: "cover" }}>
              <div className="absolute inset-0 bg-[#111827]/85" />
              <div className="relative flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Ringkasan Laba Rugi</h2>
                <span className="text-xs text-gray-300">Periode {periode}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-3">Keterangan</th>
                    <th className="px-5 py-3 text-right">Jumlah</th>
                    <th className="px-5 py-3 text-right">% Omset</th>
                    <th className="px-5 py-3 text-center">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { ket: "Total Omset / Pendapatan",    nilai: totalOmset,     pct: 100,                                note: "Semua transaksi paid",         cls: "text-gray-900 font-bold" },
                    { ket: "Harga Pokok Penjualan (HPP)", nilai: -totalHPP,      pct: -62,                                note: "Estimasi modal produk",        cls: "text-red-600" },
                    { ket: "Laba Kotor",                  nilai: labaKotor,      pct: marginPct,                          note: "Omset − HPP",                  cls: "text-green-700 font-bold" },
                    { ket: "Estimasi PPh Final (0,5%)",   nilai: -estimasiPPh,   pct: -(PPH_RATE * 100),                  note: "PP 55/2022 · Wajib UMKM",      cls: "text-orange-600" },
                    { ket: `Estimasi PPN (11%)`,          nilai: -estimasiPPN,   pct: isPKP ? -(PPN_RATE * 100) : 0,      note: isPKP ? "Wajib PKP" : "Non-PKP — tidak berlaku", cls: isPKP ? "text-red-600" : "text-gray-400" },
                    { ket: "Laba Bersih Estimasi",        nilai: labaBersih,     pct: totalOmset > 0 ? Math.round((labaBersih / totalOmset) * 100) : 0, note: "Setelah semua pajak", cls: "text-blue-700 font-bold" },
                  ].map((r, i) => (
                    <tr key={i} className={`hover:bg-gray-50 transition-colors ${i === 5 ? "bg-blue-50" : ""}`}>
                      <td className={`px-5 py-3 text-sm ${r.cls}`}>
                        {r.ket}
                        {r.ket.includes("PPN") && !isPKP && (
                          <span className="ml-2 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-400">Non-PKP</span>
                        )}
                        {r.ket.includes("PPN") && isPKP && (
                          <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold text-red-600">PKP</span>
                        )}
                      </td>
                      <td className={`px-5 py-3 text-right text-sm ${r.cls}`}>
                        {r.nilai < 0 ? `(${fmt(Math.abs(r.nilai))})` : fmt(r.nilai)}
                      </td>
                      <td className={`px-5 py-3 text-right text-xs ${r.nilai < 0 ? "text-red-500" : "text-green-600"}`}>
                        {r.pct > 0 ? "+" : ""}{r.pct}%
                      </td>
                      <td className="px-5 py-3 text-center text-xs text-gray-400">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

/* ── 3D PIE CHART KOMPONEN ── */
function Pie3DKategori() {
  const [active, setActive] = useState<number | null>(null);
  const data = KATEGORI_DATA.filter(k => k.pct > 0);

  const CX = 110, CY = 88, RX = 78, RY = 36, DEPTH = 16;

  type Slice = { start: number; end: number; mid: number; k: typeof data[0]; idx: number };
  let cursor = -Math.PI / 2;
  const slices: Slice[] = data.map((k, idx) => {
    const angle = (k.pct / 100) * 2 * Math.PI;
    const s = { start: cursor, end: cursor + angle, mid: cursor + angle / 2, k, idx };
    cursor += angle;
    return s;
  });

  function ep(angle: number, dy = 0, ex = 0, ey = 0) {
    return { x: CX + RX * Math.cos(angle) + ex, y: CY + RY * Math.sin(angle) + dy + ey };
  }

  function topPath(s: Slice, ex = 0, ey = 0) {
    const p1 = ep(s.start, 0, ex, ey);
    const p2 = ep(s.end,   0, ex, ey);
    const lg = s.end - s.start > Math.PI ? 1 : 0;
    return `M ${CX+ex} ${CY+ey} L ${p1.x} ${p1.y} A ${RX} ${RY} 0 ${lg} 1 ${p2.x} ${p2.y} Z`;
  }

  function wallPath(s: Slice, ex = 0, ey = 0) {
    const pts: string[] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const a = s.start + (s.end - s.start) * (i / steps);
      if (Math.sin(a) <= 0) continue;
      const p = ep(a, 0, ex, ey);
      pts.push(`${p.x},${p.y}`);
    }
    if (pts.length < 2) return "";
    const bot = pts.map(pt => { const [x,y] = pt.split(",").map(Number); return `${x},${y+DEPTH}`; });
    return `M ${pts[0]} L ${pts.join(" L ")} L ${bot[bot.length-1]} L ${[...bot].reverse().join(" L ")} Z`;
  }

  const fmtV = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col flex-1 px-4 py-4">
      <svg viewBox="0 0 220 195" className="w-full" style={{ maxHeight: 195 }}>
        <defs>
          {slices.map((s, i) => (
            <linearGradient key={i} id={`pg${i}`} x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%"   stopColor={s.k.color} stopOpacity="1" />
              <stop offset="100%" stopColor={s.k.color} stopOpacity="0.6" />
            </linearGradient>
          ))}
        </defs>

        {/* Bayangan elips bawah */}
        <ellipse cx={CX} cy={CY + DEPTH + 4} rx={RX - 2} ry={RY - 4} fill="#00000015" />

        {/* Side walls */}
        {slices.map((s, i) => {
          const isAct = active === i;
          const ex = isAct ? 7 * Math.cos(s.mid) : 0;
          const ey = isAct ? 5 * Math.sin(s.mid) : 0;
          const w = wallPath(s, ex, ey);
          if (!w) return null;
          return (
            <path key={`w${i}`} d={w}
              fill={s.k.color} opacity={isAct ? 0.55 : 0.38}
              style={{ cursor: "pointer" }}
              onClick={() => setActive(active === i ? null : i)}
            />
          );
        })}

        {/* Top faces */}
        {slices.map((s, i) => {
          const isAct = active === i;
          const ex = isAct ? 7 * Math.cos(s.mid) : 0;
          const ey = isAct ? 5 * Math.sin(s.mid) : 0;
          return (
            <path key={`t${i}`}
              d={topPath(s, ex, ey)}
              fill={`url(#pg${i})`}
              stroke="white" strokeWidth="1.5"
              opacity={active !== null && !isAct ? 0.55 : 1}
              style={{ cursor: "pointer", filter: isAct ? "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" : "none", transition: "opacity 0.2s" }}
              onClick={() => setActive(active === i ? null : i)}
            />
          );
        })}

        {/* Label di luar irisan */}
        {slices.map((s, i) => {
          const isAct = active === i;
          const ex = isAct ? 7 * Math.cos(s.mid) : 0;
          const ey = isAct ? 5 * Math.sin(s.mid) : 0;
          const lx = CX + (RX * 1.38) * Math.cos(s.mid) + ex;
          const ly = CY + (RY * 1.38) * Math.sin(s.mid) + ey;
          return (
            <g key={`l${i}`} style={{ pointerEvents: "none" }}>
              <text x={lx} y={ly - 1} textAnchor="middle"
                fontSize={isAct ? 9.5 : 8.5} fontWeight="800" fill={s.k.color}>
                {s.k.pct}%
              </text>
              <text x={lx} y={ly + 8} textAnchor="middle"
                fontSize={6.5} fontWeight="600" fill="#6b7280">
                {s.k.nama}
              </text>
            </g>
          );
        })}

        {/* Center */}
        <ellipse cx={CX} cy={CY} rx={26} ry={12} fill="white" opacity={0.95} />
        <text x={CX} y={CY - 1} textAnchor="middle" fontSize={8.5} fontWeight="900" fill="#111827">100%</text>
        <text x={CX} y={CY + 8} textAnchor="middle" fontSize={5.5} fill="#9ca3af" fontWeight="600">Total</text>
      </svg>

      {/* Detail / legend */}
      {active !== null ? (
        <div className="mt-2 rounded-xl px-4 py-3 border transition-all"
          style={{ background: data[active].color + "10", borderColor: data[active].color + "35" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full inline-block" style={{ background: data[active].color }} />
              <span className="text-xs font-bold text-gray-800">{data[active].nama}</span>
            </div>
            <span className="text-base font-black" style={{ color: data[active].color }}>{data[active].pct}%</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-gray-600">{fmtV(data[active].nilai)}</p>
          <p className="text-[10px] text-gray-400">dari total omset bulan ini</p>
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {data.map((k, i) => (
            <button key={k.nama} onClick={() => setActive(i)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: k.color + "0f", border: `1px solid ${k.color}25` }}>
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: k.color }} />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-700 truncate">{k.nama}</p>
                <p className="text-[10px] font-black" style={{ color: k.color }}>{k.pct}%</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
