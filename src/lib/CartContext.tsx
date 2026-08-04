"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const MAX_QTY = 100;

/* ==========================================
   TIPE DATA
   ========================================== */

export interface CartItem {
  id: string;
  nama: string;
  harga: number;
  image_url: string | null;
  stok: number;
  quantity: number;
  size?: string;
  warna?: string;
  selectedForCheckout?: boolean;
}

interface CartContextValue {
  cartItems: CartItem[];
  selectedItems: CartItem[];
  allSelected: boolean;
  addToCart: (item: Omit<CartItem, "quantity" | "selectedForCheckout">, qty?: number) => boolean;
  removeFromCart: (itemId: string, size?: string, warna?: string) => void;
  updateQuantity: (itemId: string, quantity: number, size?: string, warna?: string) => void;
  toggleSelected: (itemId: string, size?: string, warna?: string) => void;
  selectAll: (selected: boolean) => void;
  clearCart: () => void;
  clearSelected: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

/* ==========================================
   CONTEXT
   ========================================== */

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load dari localStorage setelah mount — aman dari SSR hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("q-distro-cart");
      if (saved) setCartItems(JSON.parse(saved) as CartItem[]);
    } catch {
      // data corrupt, mulai kosong
    }
    setInitialized(true);
  }, []);

  // Sync ke localStorage setelah state berubah (setelah load selesai)
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem("q-distro-cart", JSON.stringify(cartItems));
  }, [cartItems, initialized]);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity" | "selectedForCheckout">, qty = 1): boolean => {
      let reason: "maxqty" | "maxstok" | null = null;
      setCartItems((prev) => {
        const existing = prev.find(
          (i) => i.id === item.id && i.size === item.size && i.warna === item.warna
        );
        if (existing) {
          const newQty = existing.quantity + qty;
          if (item.stok > 0 && newQty > item.stok) { reason = "maxstok"; return prev; }
          if (newQty > MAX_QTY) { reason = "maxqty"; return prev; }
          return prev.map((i) =>
            i.id === item.id && i.size === item.size && i.warna === item.warna
              ? { ...i, quantity: newQty }
              : i
          );
        }
        const clampedQty = item.stok > 0
          ? Math.min(qty, item.stok, MAX_QTY)
          : Math.min(qty, MAX_QTY);
        return [...prev, { ...item, quantity: clampedQty, selectedForCheckout: false }];
      });
      if (reason === "maxstok") { return false; }
      if (reason === "maxqty") { alert(`Maksimal ${MAX_QTY} item per produk.`); return false; }
      return true;
    },
    []
  );

  const removeFromCart = useCallback((itemId: string, size?: string, warna?: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.id === itemId && i.size === size && i.warna === warna))
    );
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, quantity: number, size?: string, warna?: string) => {
      if (quantity <= 0) { removeFromCart(itemId, size, warna); return; }
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId && item.size === size && item.warna === warna
            ? { ...item, quantity: Math.min(quantity, MAX_QTY) }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const toggleSelected = useCallback((itemId: string, size?: string, warna?: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.size === size && item.warna === warna
          ? { ...item, selectedForCheckout: !item.selectedForCheckout }
          : item
      )
    );
  }, []);

  const selectAll = useCallback((selected: boolean) => {
    setCartItems((prev) => prev.map((item) => ({ ...item, selectedForCheckout: selected })));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const clearSelected = useCallback(() => {
    setCartItems((prev) => prev.filter((item) => !item.selectedForCheckout));
  }, []);

  const getTotalItems = useCallback(
    () => cartItems.reduce((s, i) => s + i.quantity, 0),
    [cartItems]
  );

  const getTotalPrice = useCallback(
    () => cartItems
      .filter((i) => i.selectedForCheckout)
      .reduce((s, i) => s + i.harga * i.quantity, 0),
    [cartItems]
  );

  const selectedItems = cartItems.filter((i) => i.selectedForCheckout);
  const allSelected = cartItems.length > 0 && cartItems.every((i) => i.selectedForCheckout);

  return (
    <CartContext.Provider value={{
      cartItems, selectedItems, allSelected,
      addToCart, removeFromCart, updateQuantity,
      toggleSelected, selectAll, clearCart, clearSelected,
      getTotalItems, getTotalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

/* ==========================================
   HOOK — drop-in replacement untuk useCart
   ========================================== */

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus digunakan di dalam CartProvider");
  return ctx;
}
