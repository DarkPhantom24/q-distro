"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, User, Settings, LogOut, ChevronRight, Package, AlertTriangle, TrendingUp, X, Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

/* ─────────────────────────────────────────
   TIPE NOTIFIKASI
───────────────────────────────────────── */
type NotifType = "warning" | "success" | "info";

interface Notif {
  id: number;
  type: NotifType;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  href: string;
}

/* ─────────────────────────────────────────
   DATA NOTIFIKASI AWAL (mock — nanti bisa
   diganti fetch dari Supabase)
───────────────────────────────────────── */
const INITIAL_NOTIFS: Notif[] = [
  {
    id: 1,
    type: "warning",
    title: "Stok Hampir Habis",
    desc: "Jaket Denim Original — tersisa 2 unit",
    time: "5 menit lalu",
    read: false,
    href: "/produk",
  },
  {
    id: 2,
    type: "warning",
    title: "Stok Hampir Habis",
    desc: "Kaos Oversize Streetwear — tersisa 1 unit",
    time: "12 menit lalu",
    read: false,
    href: "/produk",
  },
  {
    id: 3,
    type: "success",
    title: "Transaksi Berhasil",
    desc: "Pembayaran Rp 360.000 dari Budi Santoso",
    time: "1 jam lalu",
    read: false,
    href: "/transaksi",
  },
  {
    id: 4,
    type: "info",
    title: "Estimasi Pajak Siap",
    desc: "Laporan PPh Final bulan ini telah dihitung",
    time: "2 jam lalu",
    read: true,
    href: "/pajak",
  },
  {
    id: 5,
    type: "success",
    title: "Transaksi Berhasil",
    desc: "Pembayaran Rp 285.000 dari Siti Rahayu",
    time: "3 jam lalu",
    read: true,
    href: "/transaksi",
  },
];

const TYPE_STYLE: Record<NotifType, { dot: string; bg: string; icon: React.ElementType; iconCls: string }> = {
  warning: { dot: "bg-orange-400", bg: "bg-orange-50",  icon: AlertTriangle, iconCls: "text-orange-500" },
  success: { dot: "bg-green-500",  bg: "bg-green-50",   icon: TrendingUp,    iconCls: "text-green-600"  },
  info:    { dot: "bg-blue-500",   bg: "bg-blue-50",    icon: Package,       iconCls: "text-blue-500"   },
};

/* ─────────────────────────────────────────
   KOMPONEN UTAMA
───────────────────────────────────────── */
export default function AdminHeader({ title, subtitle, onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  /* ── Ambil email user dari Supabase Auth ── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  /* ── State notifikasi ── */
  const [notifs, setNotifs]           = useState<Notif[]>(INITIAL_NOTIFS);
  const [showNotif, setShowNotif]     = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  /* ── Tutup dropdown saat klik di luar ── */
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  function dismissNotif(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setNotifs(prev => prev.filter(n => n.id !== id));
  }

  function handleNotifClick(n: Notif) {
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    setShowNotif(false);
    router.push(n.href);
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 sm:px-6 sm:py-3 shadow-sm flex-shrink-0 z-30">
      {/* Mobile menu button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="lg:hidden mr-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Buka menu admin"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Judul halaman - responsive */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[10px] sm:text-xs text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">

        {/* ── BELL NOTIFIKASI ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 active:scale-95"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D62828] text-[9px] font-black text-white leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown notifikasi */}
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
              {/* Header dropdown */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-bold text-gray-800">Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#D62828] px-1.5 py-0.5 text-[9px] font-black text-white">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-[#D62828] hover:underline"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              {/* List notifikasi */}
              <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifs.length === 0 ? (
                  <li className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <Bell className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-xs font-medium">Tidak ada notifikasi</p>
                  </li>
                ) : notifs.map(n => {
                  const s = TYPE_STYLE[n.type];
                  const Icon = s.icon;
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => handleNotifClick(n)}
                        className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${!n.read ? s.bg : ""}`}
                      >
                        {/* Ikon tipe */}
                        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${!n.read ? "bg-white shadow-sm" : "bg-gray-100"}`}>
                          <Icon className={`h-4 w-4 ${s.iconCls}`} />
                        </div>
                        {/* Konten */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {!n.read && <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${s.dot}`} />}
                            <p className={`text-xs leading-snug ${!n.read ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>
                              {n.title}
                            </p>
                          </div>
                          <p className="mt-0.5 text-[11px] text-gray-500 leading-snug line-clamp-2">{n.desc}</p>
                          <p className="mt-1 text-[10px] text-gray-400">{n.time}</p>
                        </div>
                        {/* Tombol dismiss */}
                        <button
                          onClick={(e) => dismissNotif(n.id, e)}
                          className="mt-0.5 flex-shrink-0 rounded-full p-1 text-gray-300 opacity-0 transition-all hover:bg-gray-200 hover:text-gray-600 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Footer dropdown */}
              <div className="border-t border-gray-100 px-4 py-2.5">
                <Link
                  href="/transaksi"
                  onClick={() => setShowNotif(false)}
                  className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#D62828] hover:underline"
                >
                  Lihat semua aktivitas <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── AVATAR ADMIN ── */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
            className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 pl-1.5 pr-3 py-1.5 transition-all hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm active:scale-95"
          >
            {/* Avatar circle — lebih besar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D62828] text-white shadow-sm">
              <User className="h-5 w-5" />
            </div>
            <div className="leading-tight text-left hidden sm:block">
              <p className="text-xs font-bold text-gray-800">Admin</p>
              <p className="text-[10px] text-gray-500">Q-Distro</p>
            </div>
            <ChevronRight className={`h-3.5 w-3.5 text-gray-400 transition-transform hidden sm:block ${showProfile ? "rotate-90" : ""}`} />
          </button>

          {/* Dropdown profil */}
          {showProfile && (
            <div className="absolute right-0 top-12 w-52 rounded-2xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
              {/* Info akun */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#D62828] text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">Admin</p>
                  <p className="text-[10px] text-gray-500 truncate">{userEmail || "admin@qualitydistro.com"}</p>
                  <span className="mt-1 inline-block rounded-full bg-red-50 border border-red-200 px-1.5 py-0.5 text-[9px] font-bold text-red-600 uppercase tracking-wide">
                    Administrator
                  </span>
                </div>
              </div>

              {/* Menu aksi */}
              <div className="py-1.5">
                <Link
                  href="/pengaturan"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#D62828]"
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  Profil & Pengaturan
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 py-1.5">
                <Link
                  href="/login"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  Keluar
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
