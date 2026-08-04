"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Package, Receipt,
  BarChart2, Calculator, Settings, ChevronRight, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",         icon: LayoutDashboard, href: "/dashboard" },
  { label: "Kasir / POS",       icon: ShoppingCart,    href: "/kasir" },
  { label: "Produk & Stok",     icon: Package,         href: "/produk" },
  { label: "Transaksi",         icon: Receipt,         href: "/transaksi" },
  { label: "Laporan Keuangan",  icon: BarChart2,       href: "/laporan" },
  { label: "Perhitungan Pajak", icon: Calculator,      href: "/pajak" },
  { label: "Pengaturan",        icon: Settings,        href: "/pengaturan" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#D62828] text-white shadow-lg transition active:scale-95 lg:hidden"
        aria-label="Buka menu admin"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-shrink-0 flex-col bg-[#111827] text-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="relative flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D62828] text-xl font-black">Q</div>
          <div className="leading-tight">
            <p className="text-sm font-bold">Q-Distro</p>
            <p className="text-[10px] text-gray-400">Smart Financial Hub</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu admin"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link key={label} href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-[#D62828] text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
                {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
