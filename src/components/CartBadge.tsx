"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/useCart";

export default function CartBadge() {
  const { getTotalItems } = useCart();
  const total = getTotalItems();

  return (
    <Link href="/checkout" className="relative text-current" aria-label="Keranjang belanja">
      <ShoppingCart className="h-6 w-6 text-current" />
      {total > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-gray-900">
          {total}
        </span>
      )}
    </Link>
  );
}
