"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import {
  User, Lock, Store, Bell, Shield, Save,
  Eye, EyeOff, CheckCircle, AlertCircle, ChevronRight,
  ArrowLeft, Package, Mail, Calculator, AlertTriangle, Smartphone,
} from "lucide-react";

const TABS = [
  { id: "profil",     label: "Profil Admin",   icon: User,   desc: "Nama, email, foto profil administrator" },
  { id: "keamanan",   label: "Keamanan",        icon: Lock,   desc: "Password, konfirmasi, dan sesi login aktif" },
  { id: "toko",       label: "Pengaturan Toko", icon: Store,  desc: "Nama, alamat, jam operasional toko" },
  { id: "notifikasi", label: "Notifikasi",      icon: Bell,   desc: "Preferensi notifikasi stok, transaksi, email" },
  { id: "sistem",     label: "Sistem",          icon: Shield, desc: "Pajak, stok minimum, mata uang, dan data" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${checked ? "bg-[#D62828]" : "bg-gray-200"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <p className="pb-2 text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>;
}

function SettingRow({ icon: Icon, label, desc, children }: {
  icon: React.ElementType; label: string; desc?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 shadow-sm px-5 py-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState("");

  const [nama, setNama]           = useState("Admin Q-Distro");
  const [email]                   = useState("admin@qualitydistro.com");
  const [noTelp, setNoTelp]       = useState("081234567890");
  const [alamat, setAlamat]       = useState("Jl. Raya Distro No. 1");

  const [pwLama, setPwLama]       = useState("");
  const [pwBaru, setPwBaru]       = useState("");
  const [pwKonfirm, setPwKonfirm] = useState("");
  const [showPw, setShowPw]       = useState(false);

  const [namaToko, setNamaToko]       = useState("Quality Distro");
  const [deskToko, setDeskToko]       = useState("Toko distro berkualitas dengan harga terjangkau");
  const [alamatToko, setAlamatToko]   = useState("Jl. Raya Distro No. 1, Kota");
  const [teleponToko, setTeleponToko] = useState("081234567890");
  const [jamBuka, setJamBuka]         = useState("08:00");
  const [jamTutup, setJamTutup]       = useState("21:00");

  const [notifStok, setNotifStok]           = useState(true);
  const [notifTransaksi, setNotifTransaksi] = useState(true);
  const [notifLaporan, setNotifLaporan]     = useState(false);
  const [notifEmail, setNotifEmail]         = useState(true);

  const [batasStok, setBatasStok] = useState("5");
  const [tarifPPh, setTarifPPh]   = useState("0.5");
  const [tarifPPN, setTarifPPN]   = useState("11");
  const [matauang, setMatauang]   = useState("IDR");
  const [modePajak, setModePajak] = useState(true);

  const inputCls = "w-full rounded-lg bg-white border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#D62828] focus:ring-2 focus:ring-red-100 transition-colors";

  async function handleSave() {
    setSaved(false); setError("");
    if (activeTab === "keamanan") {
      if (!pwLama || !pwBaru || !pwKonfirm) { setError("Semua field password wajib diisi."); return; }
      if (pwBaru !== pwKonfirm) { setError("Password baru dan konfirmasi tidak cocok."); return; }
      if (pwBaru.length < 6) { setError("Password baru minimal 6 karakter."); return; }
      const { error: err } = await supabase.auth.updateUser({ password: pwBaru });
      if (err) { setError(err.message); return; }
      setPwLama(""); setPwBaru(""); setPwKonfirm("");
    }
    if (activeTab === "profil") {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("users").update({ nama, no_telp: noTelp, alamat }).eq("email", user.email);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function goBack() { setActiveTab(null); setSaved(false); setError(""); }

  const activeLabel = TABS.find(t => t.id === activeTab)?.label ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader title="Pengaturan" subtitle="Konfigurasi akun, toko, dan sistem" />

        <main className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6">

          {/* ══ VIEW UTAMA — list bar full width ══ */}
          {!activeTab && (
            <div className="space-y-4">
              {/* Admin info card — gradient elegan */}
              <div className="relative overflow-hidden rounded-xl shadow-sm"
                style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #D62828 100%)" }}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)" }} />
                <div className="relative flex items-center gap-5 px-6 py-5">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-2xl font-black text-white shadow-lg">
                    {nama.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black text-white tracking-tight">{nama}</p>
                    <p className="text-xs text-white/60 mt-0.5">{email}</p>
                    <span className="mt-2 inline-block rounded-full bg-white/15 border border-white/20 px-3 py-0.5 text-[10px] font-bold text-white/90 uppercase tracking-widest">Administrator</span>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Q-Distro</span>
                    <span className="text-[10px] text-white/40">Smart Financial Hub</span>
                  </div>
                </div>
              </div>

              {/* Menu bars — full width tanpa max-w */}
              <div className="space-y-2">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className="flex w-full items-center gap-4 rounded-xl bg-white border border-gray-200 shadow-sm px-5 py-4 text-left transition-all hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 group">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-[#D62828] transition-colors">
                      <t.icon className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#D62828] transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ VIEW DETAIL — konten per tab ══ */}
          {activeTab && (
            <div className="w-full">

              {/* Breadcrumb + back */}
              <div className="flex items-center gap-3 mb-6">
                <button onClick={goBack}
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="h-4 w-4 text-gray-600" />
                </button>
                <p className="text-xs text-gray-400">
                  <span className="mx-1 text-gray-300">›</span>
                  <span className="text-gray-700 font-semibold">{activeLabel}</span>
                </p>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-6">{activeLabel}</h2>

              {/* Alert */}
              {saved && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-green-700">Pengaturan berhasil disimpan!</p>
                </div>
              )}
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">

                {/* ── PROFIL ── */}
                {activeTab === "profil" && (
                  <div className="max-w-3xl space-y-4">
                    <div className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 shadow-sm px-5 py-5">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#D62828] text-2xl font-black text-white shadow-md">
                        {nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{nama}</p>
                        <p className="text-xs text-gray-500">{email}</p>
                        <span className="mt-1.5 inline-block rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold text-red-600">Administrator</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-5 py-5 space-y-4">
                      <SectionLabel label="Informasi Akun" />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Nama Lengkap">
                          <input value={nama} onChange={e => setNama(e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Email" hint="Email digunakan untuk login">
                          <input value={email} type="email" className={inputCls + " bg-gray-50 cursor-not-allowed opacity-60"} disabled />
                        </Field>
                        <Field label="Nomor Telepon">
                          <input value={noTelp} onChange={e => setNoTelp(e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Role">
                          <input value="Administrator" className={inputCls + " bg-gray-50 cursor-not-allowed opacity-60"} disabled />
                        </Field>
                        <Field label="Alamat" hint="Alamat lengkap admin">
                          <textarea value={alamat} onChange={e => setAlamat(e.target.value)} rows={2} className={inputCls} />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── KEAMANAN ── */}
                {activeTab === "keamanan" && (
                  <div className="max-w-3xl space-y-4">
                    <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-5 py-5 space-y-4">
                      <SectionLabel label="Ubah Password" />
                      <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 flex gap-3">
                        <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-700">Gunakan password minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.</p>
                      </div>
                      <div className="space-y-4 max-w-md">
                        <Field label="Password Lama">
                          <div className="relative">
                            <input value={pwLama} onChange={e => setPwLama(e.target.value)}
                              type={showPw ? "text" : "password"} className={inputCls + " pr-10"} placeholder="Masukkan password lama" />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </Field>
                        <Field label="Password Baru">
                          <input value={pwBaru} onChange={e => setPwBaru(e.target.value)}
                            type={showPw ? "text" : "password"} className={inputCls} placeholder="Minimal 6 karakter" />
                        </Field>
                        <Field label="Konfirmasi Password Baru">
                          <input value={pwKonfirm} onChange={e => setPwKonfirm(e.target.value)}
                            type={showPw ? "text" : "password"} className={inputCls} placeholder="Ulangi password baru" />
                          {pwBaru && pwKonfirm && (
                            <p className={`mt-1 text-[11px] font-semibold ${pwBaru === pwKonfirm ? "text-green-600" : "text-red-500"}`}>
                              {pwBaru === pwKonfirm ? "✓ Password cocok" : "✗ Password tidak cocok"}
                            </p>
                          )}
                        </Field>
                      </div>
                    </div>
                    <SettingRow icon={Smartphone} label="Browser saat ini" desc="Login aktif · localhost:3000">
                      <span className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-bold text-green-700">Aktif</span>
                    </SettingRow>
                  </div>
                )}

                {/* ── TOKO ── */}
                {activeTab === "toko" && (
                  <div className="max-w-3xl space-y-4">
                    <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-5 py-5 space-y-4">
                      <SectionLabel label="Identitas Toko" />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Nama Toko">
                          <input value={namaToko} onChange={e => setNamaToko(e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Nomor Telepon Toko">
                          <input value={teleponToko} onChange={e => setTeleponToko(e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Deskripsi Toko" hint="Tampil di halaman utama">
                          <textarea value={deskToko} onChange={e => setDeskToko(e.target.value)} rows={2} className={inputCls} />
                        </Field>
                        <Field label="Alamat Toko">
                          <textarea value={alamatToko} onChange={e => setAlamatToko(e.target.value)} rows={2} className={inputCls} />
                        </Field>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-5 py-5">
                      <SectionLabel label="Jam Operasional" />
                      <div className="grid grid-cols-2 gap-4 max-w-xs mt-2">
                        <Field label="Jam Buka">
                          <input value={jamBuka} onChange={e => setJamBuka(e.target.value)} type="time" className={inputCls} />
                        </Field>
                        <Field label="Jam Tutup">
                          <input value={jamTutup} onChange={e => setJamTutup(e.target.value)} type="time" className={inputCls} />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── NOTIFIKASI ── */}
                {activeTab === "notifikasi" && (
                  <div className="space-y-2">
                    <SettingRow icon={Package} label="Peringatan Stok Rendah" desc="Notifikasi saat stok produk di bawah batas minimum">
                      <Toggle checked={notifStok} onChange={setNotifStok} />
                    </SettingRow>
                    <SettingRow icon={Bell} label="Transaksi Baru" desc="Notifikasi setiap ada transaksi masuk">
                      <Toggle checked={notifTransaksi} onChange={setNotifTransaksi} />
                    </SettingRow>
                    <SettingRow icon={Calculator} label="Laporan Keuangan" desc="Pengingat laporan keuangan bulanan">
                      <Toggle checked={notifLaporan} onChange={setNotifLaporan} />
                    </SettingRow>
                    <SettingRow icon={Mail} label="Notifikasi via Email" desc="Kirim notifikasi ke email admin">
                      <Toggle checked={notifEmail} onChange={setNotifEmail} />
                    </SettingRow>
                  </div>
                )}

                {/* ── SISTEM ── */}
                {activeTab === "sistem" && (
                  <div className="max-w-3xl space-y-4">
                    <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-5 py-5 space-y-4">
                      <SectionLabel label="Stok & Mata Uang" />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Batas Stok Rendah" hint="Produk di bawah angka ini ditandai merah">
                          <input value={batasStok} onChange={e => setBatasStok(e.target.value)} type="number" min="1" className={inputCls} />
                        </Field>
                        <Field label="Mata Uang">
                          <select value={matauang} onChange={e => setMatauang(e.target.value)} className={inputCls}>
                            <option value="IDR">IDR — Rupiah Indonesia</option>
                            <option value="USD">USD — US Dollar</option>
                          </select>
                        </Field>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-5 py-5 space-y-4">
                      <SectionLabel label="Konfigurasi Pajak" />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Tarif PPh Final (%)" hint="PP 55/2022 — default 0,5%">
                          <input value={tarifPPh} onChange={e => setTarifPPh(e.target.value)} type="number" step="0.1" min="0" className={inputCls} />
                        </Field>
                        <Field label="Tarif PPN (%)" hint="UU HPP 2021 — default 11%">
                          <input value={tarifPPN} onChange={e => setTarifPPN(e.target.value)} type="number" step="0.5" min="0" className={inputCls} />
                        </Field>
                      </div>
                    </div>
                    <SettingRow icon={Calculator} label="Kalkulasi Pajak Otomatis" desc="Hitung estimasi pajak otomatis di halaman laporan & pajak">
                      <Toggle checked={modePajak} onChange={setModePajak} />
                    </SettingRow>
                    <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-1">Zona Berbahaya</p>
                      <p className="text-xs text-red-400 mb-3">Tindakan berikut tidak dapat dibatalkan.</p>
                      <button className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors shadow-sm">
                        <AlertTriangle className="h-4 w-4" /> Reset Semua Data Laporan
                      </button>
                    </div>
                  </div>
                )}

                {/* Tombol Simpan */}
                <div className="flex justify-end pt-2">
                  <button onClick={handleSave}
                    className="flex items-center gap-2 rounded-xl bg-[#D62828] px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-md">
                    <Save className="h-4 w-4" /> Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
