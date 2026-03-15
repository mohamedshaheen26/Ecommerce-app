import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addToCart,
  clearCart,
  fetchCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "../api/cart";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import type { AddToCartInput, ICartItem } from "../types";

const GUEST_CART_KEY = "guest_cart";

function getGuestCartFromStorage(): ICartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ICartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestCartToStorage(items: ICartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function makeGuestId(productId: string, color: string | null, size: string | null) {
  return `guest_${productId}_${color ?? ""}_${size ?? ""}`;
}

interface CartContextType {
  items: ICartItem[];
  cartCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (input: AddToCartInput) => Promise<void>;
  updateItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearItems: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAuthReady, user } = useAuth();
  const [items, setItems] = useState<ICartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const stopSubscription = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchCartItems();
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addItem = async (input: AddToCartInput) => {
    if (!isAuthenticated) {
      const product = input.product;
      if (!product) {
        throw new Error("Product snapshot required for guest cart");
      }
      const id = makeGuestId(
        input.productId,
        input.selectedColor ?? null,
        input.selectedSize ?? null,
      );
      setItems((prev) => {
        const existing = prev.find((item) => item.id === id);
        let next: ICartItem[];
        if (existing) {
          next = prev.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + input.quantity }
              : item,
          );
        } else {
          const newItem: ICartItem = {
            id,
            user_id: "",
            product_id: input.productId,
            quantity: input.quantity,
            selected_color: input.selectedColor ?? null,
            selected_size: input.selectedSize ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product,
          };
          next = [...prev, newItem];
        }
        saveGuestCartToStorage(next);
        return next;
      });
      return;
    }

    await addToCart(input);
    await refreshCart();
  };

  const updateItemQuantity = async (cartItemId: string, quantity: number) => {
    if (!isAuthenticated) {
      if (quantity < 1) {
        setItems((prev) => {
          const next = prev.filter((item) => item.id !== cartItemId);
          saveGuestCartToStorage(next);
          return next;
        });
        return;
      }
      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity, updated_at: new Date().toISOString() } : item,
        );
        saveGuestCartToStorage(next);
        return next;
      });
      return;
    }

    await updateCartItemQuantity(cartItemId, quantity);
    await refreshCart();
  };

  const removeItem = async (cartItemId: string) => {
    if (!isAuthenticated) {
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== cartItemId);
        saveGuestCartToStorage(next);
        return next;
      });
      return;
    }

    await removeCartItem(cartItemId);
    await refreshCart();
  };

  const clearItems = async () => {
    if (!isAuthenticated) {
      setItems([]);
      saveGuestCartToStorage([]);
      return;
    }

    await clearCart();
    await refreshCart();
  };

  useEffect(() => {
    if (!isAuthReady) return;

    if (!isAuthenticated || !user?.id) {
      stopSubscription();
      const guestItems = getGuestCartFromStorage();
      setItems(guestItems);
      return;
    }

    const guestItems = getGuestCartFromStorage();
    if (guestItems.length > 0) {
      (async () => {
        setIsLoading(true);
        try {
          for (const item of guestItems) {
            await addToCart({
              productId: item.product_id,
              quantity: item.quantity,
              selectedColor: item.selected_color,
              selectedSize: item.selected_size,
            });
          }
          localStorage.removeItem(GUEST_CART_KEY);
          await refreshCart();
        } catch {
          setItems(guestItems);
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      refreshCart();
    }

    stopSubscription();
    const channel = supabase
      .channel(`cart-changes-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refreshCart();
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      stopSubscription();
    };
  }, [isAuthReady, isAuthenticated, user?.id, refreshCart]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        isLoading,
        refreshCart,
        addItem,
        updateItemQuantity,
        removeItem,
        clearItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
