"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileMenuProps {
  namaUser: string | null;
  compact?: boolean;
}

export default function ProfileMenu({ namaUser, compact = false }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "userRole=; path=/; max-age=0";
    router.push("/");
    router.refresh();
  };

  if (!namaUser) {
    if (compact) {
      return (
        <Link href="/login" className="rounded-full p-2 text-current transition-colors hover:text-current">
          <User className="h-6 w-6" />
        </Link>
      );
    }

    return (
      <a href="/login" className="flex items-center gap-2 text-current hover:text-red-600 transition-colors">
        <User className="h-6 w-6" />
        <span className="text-sm font-medium hidden sm:inline">Masuk</span>
      </a>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-full p-2 text-current transition-colors hover:text-current"
      >
        <User className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-current hover:text-red-600 transition-colors"
      >
        <User className="h-6 w-6" />
        <span className="text-sm font-medium hidden sm:inline">{namaUser}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{namaUser}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
