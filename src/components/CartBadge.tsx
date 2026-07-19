"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/useCart";
import { useState, useEffect } from "react";

export default function CartBadge() {
  const { getTotalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Listen for cart updates
    const handler = () => setMounted((prev) => !prev);
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <Link href="/checkout" className="relative" aria-label="Keranjang belanja">
      <ShoppingCart className="h-6 w-6 text-white" />
      {totalItems > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-gray-900">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
