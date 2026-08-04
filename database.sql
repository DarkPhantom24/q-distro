-- ==========================================
-- QUALITY DISTRO - DATABASE SCHEMA
-- Sesuai ERD yang diberikan
-- ==========================================

-- ==========================================
-- 1. TABEL ROLES
-- ==========================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nama_role VARCHAR(50) NOT NULL
);

-- ==========================================
-- 2. TABEL USERS
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    no_telp VARCHAR(20),
    role_id INTEGER REFERENCES roles(id),
    alamat TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. TABEL CATEGORIES
-- ==========================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) UNIQUE NOT NULL,
    deskripsi TEXT
);

-- ==========================================
-- 4. TABEL PRODUCTS
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    harga NUMERIC(10, 2) NOT NULL,
    size VARCHAR(20),
    warna VARCHAR(50),
    image_url TEXT,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. TABEL STOCKS
-- ==========================================
CREATE TABLE IF NOT EXISTS stocks (
    id SERIAL PRIMARY KEY,
    product_id INTEGER UNIQUE REFERENCES products(id),
    jumlah_stok INTEGER NOT NULL DEFAULT 0,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. TABEL ORDERS
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    tanggal_order DATE NOT NULL,
    total_harga NUMERIC(12, 2) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. TABEL ORDER DETAILS
-- ==========================================
CREATE TABLE IF NOT EXISTS order_details (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    jumlah INTEGER NOT NULL,
    harga_satuan NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- ==========================================
-- 8. TABEL PAYMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER UNIQUE REFERENCES orders(id),
    metode_pembayaran VARCHAR(50) NOT NULL,
    jumlah_bayar NUMERIC(12, 2) NOT NULL,
    bukti_pembayaran TEXT,
    status_pembayaran VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 9. TABEL PAYMENT LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS payment_logs (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id),
    status VARCHAR(50) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 10. TABEL TAX REPORTS
-- ==========================================
CREATE TABLE IF NOT EXISTS tax_reports (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id),
    total_omset NUMERIC(12, 2) NOT NULL,
    total_transaksi INTEGER NOT NULL,
    pkp_status VARCHAR(50) NOT NULL,
    estimasi_ppn NUMERIC(12, 2) NOT NULL,
    estimasi_pph NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- RELASI (One-to-Many & One-to-One):
-- ==========================================
-- roles       → users            (one-to-many,  via users.role_id)
-- categories  → products         (one-to-many,  via products.category_id)
-- products    → stocks           (one-to-many,  via stocks.product_id UNIQUE)
-- users       → orders           (one-to-many,  via orders.user_id)
-- products    → order_details    (one-to-many,  via order_details.product_id)
-- orders      → order_details    (one-to-one,  via order_details.order_id)
-- orders      → payments         (one-to-one,   via payments.order_id UNIQUE)
-- payments    → payment_logs     (one-to-one,  via payment_logs.payment_id)
-- payments    → tax_reports      (one-to-one,   via tax_reports.payment_id UNIQUE)
-- ==========================================

-- ==========================================
-- INSERT DATA CONTOH
-- ==========================================

INSERT INTO roles (nama_role) VALUES ('admin'), ('buyer');

INSERT INTO users (nama, email, password, no_telp, role_id, alamat)
VALUES
    ('Admin QDistro', 'admin@qualitydistro.com', '$2b$10$abcdefghij1234567890abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ123456', '081234567890', 1, 'Jl. Raya Distro No. 1'),
    ('Budi Santoso', 'buyer@example.com', '$2b$10$abcdefghij1234567890abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ123456', '081234567891', 2, 'Jl. Pembeli No. 2');

INSERT INTO categories (nama, deskripsi)
VALUES
    ('Kaos', 'Koleksi kaos distro premium'),
    ('Jaket', 'Jaket dan outerwear'),
    ('Aksesoris', 'Aksesoris pelengkap fashion'),
    ('Celana', 'Celana dan bottoms');

INSERT INTO products (nama, deskripsi, harga, size, warna, image_url, category_id)
VALUES
    ('Kaos Distro Katun Premium', 'Kaos berbahan katun combed 30s yang lembut dan nyaman. Desain eksklusif dengan sablon rubber berkualitas tinggi.', 120000, 'L', 'Hitam', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', 1),
    ('Jaket Denim Original', 'Jaket denim original dengan bahan berkualitas. Cocok untuk gaya casual dan formal, tahan lama dan stylish.', 285000, 'M', 'Biru', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop', 2),
    ('Topi Snapback Custom', 'Topi snapback dengan desain custom eksklusif. Bahan premium, nyaman dipakai seharian, cocok untuk segala acara.', 75000, 'All Size', 'Merah', 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop', 3),
    ('Kaos Oversize Streetwear', 'Kaos oversize dengan cutting modern untuk gaya streetwear. Bahan katun premium yang breathable dan nyaman.', 135000, 'XL', 'Putih', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', 1),
    ('Celana Chino Slim Fit', 'Celana chino slim fit dengan bahan stretch yang nyaman. Model timeless cocok untuk berbagai outfit.', 195000, '30', 'Khaki', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop', 4),
    ('Jaket Hoodie Parasut', 'Jaket hoodie berbahan parasut waterproof. Ringan, windproof, dan cocok untuk aktivitas outdoor maupun daily wear.', 245000, 'L', 'Hitam', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', 2),
    ('Gantungan Kunci Kulit', 'Gantungan kunci premium dari kulit asli. Desain minimalis dan elegan, cocok untuk hadiah atau koleksi pribadi.', 35000, 'All Size', 'Coklat', 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop', 3),
    ('Celana Jogger Premium', 'Celana jogger dengan bahan premium dan cutting modern. Nyaman untuk olahraga maupun casual daily activity.', 175000, '32', 'Abu-abu', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop', 4),
    ('Kaos Polo Distro', 'Kaos polo dengan desain distro yang keren. Bahan lacoste premium, nyaman dan tetap stylish untuk berbagai acara.', 145000, 'M', 'Biru Navy', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop', 1),
    ('Jaket Bomber Supreme', 'Jaket bomber dengan desain supreme eksklusif. Bahan berkualitas tinggi dengan detail jahitan rapi dan presisi.', 320000, 'L', 'Hitam', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', 2),
    ('Tas Selempang Canvas', 'Tas selempang canvas dengan desain vintage. Multi-compartment untuk penyimpanan praktis dan organized.', 95000, 'All Size', 'Krem', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', 3),
    ('Celana Cargo Tactical', 'Celana cargo dengan banyak kantong untuk kebutuhan tactical. Bahan ripstop yang kuat dan tahan lama.', 215000, '31', 'Hijau Tua', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop', 4);

INSERT INTO stocks (product_id, jumlah_stok)
VALUES (1, 15),(2, 2),(3, 20),(4, 1),(5, 8),(6, 5),(7, 30),(8, 3),(9, 12),(10, 4),(11, 18),(12, 6),(13, 10),(14, 7);

-- ==========================================
-- INSERT PRODUK TAMBAHAN (untuk melengkapi grid katalog)
-- Jalankan query ini jika tabel products sudah memiliki 12 baris:
-- ==========================================
/*
INSERT INTO products (nama, deskripsi, harga, size, warna, image_url, category_id)
VALUES
    ('Hoodie Fleece Vintage', 'Hoodie fleece dengan desain vintage streetwear. Bahan tebal dan hangat, cocok untuk cuaca dingin.', 275000, 'L', 'Coklat Muda', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop', 2),
    ('Kaos Graphic Art', 'Kaos dengan sablon grafis seni eksklusif. Bahan cotton 30s combed, tebal dan tidak mudah melar.', 115000, 'M', 'Putih', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=400&h=400&fit=crop', 1);

INSERT INTO stocks (product_id, jumlah_stok)
VALUES (13, 10),(14, 7);
*/
