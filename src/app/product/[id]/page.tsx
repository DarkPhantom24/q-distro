import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import SiteHeader from "@/components/SiteHeader";
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
    <div className="min-h-screen bg-gray-50">
      <SiteHeader namaUser={namaUser} />
      <ProductDetailClient produk={produk} similarProducts={similarProducts} />
    </div>
  );
}
