-- ==========================================
-- FUNGSI RPC UNTUK CHECKOUT PRODUK
-- Menangani Race Condition (Rebutan Stok)
-- ==========================================

-- Fungsi untuk checkout produk dengan pengurangan stok yang aman
-- Mengembalikan TRUE jika berhasil, FALSE jika stok habis
CREATE OR REPLACE FUNCTION checkout_product(p_product_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_stock INTEGER;
    v_updated_rows INTEGER;
BEGIN
    -- Lock baris produk untuk mencegah race condition
    -- UPDATE ... RETURNING akan mengunci baris sampai transaksi selesai

    UPDATE stocks
    SET jumlah_stok = jumlah_stok - 1,
        last_update = CURRENT_TIMESTAMP
    WHERE product_id = p_product_id
      AND jumlah_stok > 0  -- Hanya update jika stok masih ada
    RETURNING jumlah_stok INTO v_current_stock;

    -- Cek apakah ada baris yang ter-update
    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

    -- Jika tidak ada baris ter-update, berarti stok habis
    IF v_updated_rows = 0 THEN
        RETURN FALSE;
    END IF;

    -- Berhasil mengurangi stok
    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        -- Jika ada error, rollback dan return FALSE
        RETURN FALSE;
END;
$$;

-- Contoh penggunaan:
-- SELECT checkout_product(1);  -- Returns TRUE jika berhasil, FALSE jika stok habis

-- ==========================================
-- FUNGSI TAMBAHAN: CEK STOK PRODUK
-- ==========================================

CREATE OR REPLACE FUNCTION check_product_stock(p_product_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock INTEGER;
BEGIN
    SELECT jumlah_stok INTO v_stock
    FROM stocks
    WHERE product_id = p_product_id;

    RETURN COALESCE(v_stock, 0);
END;
$$;

-- Contoh penggunaan:
-- SELECT check_product_stock(1);  -- Returns jumlah stok produk
