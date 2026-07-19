# Q-Distro

Web application e-commerce untuk toko distro "Quality Distro". Dibangun menggunakan **Next.js 16** (App Router) dengan **Supabase** sebagai database dan **Tailwind CSS 4** untuk styling.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Icons**: Lucide React
- **Runtime**: React 19

## Fitur

- **Katalog Produk** — Tampilan grid produk dengan filter kategori dan pencarian
- **Detail Produk** — Halaman detail dengan gambar, deskripsi, harga, stok, dan badge kategori
- **Keranjang Belanja** — Sistem cart persisten (localStorage) yang shared antar halaman
- **Checkout & Pembayaran** — Ringkasan pesanan, pilihan pengiriman (ambil/antar), dan simulasi pembayaran QRIS
- **Race Condition Safety** — Fungsi PostgreSQL RPC `checkout_product` yang mengamankan stok dari rebutan simultan

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- Akun Supabase dengan project aktif

### Installation

1. Clone repository:
   ```bash
   git clone https://github.com/your-username/q-distro.git
   cd q-distro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` ke `.env.local` dan isi credentials Supabase:
   ```bash
   cp .env.example .env.local
   ```

   atau buat file `.env.local` manual dengan konten:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
   ```

4. Jalankan SQL migration di Supabase SQL Editor:
   - `database.sql` — Schema awal dan seed data
   - `database_checkout.sql` — Fungsi RPC untuk checkout aman

5. Jalankan development server:
   ```bash
   npm run dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/public key Supabase |

## Database Schema

### Table: `roles`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | ID unik role |
| nama_role | VARCHAR(50) | Nama role (admin/buyer) |

### Table: `users`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | ID unik user |
| nama | VARCHAR(255) | Nama lengkap |
| email | VARCHAR(255) UNIQUE | Email (login) |
| password | VARCHAR(255) | Password hash (bcrypt) |
| no_telp | VARCHAR(20) | Nomor telepon |
| role_id | INTEGER → roles.id | Foreign key ke role |
| alamat | TEXT | Alamat lengkap |

### Table: `categories`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | ID unik kategori |
| nama | VARCHAR(100) UNIQUE | Nama kategori |
| deskripsi | TEXT | Deskripsi kategori |

### Table: `products`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | ID unik produk |
| nama | VARCHAR(255) | Nama produk |
| deskripsi | TEXT | Deskripsi produk |
| harga | NUMERIC(10,2) | Harga produk (IDR) |
| size | VARCHAR(20) | Ukuran produk |
| warna | VARCHAR(50) | Warna produk |
| image_url | TEXT | URL gambar produk |
| category_id | INTEGER → categories.id | Foreign key ke kategori |

### Table: `stocks`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | ID unik stok |
| product_id | INTEGER UNIQUE → products.id | Foreign key ke produk |
| jumlah_stok | INTEGER | Jumlah stok tersedia |
| last_update | TIMESTAMP | Terakhir diupdate |

### Table: `orders`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | ID unik order |
| customer_name | VARCHAR(255) | Nama pembeli |
| tanggal_order | DATE | Tanggal pemesanan |
| total_harga | NUMERIC(12,2) | Total harga |
| user_id | INTEGER → users.id | Foreign key ke user |

### Table: `order_details`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | ID unik detail |
| order_id | INTEGER → orders.id | Foreign key ke order |
| product_id | INTEGER → products.id | Foreign key ke produk |
| jumlah | INTEGER | Jumlah item |
| harga_satuan | NUMERIC(10,2) | Harga per item |
| subtotal | NUMERIC(12,2) | Subtotal item |

### Table: `payments`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | ID unik pembayaran |
| order_id | INTEGER UNIQUE → orders.id | Foreign key ke order |
| metode_pembayaran | VARCHAR(50) | Metode bayar |
| jumlah_bayar | NUMERIC(12,2) | Jumlah dibayar |
| bukti_pembayaran | TEXT | Link bukti bayar |
| status_pembayaran | VARCHAR(50) | Status (pending/paid) |

### Table: `payment_logs`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | ID unik log |
| payment_id | INTEGER → payments.id | Foreign key ke payment |
| status | VARCHAR(50) | Status perubahan |
| keterangan | TEXT | Keterangan log |

### Table: `tax_reports`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | ID unik laporan |
| payment_id | INTEGER UNIQUE → payments.id | Foreign key ke payment |
| total_omset | NUMERIC(12,2) | Total omset |
| total_transaksi | INTEGER | Jumlah transaksi |
| pkp_status | VARCHAR(50) | Status PKP |
| estimasi_ppn | NUMERIC(12,2) | Estimasi PPN |
| estimasi_pph | NUMERIC(12,2) | Estimasi PPh |

### Database Functions (RPC)
| Function | Parameters | Returns | Description |
|---|---|---|---|
| checkout_product | p_product_id: INTEGER | BOOLEAN | Mengurangi stok aman (race condition safe) |
| check_product_stock | p_product_id: INTEGER | INTEGER | Cek jumlah stok produk |

## Project Structure

```
q-distro/
├── public/
│   └── project/              # Wireframe & referensi desain
├── src/
│   ├── app/
│   │   ├── checkout/
│   │   │   └── page.tsx      # Halaman checkout & keranjang
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Detail produk
│   │   │       └── not-found.tsx # 404 produk tidak ditemukan
│   │   ├── success/
│   │   │   └── page.tsx      # Halaman pembayaran sukses
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx          # Halaman katalog utama
│   ├── components/
│   │   ├── AddToCartButton.tsx    # Tombol tambah ke keranjang
│   │   ├── CartBadge.tsx          # Badge counter keranjang di navbar
│   │   ├── CatalogPage.tsx        # Komponen katalog (client)
│   │   ├── ProductCard.tsx        # Card produk di katalog
│   │   └── ProfileMenu.tsx        # Menu profil user
│   └── lib/
│       ├── supabase.ts            # Supabase client
│       └── useCart.ts             # Cart hook (localStorage)
├── database.sql                   # Schema DB & seed data
├── database_checkout.sql          # RPC function untuk checkout
├── .env.example
└── package.json
```

## Catatan Pengembangan

- **Keranjang** menggunakan `localStorage` sebagai storage client-side. Data persist antar page navigation tetapi hilang jika user clear browser data.
- **Race condition** ditangani oleh PostgreSQL RPC `checkout_product` yang menggunakan `UPDATE ... WHERE stok > 0` dengan row-level locking.
- **Stok minimum** ditampilkan dengan warna merah (warna badge berubah) jika jumlah stok kurang dari 5.

## License

Project ini dibuat untuk keperluan tugas/proposal.
