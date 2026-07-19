"use client";

import { useState, useEffect } from "react";

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
}

/* ==========================================
   CUSTOM HOOK - useCart
   ========================================== */

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart dari localStorage saat pertama kali
  useEffect(() => {
    const savedCart = localStorage.getItem("q-distro-cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    }
  }, []);

  // Save cart ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem("q-distro-cart", JSON.stringify(cartItems));

    // Dispatch custom event untuk update navbar
    window.dispatchEvent(new Event("cart-updated"));
  }, [cartItems]);

  // Add item to cart
  function addToCart(item: Omit<CartItem, "quantity">) {
    const existing = cartItems.find((i) => i.id === item.id);

    if (existing) {
      // Cek stok
      if (existing.quantity >= item.stok) {
        alert(`Stok maksimal: ${item.stok}`);
        return false;
      }

      // Update quantity
      setCartItems(
        cartItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      // Tambah item baru
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }

    return true;
  }

  // Remove item from cart
  function removeFromCart(itemId: string) {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  }

  // Update quantity
  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(
      cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }

  // Clear cart
  function clearCart() {
    setCartItems([]);
  }

  // Get total items
  function getTotalItems() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Get total price
  function getTotalPrice() {
    return cartItems.reduce((sum, item) => sum + item.harga * item.quantity, 0);
  }

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };
}
