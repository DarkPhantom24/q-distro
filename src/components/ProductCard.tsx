"use client";

import { Product as ProductType } from "@/app/page";
import Link from "next/link";
import { useCart } from "@/lib/useCart";

interface ProductCardProps {
  produk: ProductType;
  formatRupiah: (harga: number) => string;
  onTambahKeranjang?: (namaProduk: string) => void;
}

export function ProductCard({ produk, formatRupiah }: ProductCardProps) {
  const stokRendah = produk.stok <= 3;
  const { addToCart } = useCart();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const success = addToCart({
      id: produk.id,
      nama: produk.nama,
      harga: produk.harga,
      image_url: produk.image_url,
      stok: produk.stok,
    });

    // Item sudah masuk cart (localStorage), user bisa cek di halaman checkout
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Link ke Detail Produk - Gambar & Info */}
      <Link href={`/product/${produk.id}`} className="flex flex-col flex-1">
        {/* Gambar Produk */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          <img
            src={produk.image_url || "/placeholder.jpg"}
            alt={produk.nama}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Info Produk */}
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          {/* Nama Produk */}
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800">
            {produk.nama}
          </h2>

          {/* Harga */}
          <p className="text-base font-bold text-gray-900">
            {formatRupiah(produk.harga)}
          </p>

          {/* Indikator Stok */}
          {stokRendah ? (
            <p className="text-xs font-semibold text-red-500">
              Sisa {produk.stok}!
            </p>
          ) : (
            <p className="text-xs text-gray-500">Stok: {produk.stok}</p>
          )}

          {/* Spacer */}
          <div className="flex-1" />
        </div>
      </Link>

      {/* Tombol Tambah ke Keranjang - Di luar Link */}
      <div className="p-3 pt-0">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full rounded-lg bg-green-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 active:bg-green-800"
        >
          Tambah ke Keranjang
        </button>
      </div>
    </article>
  );
}
