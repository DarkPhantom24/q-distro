"use client";

import Link from "next/link";
import { LogIn, UserPlus, X, ShoppingCart } from "lucide-react";

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function AuthRequiredModal({
  open,
  onClose,
  title = "Login dulu untuk lanjut belanja",
  message = "Untuk menambahkan produk ke keranjang, kamu harus masuk atau daftar sebagai buyer terlebih dahulu.",
}: AuthRequiredModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup popup"
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#D62828]">
          <ShoppingCart className="h-7 w-7" />
        </div>

        <h2 className="text-lg font-black text-gray-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{message}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#D62828] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
          >
            <LogIn className="h-4 w-4" />
            Masuk
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-[#D62828] transition hover:bg-red-100"
          >
            <UserPlus className="h-4 w-4" />
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}
