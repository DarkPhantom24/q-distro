import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { Heart } from "lucide-react";
import ProfileMenu from "@/components/ProfileMenu";
import CartBadge from "@/components/CartBadge";
import ProductDetailClient from "@/components/ProductDetailClient";

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

  if (error || !product) {
    notFound();
  }

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

  const { data: similarRaw } = await supabase
    .from("products")
    .select(`
      id,
      nama,
      harga,
      image_url,
      categories(nama),
      stocks(jumlah_stok)
    `)
    .neq("id", id)
    .limit(5);

  const similarProducts = (similarRaw || []).map((item: any) => ({
    id: item.id.toString(),
    nama: item.nama,
    harga: Number(item.harga),
    image_url: item.image_url || null,
    kategori: item.categories?.nama || "Lainnya",
    stok: item.stocks?.jumlah_stok || 0,
  }));

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
    <div className="min-h-screen bg-[#f7f5f2]">
      <header className="sticky top-0 z-50 bg-[#D62828] shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 h-16 md:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            Q-DISTRO
          </Link>
          <div className="flex items-center gap-6 text-white text-sm font-medium">
            <button type="button" aria-label="Wishlist" className="inline-flex items-center gap-2 text-white text-sm font-medium transition hover:text-white/80 focus:outline-none">
              <Heart className="h-5 w-5" />
              <span className="hidden sm:inline">Wishlist</span>
            </button>
            <span className="inline-flex items-center gap-2 text-white text-sm font-medium">
              <CartBadge />
              <span className="hidden sm:inline">Keranjang</span>
            </span>
            <ProfileMenu namaUser={namaUser} />
          </div>
        </div>
      </header>

      <ProductDetailClient produk={produk} similarProducts={similarProducts} />
    </div>
  );
}
