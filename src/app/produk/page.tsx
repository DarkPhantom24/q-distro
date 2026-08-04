"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { Search, Plus, AlertTriangle, Package, Edit2, Boxes, TrendingDown, X, Trash2 } from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

interface Product {
  id: string;
  nama: string;
  harga: number;
  size: string | null;
  warna: string | null;
  stok: number;
  kategori: string;
  image_url: string | null;
}

const MOCK: Product[] = [
  { id:"1", nama:"Kaos Distro Katun Premium", harga:120000, size:"L", warna:"Hitam", stok:15, kategori:"Kaos", image_url:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop" },
  { id:"2", nama:"Jaket Denim Original", harga:285000, size:"M", warna:"Biru", stok:2, kategori:"Jaket", image_url:"https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=80&h=80&fit=crop" },
  { id:"3", nama:"Topi Snapback Custom", harga:75000, size:"All Size", warna:"Merah", stok:20, kategori:"Aksesoris", image_url:"https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=80&h=80&fit=crop" },
  { id:"4", nama:"Kaos Oversize Streetwear", harga:135000, size:"XL", warna:"Putih", stok:1, kategori:"Kaos", image_url:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=80&h=80&fit=crop" },
  { id:"5", nama:"Celana Chino Slim Fit", harga:195000, size:"30", warna:"Khaki", stok:8, kategori:"Celana", image_url:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=80&h=80&fit=crop" },
  { id:"6", nama:"Jaket Hoodie Parasut", harga:245000, size:"L", warna:"Hitam", stok:5, kategori:"Jaket", image_url:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=80&h=80&fit=crop" },
  { id:"7", nama:"Gantungan Kunci Kulit", harga:35000, size:"All Size", warna:"Coklat", stok:30, kategori:"Aksesoris", image_url:"https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=80&h=80&fit=crop" },
  { id:"8", nama:"Celana Jogger Premium", harga:175000, size:"32", warna:"Abu-abu", stok:3, kategori:"Celana", image_url:"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=80&h=80&fit=crop" },
  { id:"9", nama:"Kaos Polo Distro", harga:145000, size:"M", warna:"Biru Navy", stok:12, kategori:"Kaos", image_url:"https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=80&h=80&fit=crop" },
  { id:"10", nama:"Jaket Bomber Supreme", harga:320000, size:"L", warna:"Hitam", stok:4, kategori:"Jaket", image_url:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=80&h=80&fit=crop" },
  { id:"11", nama:"Tas Selempang Canvas", harga:95000, size:"All Size", warna:"Krem", stok:18, kategori:"Aksesoris", image_url:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80&h=80&fit=crop" },
  { id:"12", nama:"Celana Cargo Tactical", harga:215000, size:"31", warna:"Hijau Tua", stok:0, kategori:"Celana", image_url:"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=80&h=80&fit=crop" },
];

const KATEGORI = ["Semua", "Kaos", "Jaket", "Celana", "Aksesoris"];

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>(MOCK);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [filterStok, setFilterStok] = useState<"semua"|"rendah"|"habis">("semua");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nama: "", harga: "", kategori: "Kaos", size: "", warna: "", stok: "", image_url: "" });

  function resetForm() {
    setForm({ nama: "", harga: "", kategori: "Kaos", size: "", warna: "", stok: "", image_url: "" });
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({ nama: p.nama, harga: String(p.harga), kategori: p.kategori, size: p.size ?? "", warna: p.warna ?? "", stok: String(p.stok), image_url: p.image_url ?? "" });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.nama.trim() || !form.harga || !form.stok) {
      alert("Nama, harga, dan stok wajib diisi!"); return;
    }
    setSaving(true);
    try {
      const { data: catData } = await supabase
        .from("categories").select("id").eq("nama", form.kategori).single();
      const categoryId = catData?.id ?? null;

      if (editProduct) {
        // UPDATE
        const { error: prodError } = await supabase.from("products").update({
          nama: form.nama, harga: Number(form.harga),
          size: form.size || null, warna: form.warna || null,
          image_url: form.image_url || null, category_id: categoryId,
        }).eq("id", editProduct.id);
        if (prodError) throw prodError;
        await supabase.from("stocks").update({ jumlah_stok: Number(form.stok) }).eq("product_id", editProduct.id);
        setProducts(prev => prev.map(p => p.id === editProduct.id ? {
          ...p, nama: form.nama, harga: Number(form.harga),
          size: form.size || null, warna: form.warna || null,
          stok: Number(form.stok), kategori: form.kategori, image_url: form.image_url || null,
        } : p));
      } else {
        // INSERT
        const { data: prodData, error: prodError } = await supabase
          .from("products")
          .insert({ nama: form.nama, harga: Number(form.harga), size: form.size || null, warna: form.warna || null, image_url: form.image_url || null, category_id: categoryId })
          .select("id").single();
        if (prodError) throw prodError;
        await supabase.from("stocks").insert({ product_id: prodData.id, jumlah_stok: Number(form.stok) });
        setProducts(prev => [...prev, {
          id: prodData.id.toString(), nama: form.nama, harga: Number(form.harga),
          size: form.size || null, warna: form.warna || null,
          stok: Number(form.stok), kategori: form.kategori, image_url: form.image_url || null,
        }]);
      }
      setShowModal(false);
      setEditProduct(null);
      resetForm();
    } catch (e: any) {
      alert("Gagal menyimpan: " + (e?.message ?? "Error tidak diketahui"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Hapus produk "${p.nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await supabase.from("stocks").delete().eq("product_id", p.id);
      const { error } = await supabase.from("products").delete().eq("id", p.id);
      if (error) throw error;
      setProducts(prev => prev.filter(x => x.id !== p.id));
    } catch (e: any) {
      alert("Gagal menghapus: " + (e?.message ?? "Error tidak diketahui"));
    }
  }

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, nama, harga, size, warna, image_url, categories(nama), stocks(jumlah_stok)")
        .order("nama");
      if (!error && data && data.length > 0) {
        setProducts(data.map((p: any) => ({
          id: p.id.toString(), nama: p.nama, harga: Number(p.harga),
          size: p.size, warna: p.warna, image_url: p.image_url,
          stok: p.stocks?.jumlah_stok ?? 0,
          kategori: p.categories?.nama ?? "Lainnya",
        })));
      }
      setLoading(false);
    }
    fetch();
  }, []);

  const filtered = products.filter(p => {
    const matchKat = kategori === "Semua" || p.kategori === kategori;
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchStok = filterStok === "semua" || (filterStok === "rendah" && p.stok > 0 && p.stok <= 5) || (filterStok === "habis" && p.stok === 0);
    return matchKat && matchSearch && matchStok;
  });

  const totalStok = products.reduce((s, p) => s + p.stok, 0);
  const stokRendah = products.filter(p => p.stok > 0 && p.stok <= 5).length;
  const stokHabis = products.filter(p => p.stok === 0).length;
  const nilaiInventori = products.reduce((s, p) => s + p.harga * p.stok, 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader title="Produk & Stok" subtitle="Manajemen inventori produk distro" />
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              { label: "Total Produk", value: `${products.length} item`, icon: Package,       color: "bg-blue-600",    bg: "bg-blue-50" },
              { label: "Total Stok",   value: `${totalStok} pcs`,        icon: Boxes,         color: "bg-green-600",   bg: "bg-green-50" },
              { label: "Stok Rendah",  value: `${stokRendah} produk`,    icon: TrendingDown,  color: "bg-orange-500",  bg: "bg-orange-50" },
              { label: "Stok Habis",   value: `${stokHabis} produk`,     icon: AlertTriangle, color: "bg-[#D62828]",   bg: "bg-red-50" },
            ].map(c => (
              <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default">
                <div className={`inline-flex rounded-lg p-2.5 ${c.color}`}>
                  <c.icon className="h-4 w-4 text-white" />
                </div>
                <p className="mt-3 text-xl font-bold text-gray-900">{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Nilai Inventori Banner */}
          <div
            className="relative overflow-hidden rounded-xl p-5 text-white"
            style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #D62828 100%)" }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
            <div className="absolute -right-4 bottom-0 h-20 w-20 rounded-full bg-white/5" />
            <p className="text-xs font-semibold uppercase tracking-widest text-red-200">Nilai Total Inventori</p>
            <p className="mt-1 text-3xl font-black">{fmt(nilaiInventori)}</p>
            <p className="mt-0.5 text-xs text-red-200">Berdasarkan harga jual × stok tersedia</p>
          </div>

          {/* Filter & Search */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama produk..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#D62828] focus:ring-1 focus:ring-red-100" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {KATEGORI.map(k => (
                  <button key={k} onClick={() => setKategori(k)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      kategori === k ? "bg-[#D62828] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>{k}</button>
                ))}
                <div className="w-px bg-gray-200 mx-1" />
                {(["semua","rendah","habis"] as const).map(f => (
                  <button key={f} onClick={() => setFilterStok(f)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      filterStok === f
                        ? f === "habis" ? "bg-red-600 text-white" : f === "rendah" ? "bg-orange-500 text-white" : "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {f === "semua" ? "Semua Stok" : f === "rendah" ? "⚠ Stok Rendah" : "🚫 Habis"}
                  </button>
                ))}
              </div>
              <button onClick={() => { resetForm(); setEditProduct(null); setShowModal(true); }}
                className="flex items-center gap-2 rounded-lg bg-[#D62828] px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors whitespace-nowrap">
                <Plus className="h-4 w-4" /> Tambah Produk
              </button>
            </div>
          </div>

          {/* Tabel Produk */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-3">Produk</th>
                    <th className="px-5 py-3">Kategori</th>
                    <th className="px-5 py-3">Ukuran</th>
                    <th className="px-5 py-3">Warna</th>
                    <th className="px-5 py-3 text-right">Harga</th>
                    <th className="px-5 py-3 text-center">Stok</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={8} className="py-12 text-center text-gray-400 text-sm">Memuat data...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-gray-400 text-sm">Tidak ada produk ditemukan</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img  src={p.image_url || "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=80&h=80&fit=crop"} alt={p.nama} className="h-10 w-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                          <p className="font-semibold text-gray-800 text-xs leading-snug max-w-[160px]">{p.nama}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{p.kategori}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600">{p.size ?? "—"}</td>
                      <td className="px-5 py-3 text-xs text-gray-600">{p.warna ?? "—"}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-800 text-xs">{fmt(p.harga)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-sm font-bold ${p.stok === 0 ? "text-red-500" : p.stok <= 5 ? "text-orange-500" : "text-green-600"}`}>
                          {p.stok}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          p.stok === 0 ? "bg-red-100 text-red-700" :
                          p.stok <= 5 ? "bg-orange-100 text-orange-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {p.stok === 0 ? "Habis" : p.stok <= 5 ? "Rendah" : "Tersedia"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openEdit(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px] font-semibold text-gray-600 hover:border-[#D62828] hover:text-[#D62828] transition-colors">
                            <Edit2 className="h-3 w-3" /> Edit
                          </button>
                          <button onClick={() => handleDelete(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors">
                            <Trash2 className="h-3 w-3" /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
              Menampilkan {filtered.length} dari {products.length} produk
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL TAMBAH PRODUK ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-bold text-gray-900">
                {editProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
              <button onClick={() => { setShowModal(false); setEditProduct(null); }} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Body */}
            <div className="space-y-3 px-6 py-5">
              {([
                { label: "Nama Produk *", key: "nama", placeholder: "Contoh: Kaos Distro Premium" },
                { label: "Harga (Rp) *", key: "harga", placeholder: "Contoh: 120000", numeric: true },
                { label: "Stok Awal *", key: "stok", placeholder: "Contoh: 10", numeric: true },
                { label: "Ukuran", key: "size", placeholder: "Contoh: M, L, XL, All Size" },
                { label: "Warna", key: "warna", placeholder: "Contoh: Hitam" },
                { label: "URL Gambar", key: "image_url", placeholder: "https://..." },
              ] as const).map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: (f as any).numeric ? e.target.value.replace(/\D/g, "") : e.target.value }))}
                    placeholder={f.placeholder}
                    inputMode={(f as any).numeric ? "numeric" : "text"}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#D62828] focus:ring-1 focus:ring-red-100 placeholder:text-gray-400"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
                <select value={form.kategori} onChange={e => setForm(prev => ({ ...prev, kategori: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#D62828] focus:ring-1 focus:ring-red-100">
                  {["Kaos","Jaket","Celana","Aksesoris"].map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
            </div>
            {/* Footer */}
            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button onClick={() => { setShowModal(false); setEditProduct(null); }}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 rounded-lg bg-[#D62828] py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                {saving ? "Menyimpan..." : editProduct ? "Simpan Perubahan" : "Simpan Produk"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
