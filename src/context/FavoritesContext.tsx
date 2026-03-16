import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import type { IProduct } from "../types";

const GUEST_FAVORITES_KEY = "guest_favorites";

interface FavoritesContextType {
  favorites: IProduct[];
  favoritesCount: number;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: IProduct) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

function getStorageKey(userId?: string | null) {
  return userId ? `favorites_${userId}` : GUEST_FAVORITES_KEY;
}

function readFavoritesFromStorage(key: string): IProduct[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as IProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavoritesToStorage(key: string, data: IProduct[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore localStorage failures
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAuthReady, user } = useAuth();
  const [favorites, setFavorites] = useState<IProduct[]>([]);

  const currentStorageKey = getStorageKey(isAuthenticated ? user?.id : null);

  useEffect(() => {
    if (!isAuthReady) return;

    if (isAuthenticated && user?.id) {
      const userKey = getStorageKey(user.id);
      const userFavorites = readFavoritesFromStorage(userKey);
      const guestFavorites = readFavoritesFromStorage(GUEST_FAVORITES_KEY);

      const merged = [...userFavorites];
      guestFavorites.forEach((product) => {
        if (!merged.some((item) => item.id === product.id)) {
          merged.push(product);
        }
      });

      setFavorites(merged);
      saveFavoritesToStorage(userKey, merged);
      localStorage.removeItem(GUEST_FAVORITES_KEY);
      return;
    }

    const guestFavorites = readFavoritesFromStorage(GUEST_FAVORITES_KEY);
    setFavorites(guestFavorites);
  }, [isAuthReady, isAuthenticated, user?.id]);

  const persist = (next: IProduct[]) => {
    setFavorites(next);
    saveFavoritesToStorage(currentStorageKey, next);
  };

  const isFavorite = (productId: string) =>
    favorites.some((product) => product.id === productId);

  const toggleFavorite = (product: IProduct) => {
    const exists = isFavorite(product.id);
    if (exists) {
      persist(favorites.filter((item) => item.id !== product.id));
      return;
    }
    persist([product, ...favorites]);
  };

  const removeFavorite = (productId: string) => {
    persist(favorites.filter((item) => item.id !== productId));
  };

  const clearFavorites = () => {
    persist([]);
  };

  const value = useMemo(
    () => ({
      favorites,
      favoritesCount: favorites.length,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [favorites],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
