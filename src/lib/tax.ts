/**
 * Konstanta Pajak UMKM — Single Source of Truth
 * Dipakai oleh: Kasir/POS, Perhitungan Pajak, Laporan Keuangan
 *
 * Dasar hukum:
 *  - PPh Final 0,5%  → PP 55/2022
 *  - PPN 11%         → UU HPP 2021
 *  - Batas PKP       → PMK 197/2013 (Rp 4,8 M omset/tahun)
 */

export const PPH_RATE      = 0.005;          // 0,5% dari omset bruto
export const PPN_RATE      = 0.11;           // 11% — berlaku jika PKP
export const PKP_THRESHOLD = 4_800_000_000;  // Rp 4.800.000.000 / tahun

/**
 * Tentukan apakah toko berstatus PKP berdasarkan omset BULANAN.
 * Proyeksi tahunan = omset_bulan × 12
 */
export function hitungIsPKP(omsetBulan: number): boolean {
  return omsetBulan * 12 >= PKP_THRESHOLD;
}

/**
 * Hitung seluruh komponen pajak dari omset.
 * - pph   : PPh Final (selalu wajib jika UMKM)
 * - ppn   : PPN (hanya jika PKP)
 * - total : pph + ppn
 */
export function hitungPajak(omsetBulan: number): {
  isPKP: boolean;
  pph: number;
  ppn: number;
  total: number;
  omsetTahunanProyeksi: number;
} {
  const isPKP  = hitungIsPKP(omsetBulan);
  const pph    = Math.round(omsetBulan * PPH_RATE);
  const ppn    = isPKP ? Math.round(omsetBulan * PPN_RATE) : 0;
  return {
    isPKP,
    pph,
    ppn,
    total: pph + ppn,
    omsetTahunanProyeksi: omsetBulan * 12,
  };
}

/**
 * Hitung PPN yang dikenakan pada subtotal transaksi kasir.
 * Hanya berlaku saat toko berstatus PKP.
 */
export function hitungPPNKasir(subtotal: number, isPKP: boolean): number {
  return isPKP ? Math.round(subtotal * PPN_RATE) : 0;
}
