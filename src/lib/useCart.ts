// Re-export dari CartContext agar semua import "@/lib/useCart" tetap berfungsi
export { useCart, CartProvider } from "./CartContext";
export type { CartItem } from "./CartContext";
