"use client";

import { useCart } from "@/lib/useCart";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string | null;
  productStock: number;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage,
  productStock,
  disabled = false,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();

  function handleAddToCart() {
    const success = addToCart({
      id: productId,
      nama: productName,
      harga: productPrice,
      image_url: productImage,
      stok: productStock,
    });

    // Item sudah masuk cart (localStorage), user bisa cek di halaman checkout
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled}
      className="w-full rounded-lg bg-[#D62828] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] active:bg-[#991B1B] disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      {disabled ? "Stok Habis" : "Tambah ke Keranjang"}
    </button>
  );
}
