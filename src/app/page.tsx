import { supabase } from "@/lib/supabase";
import { CatalogPage } from "@/components/CatalogPage";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/* ==========================================
   TIPE DATA
   ========================================== */

export interface Product {
  id: string;
  nama: string;
  harga: number;
  size: string | null;
  warna: string | null;
  stok: number;
  kategori: string;
  image_url: string | null;
  created_at: string;
}

/* ==========================================
   KOMPONEN UTAMA - SERVER COMPONENT
   ========================================== */

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ kategori?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const kategoriAktif = params?.kategori || "Semua";
  const queryPencarian = params?.search || "";
  const halamanSaatIni = parseInt(params?.page || "1", 10);

  // Fetch data dari Supabase
  let products: Product[] = [];
  let fetchError: string | null = null;

  try {
    // Fetch products dengan join ke categories dan stocks
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        nama,
        harga,
        size,
        warna,
        image_url,
        categories(nama),
        stocks(jumlah_stok)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (data) {
      products = data.map((item: any) => ({
        id: item.id.toString(),
        nama: item.nama,
        harga: Number(item.harga),
        size: item.size,
        warna: item.warna,
        stok: item.stocks?.jumlah_stok || 0,
        kategori: item.categories?.nama || "Lainnya",
        image_url: item.image_url,
        created_at: item.created_at,
      }));
    }
  } catch (err: any) {
    fetchError = err.message || "Gagal mengambil data dari server";
    // Fallback ke mock data jika Supabase gagal
    const now = new Date().toISOString();
    products = [
      { id: "1", nama: "Kaos Distro Katun Premium", harga: 120000, size: "L", warna: "Hitam", stok: 15, kategori: "Kaos", image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop", created_at: now },
      { id: "2", nama: "Jaket Denim Original", harga: 285000, size: "M", warna: "Biru", stok: 2, kategori: "Jaket", image_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop", created_at: now },
      { id: "3", nama: "Topi Snapback Custom", harga: 75000, size: "All Size", warna: "Merah", stok: 20, kategori: "Aksesoris", image_url: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop", created_at: now },
      { id: "4", nama: "Kaos Oversize Streetwear", harga: 135000, size: "XL", warna: "Putih", stok: 1, kategori: "Kaos", image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop", created_at: now },
      { id: "5", nama: "Celana Chino Slim Fit", harga: 195000, size: "30", warna: "Khaki", stok: 8, kategori: "Celana", image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop", created_at: now },
      { id: "6", nama: "Jaket Hoodie Parasut", harga: 245000, size: "L", warna: "Hitam", stok: 5, kategori: "Jaket", image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop", created_at: now },
      { id: "7", nama: "Gantungan Kunci Kulit", harga: 35000, size: "All Size", warna: "Coklat", stok: 30, kategori: "Aksesoris", image_url: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop", created_at: now },
      { id: "8", nama: "Celana Jogger Premium", harga: 175000, size: "32", warna: "Abu-abu", stok: 3, kategori: "Celana", image_url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop", created_at: now },
      { id: "9", nama: "Kaos Polo Distro", harga: 145000, size: "M", warna: "Biru Navy", stok: 12, kategori: "Kaos", image_url: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop", created_at: now },
      { id: "10", nama: "Hoodie Fleece Vintage", harga: 275000, size: "L", warna: "Coklat Muda", stok: 10, kategori: "Jaket", image_url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop", created_at: now },
      { id: "11", nama: "Kaos Graphic Art", harga: 115000, size: "M", warna: "Putih", stok: 7, kategori: "Kaos", image_url: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=400&h=400&fit=crop", created_at: now },
    ];
  }

  // Ambil nama user dari tabel users berdasarkan email di cookie
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
    <CatalogPage
      products={products}
      initialKategori={kategoriAktif}
      initialSearch={queryPencarian}
      initialPage={halamanSaatIni}
      fetchError={fetchError}
      namaUser={namaUser}
    />
  );
}
