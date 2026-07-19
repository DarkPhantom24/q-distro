"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/* ==========================================
   HALAMAN LOGIN
   Layout 2 sisi: Kiri merah (branding), Kanan putih (form)
   ========================================== */

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  /* Handler submit form login */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Email atau password salah. Silakan coba lagi.");
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMsg("Email belum dikonfirmasi. Silakan cek inbox Anda.");
        } else {
          setErrorMsg(error.message || "Terjadi kesalahan saat login.");
        }
        setLoading(false);
        return;
      }

      // Login berhasil, ambil role dari tabel users
      if (data.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("role_id, roles(nama_role)")
          .eq("email", data.user.email)
          .single();

        const roleData = userData as any;
        const roleName =
          roleData?.roles?.[0]?.nama_role || roleData?.roles?.nama_role;

        if (roleName) {
          document.cookie = `userRole=${roleName}; path=/; max-age=86400`;
        } else {
          document.cookie = "userRole=buyer; path=/; max-age=86400";
        }
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ==========================================
          SISI KIRI - Background Merah + Branding
          ========================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#D62828] items-center justify-center relative overflow-hidden">
        {/* Dekorasi lingkaran */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-red-700/30" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-red-800/20" />

        {/* Konten branding */}
        <div className="relative z-10 text-center px-12">
          {/* Logo/Toko */}
          <div className="mx-auto mb-8 w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Quality Distro</h1>
          <p className="text-lg text-red-100 leading-relaxed">
            Belanja Produk Distro Berkualitas
            <br />
            dengan Harga Terjangkau!
          </p>
        </div>
      </div>

      {/* ==========================================
          SISI KANAN - Form Login
          ========================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Judul */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Login</h2>
            <p className="text-sm text-gray-500 mt-1">
              Masuk ke akun Quality Distro Anda
            </p>
          </div>

          {/* Pesan Error */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 11-8 0 4 4 0 018 0zm-4 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 5.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D62828] hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {loading ? "Masuk..." : "Masuk"}
            </button>
          </form>

          {/* Link Register */}
          <p className="text-center mt-6 text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-[#D62828] hover:underline font-medium"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
