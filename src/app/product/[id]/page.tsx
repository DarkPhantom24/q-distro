import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import ProfileMenu from "@/components/ProfileMenu";
import CartBadge from "@/components/CartBadge";
import AddToCartButton from "@/components/AddToCartButton";

/* ==========================================
   TIPE DATA
   ========================================== */

interface ProductDetail {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga: number;
  size: string | null;
  warna: string | null;
  image_url: string | null;
  created_at: string;
  kategori: string;
  stok: number;
}

/* ==========================================
   HELPER - Format Harga ke Rupiah
   ========================================== */

function formatRupiah(harga: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(harga);
}

/* ==========================================
   METADATA PAGE
   ========================================== */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabase
    .from("products")
    .select("nama")
    .eq("id", id)
    .single();

  return {
    title: data?.nama || "Produk Tidak Ditemukan",
    description: `Detail produk ${data?.nama || ""} dari Q-Distro`,
  };
}

/* ==========================================
   KOMPONEN UTAMA - SERVER COMPONENT
   ========================================== */

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch data produk dari Supabase
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      nama,
      deskripsi,
      harga,
      size,
      warna,
      image_url,
      created_at,
      categories(nama),
      stocks(jumlah_stok)
    `)
    .eq("id", id)
    .single();

  // Handle error atau produk tidak ditemukan
  if (error || !product) {
    notFound();
  }

  // Map data ke interface
  const produk: ProductDetail = {
    id: Number(product.id),
    nama: product.nama,
    deskripsi: product.deskripsi || null,
    harga: Number(product.harga),
    size: product.size || null,
    warna: product.warna || null,
    image_url: product.image_url || null,
    created_at: product.created_at,
    kategori: (product.categories as any)?.nama || "Lainnya",
    stok: (product.stocks as any)?.jumlah_stok || 0,
  };

  // Tentukan status stok
  const stokHabis = produk.stok === 0;
  const stokRendah = produk.stok > 0 && produk.stok < 5;

  // Ambil nama user dari cookie
  let namaUser: string | null = null;
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("userEmail")?.value;
  if (userEmail) {
    const { data: userData } = await supabase
      .from("users")
      .select("nama")
      .eq("email", userEmail)
      .single();
    namaUser = userData?.nama || null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#D62828] shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-white">
            Q-Distro
          </Link>
          <div className="flex items-center gap-5">
            <CartBadge />
            <ProfileMenu namaUser={namaUser} />
          </div>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Tombol Back + Judul */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            aria-label="Kembali ke katalog"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Detail Produk</h1>
        </div>

        {/* CONTAINER KOTAK */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="flex flex-col gap-8 p-6 md:flex-row md:p-8">

            {/* KOLOM KIRI - GAMBAR */}
            <div className="w-full md:w-1/2">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="relative aspect-square w-full bg-gray-100">
                  {produk.image_url ? (
                    <img
                      src={produk.image_url}
                      alt={produk.nama}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-gray-400">Gambar tidak tersedia</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* KOLOM KANAN - INFO */}
            <div className="flex w-full flex-col gap-5 md:w-1/2">
              {/* Nama */}
              <h1 className="text-2xl font-bold leading-snug text-gray-900">
                {produk.nama}
              </h1>

              {/* Kategori */}
              <div className="border-b border-gray-200 pb-4">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {produk.kategori}
                </span>
              </div>

              {/* Harga */}
              <p className="text-3xl font-bold text-[#D62828]">
                {formatRupiah(produk.harga)}
              </p>

              {/* Stok */}
              <div className="border-b border-gray-200 pb-4">
                {stokHabis ? (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-500">
                    Stok Habis
                  </span>
                ) : stokRendah ? (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-600">
                    Sisa stok: {produk.stok}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
                    Stok: {produk.stok}
                  </span>
                )}
              </div>

              {/* Deskripsi */}
              {produk.deskripsi && (
                <div>
                  <h3 className="mb-2 text-base font-semibold text-gray-900">
                    Deskripsi Produk
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {produk.deskripsi}
                  </p>
                </div>
              )}

              {/* Detail Tambahan */}
              {(produk.size || produk.warna) && (
                <div className="border-b border-gray-200 pb-4">
                  <dl className="space-y-2">
                    {produk.size && (
                      <div className="flex items-center gap-3">
                        <dt className="w-24 text-sm text-gray-500">Ukuran</dt>
                        <dd className="text-sm font-medium text-gray-900">{produk.size}</dd>
                      </div>
                    )}
                    {produk.warna && (
                      <div className="flex items-center gap-3">
                        <dt className="w-24 text-sm text-gray-500">Warna</dt>
                        <dd className="text-sm font-medium text-gray-900">{produk.warna}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Total Harga */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Harga</span>
                  <span className="text-2xl font-bold text-[#D62828]">
                    {formatRupiah(produk.harga)}
                  </span>
                </div>
              </div>

              {/* Tombol Tambah ke Keranjang */}
              <div>
                <AddToCartButton
                  productId={produk.id.toString()}
                  productName={produk.nama}
                  productPrice={produk.harga}
                  productImage={produk.image_url}
                  productStock={produk.stok}
                  disabled={stokHabis}
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
