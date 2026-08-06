"use client";

import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook untuk membatasi aksi yang hanya boleh dilakukan oleh buyer.
 * Mengembalikan fungsi `canAddToCart` yang bisa dipanggil saat user menekan tombol.
 *
 * - Guest (belum login) → false
 * - Admin (role "admin") → false
 * - Buyer (role "buyer") → true
 */
export function useBuyerGuard() {
  const canAddToCart = useCallback(async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return false;

    const { data } = await supabase
      .from("users")
      .select("role_id, roles(nama_role)")
      .eq("email", user.email)
      .maybeSingle();

    const roleData = data as any;
    const roleName = roleData?.roles?.[0]?.nama_role || roleData?.roles?.nama_role;

    if (!roleName) {
      const cookieRole = document.cookie
        .split("; ")
        .find((c) => c.startsWith("userRole="))
        ?.split("=")[1];

      return cookieRole === "buyer";
    }

    return roleName === "buyer";
  }, []);

  return { canAddToCart };
}
