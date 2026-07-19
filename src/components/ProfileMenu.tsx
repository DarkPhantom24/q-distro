"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileMenuProps {
  namaUser: string | null;
}

export default function ProfileMenu({ namaUser }: ProfileMenuProps) {
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
    return (
      <a href="/login" className="flex items-center gap-2 text-white hover:text-red-100 transition-colors">
        <User className="h-6 w-6" />
        <span className="text-sm font-medium hidden sm:inline">Masuk</span>
      </a>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-white hover:text-red-100 transition-colors"
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
