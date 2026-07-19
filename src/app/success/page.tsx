import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        {/* Ikon Centang Hijau */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">Pembayaran Berhasil!</h1>
        <p className="mb-6 text-sm text-gray-600">
          Terima kasih telah berbelanja di Q-Distro. Pesanan Anda sedang diproses.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full rounded-lg bg-[#D62828] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C]"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
