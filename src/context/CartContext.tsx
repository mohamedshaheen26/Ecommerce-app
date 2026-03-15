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
    await addToCart(input);
    await refreshCart();
  };

  const updateItemQuantity = async (cartItemId: string, quantity: number) => {
    await updateCartItemQuantity(cartItemId, quantity);
    await refreshCart();
  };

  const removeItem = async (cartItemId: string) => {
    await removeCartItem(cartItemId);
    await refreshCart();
  };

  const clearItems = async () => {
    await clearCart();
    await refreshCart();
  };

  useEffect(() => {
    if (!isAuthReady) return;

    if (!isAuthenticated || !user?.id) {
      stopSubscription();
      setItems([]);
      return;
    }

    refreshCart();

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
