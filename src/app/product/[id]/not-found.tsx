import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Ilustrasi / Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
          <svg
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>

        {/* Pesan Error */}
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Produk Tidak Ditemukan
        </h1>
        <p className="mb-8 text-sm text-gray-600">
          Maaf, produk yang Anda cari tidak tersedia atau telah dihapus.
        </p>

        {/* Tombol Kembali */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[#D62828] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] active:bg-[#991B1B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog
        </Link>
      </div>
    </div>
  );
}
